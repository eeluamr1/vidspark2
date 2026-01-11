import { Router } from "express";
import { getDb } from "../lib/db.js";
import { authMiddleware } from "../lib/auth.js";

export const usersRouter = Router();

usersRouter.get("/me", authMiddleware, (req, res) => {
  const db = getDb();
  const me = db.prepare(`SELECT id, username, display_name, bio, created_at FROM users WHERE id = ?`).get(req.user.id);
  return res.json({ user: me });
});

usersRouter.get("/:username", (req, res) => {
  const db = getDb();
  const u = db.prepare(`SELECT id, username, display_name, bio, created_at FROM users WHERE username = ?`).get(req.params.username.toLowerCase());
  if (!u) return res.status(404).json({ error: "Not found" });

  const followers = db.prepare(`SELECT COUNT(*) as c FROM follows WHERE following_id = ?`).get(u.id).c;
  const following = db.prepare(`SELECT COUNT(*) as c FROM follows WHERE follower_id = ?`).get(u.id).c;

  return res.json({ user: u, counts: { followers, following } });
});

usersRouter.post("/:userId/follow", authMiddleware, (req, res) => {
  const db = getDb();
  const targetId = req.params.userId;
  if (targetId === req.user.id) return res.status(400).json({ error: "Can't follow yourself" });

  const created_at = new Date().toISOString();
  try {
    db.prepare(`INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`)
      .run(req.user.id, targetId, created_at);
  } catch {}
  return res.json({ ok: true });
});

usersRouter.delete("/:userId/follow", authMiddleware, (req, res) => {
  const db = getDb();
  db.prepare(`DELETE FROM follows WHERE follower_id = ? AND following_id = ?`).run(req.user.id, req.params.userId);
  return res.json({ ok: true });
});
