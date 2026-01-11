import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { videosRouter } from "./routes/videos.js";
import { initDb } from "./lib/db.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

initDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => res.json({ ok: true, name: "VidSpark API" }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/videos", videosRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VidSpark API running on http://localhost:${PORT}`);
});
