import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { getDb } from "../lib/db.js";
import { authMiddleware } from "../lib/auth.js";
import { ensureDir, runFfmpeg, makeThumbnail } from "../lib/media.js";

export const videosRouter = Router();

const uploadsRoot = path.join(process.cwd(), "uploads");
const videosDir = path.join(uploadsRoot, "videos");
const thumbsDir = path.join(uploadsRoot, "thumbs");
const tempDir = path.join(uploadsRoot, "temp");
ensureDir(videosDir); ensureDir(thumbsDir); ensureDir(tempDir);

const upload = multer({ dest: tempDir, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB

function toPublicUrl(relPath) {
  const base = process.env.BASE_URL || "http://localhost:4000";
  return `${base}/${relPath.replace(/\\/g, "/")}`;
}

videosRouter.get("/", (req, res) => {
  const db = getDb();
  const q = (req.query.q || "").toString().trim();
  const sql = q
    ? `SELECT v.*, u.username, u.display_name FROM videos v JOIN users u ON u.id=v.owner_id WHERE v.caption LIKE ? OR v.hashtags LIKE ? ORDER BY v.created_at DESC LIMIT 50`
    : `SELECT v.*, u.username, u.display_name FROM videos v JOIN users u ON u.id=v.owner_id ORDER BY v.created_at DESC LIMIT 50`;

  const rows = q
    ? db.prepare(sql).all(`%${q}%`, `%${q}%`)
    : db.prepare(sql).all();

  const out = rows.map(r => ({
    id: r.id,
    owner: { id: r.owner_id, username: r.username, displayName: r.display_name },
    kind: r.kind,
    caption: r.caption || "",
    hashtags: (r.hashtags || "").split(",").map(s => s.trim()).filter(Boolean),
    videoUrl: toPublicUrl(r.video_path),
    thumbUrl: r.thumb_path ? toPublicUrl(r.thumb_path) : null,
    createdAt: r.created_at
  }));

  return res.json({ videos: out });
});

videosRouter.get("/:id", (req, res) => {
  const db = getDb();
  const r = db.prepare(`SELECT v.*, u.username, u.display_name FROM videos v JOIN users u ON u.id=v.owner_id WHERE v.id=?`).get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });

  const likes = db.prepare(`SELECT COUNT(*) as c FROM likes WHERE video_id=?`).get(r.id).c;
  const comments = db.prepare(`
    SELECT c.id, c.text, c.created_at, u.username, u.display_name
    FROM comments c JOIN users u ON u.id=c.user_id
    WHERE c.video_id=? ORDER BY c.created_at DESC LIMIT 50
  `).all(r.id);

  return res.json({
    video: {
      id: r.id,
      owner: { id: r.owner_id, username: r.username, displayName: r.display_name },
      kind: r.kind,
      caption: r.caption || "",
      hashtags: (r.hashtags || "").split(",").map(s => s.trim()).filter(Boolean),
      videoUrl: toPublicUrl(r.video_path),
      thumbUrl: r.thumb_path ? toPublicUrl(r.thumb_path) : null,
      createdAt: r.created_at
    },
    stats: { likes },
    comments: comments.map(c => ({
      id: c.id,
      text: c.text,
      createdAt: c.created_at,
      user: { username: c.username, displayName: c.display_name }
    }))
  });
});

videosRouter.post("/upload", authMiddleware, upload.single("video"), async (req, res) => {
  const { caption = "", hashtags = "" } = req.body || {};
  if (!req.file) return res.status(400).json({ error: "Missing video file" });

  const id = nanoid();
  const ext = path.extname(req.file.originalname || "") || ".mp4";
  const finalVideoRel = path.join("uploads", "videos", `${id}${ext}`).replace(/\\/g,"/");
  const finalVideoAbs = path.join(process.cwd(), finalVideoRel);

  fs.renameSync(req.file.path, finalVideoAbs);

  const thumbRel = path.join("uploads", "thumbs", `${id}.png`).replace(/\\/g,"/");
  const thumbAbs = path.join(process.cwd(), thumbRel);
  try { await makeThumbnail(finalVideoAbs, thumbAbs); } catch {}

  const db = getDb();
  db.prepare(`
    INSERT INTO videos (id, owner_id, kind, caption, hashtags, video_path, thumb_path, created_at)
    VALUES (?, ?, 'upload', ?, ?, ?, ?, ?)
  `).run(id, req.user.id, caption, hashtags, finalVideoRel, thumbRel, new Date().toISOString());

  return res.json({ ok: true, id });
});

