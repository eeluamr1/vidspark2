import { spawn } from "child_process";
import fs from "fs";

export async function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", ["-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => { stderr += d.toString(); });
    p.on("close", (code) => {
      if (code === 0) resolve({ ok: true });
      else reject(new Error(`ffmpeg failed (code ${code}): ${stderr.slice(-2000)}`));
    });
  });
}

export async function makeThumbnail(inputVideo, outputPng) {
  await runFfmpeg([
    "-i", inputVideo,
    "-ss", "00:00:00.500",
    "-vframes", "1",
    "-vf", "scale=720:-1",
    outputPng
  ]);
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
