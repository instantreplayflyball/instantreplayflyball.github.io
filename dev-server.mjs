#!/usr/bin/env node
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const built = path.resolve(__dirname, "_site");
const ROOT = fs.existsSync(path.join(built, "index.html")) ? built : path.resolve(__dirname);
const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  let p = decodeURIComponent((urlPath.split("?")[0] || "/").replace(/\0/g, ""));
  if (p === "/") return path.join(ROOT, "index.html");
  const rel = p.replace(/^\/+/, "");
  let full = path.resolve(ROOT, rel);
  if (!full.startsWith(ROOT)) return null;
  try {
    const st = fs.statSync(full);
    if (st.isDirectory()) full = path.join(full, "index.html");
  } catch {
    return null;
  }
  return full;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }
  const file = resolveFile(req.url);
  if (!file) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    if (req.method === "HEAD") {
      res.writeHead(200);
      res.end();
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log("Instant Replay site → http://" + HOST + ":" + PORT + "/");
  console.log("Press Ctrl+C to stop.");
});