videosRouter.post("/:id/like", authMiddleware, (req, res) => {
  const db = getDb();
  try {
    db.prepare(`INSERT INTO likes (user_id, video_id, created_at) VALUES (?, ?, ?)`)
      .run(req.user.id, req.params.id, new Date().toISOString());
  } catch {}
  return res.json({ ok: true });
});

videosRouter.delete("/:id/like", authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM likes WHERE user_id=? AND video_id=?`).run(req.user.id, req.params.id);
  return res.json({ ok: true });
});

videosRouter.post("/:id/comment", authMiddleware, (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "text required" });

  const db = getDb();
  const id = nanoid();
  db.prepare(`INSERT INTO comments (id, video_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, req.params.id, req.user.id, text.trim(), new Date().toISOString());

  return res.json({ ok: true, id });
});

videosRouter.post("/generate", authMiddleware, upload.fields([
  { name: "images", maxCount: 20 },
  { name: "audio", maxCount: 1 }
]), async (req, res) => {
  const images = (req.files?.images || []);
  const audio = (req.files?.audio || [])[0] || null;
  const { caption = "", hashtags = "", secondsPerImage = "2" } = req.body || {};

  if (!images.length) return res.status(400).json({ error: "Upload at least 1 image" });

  const id = nanoid();
  const workDir = path.join(tempDir, `gen_${id}`);
  ensureDir(workDir);

  const listPath = path.join(workDir, "list.txt");
  let list = "";
  for (let i=0; i<images.length; i++) {
    const f = images[i];
    const dst = path.join(workDir, `img_${String(i).padStart(3,'0')}${path.extname(f.originalname||".jpg") || ".jpg"}`);
    fs.renameSync(f.path, dst);
    list += `file '${dst.replace(/'/g, "'\\''")}'\n`;
    list += `duration ${Number(secondsPerImage) || 2}\n`;
  }
  const lastImg = path.join(workDir, `img_${String(images.length-1).padStart(3,'0')}${path.extname(images[images.length-1].originalname||".jpg") || ".jpg"}`);
  list += `file '${lastImg.replace(/'/g, "'\\''")}'\n`;
  fs.writeFileSync(listPath, list);

  const outRel = path.join("uploads","videos",`${id}.mp4`).replace(/\\/g,"/");
  const outAbs = path.join(process.cwd(), outRel);

  const args = [
    "-f","concat","-safe","0",
    "-i", listPath,
    "-vf","scale=720:-2,format=yuv420p",
    "-r","30"
  ];

  if (audio) {
    const audioDst = path.join(workDir, `audio${path.extname(audio.originalname||".mp3") || ".mp3"}`);
    fs.renameSync(audio.path, audioDst);
    args.push("-i", audioDst, "-shortest", "-c:a", "aac");
  }

  args.push("-c:v","libx264", outAbs);

  try {
    await runFfmpeg(args);
  } catch (e) {
    return res.status(500).json({ error: "FFmpeg failed", details: e.message });
  }

  const thumbRel = path.join("uploads", "thumbs", `${id}.png`).replace(/\\/g,"/");
  const thumbAbs = path.join(process.cwd(), thumbRel);
  try { await makeThumbnail(outAbs, thumbAbs); } catch {}

  const db = getDb();
  db.prepare(`
    INSERT INTO videos (id, owner_id, kind, caption, hashtags, video_path, thumb_path, created_at)
    VALUES (?, ?, 'generated', ?, ?, ?, ?, ?)
  `).run(id, req.user.id, caption, hashtags, outRel, thumbRel, new Date().toISOString());

  try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}

  return res.json({ ok: true, id });
});
