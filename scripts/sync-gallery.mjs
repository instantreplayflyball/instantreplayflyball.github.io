#!/usr/bin/env node
/**
 * Copies legacy gallery images into images/gallery/ with readable names and writes src/_data/gallery.json.
 * Names encode source: random (Page501), caledonia-20th (Page1323), raptors-demo (Page334), alumni (Page1563).
 *
 *   node scripts/sync-gallery.mjs
 *
 * Override: IR_LEGACY=/path/to/index_files node scripts/sync-gallery.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const legacyDir =
  process.env.IR_LEGACY ||
  path.join(process.env.HOME, "Documents", "IR_Website", "Site_Update_July2017", "index_files");
const destDir = path.join(root, "images", "gallery");
const outJson = path.join(root, "src", "_data", "gallery.json");

const EXCLUDE = new Set([
  "image323.png",
  "image327.png",
  "image440.png",
  "image1962.png",
  "image627.png",
  "image1929.png",
  "image1936.png",
  "image2981.jpg",
  "image298.jpg",
]);

const PAGE_CONFIG = [
  { file: "Page501.htm", prefix: "gallery-random", alt: "Instant Replay — random pictures (archive)" },
  {
    file: "Page1323.htm",
    prefix: "gallery-caledonia-20th",
    alt: "Instant Replay — Caledonia 20th anniversary (archive)",
  },
  { file: "Page334.htm", prefix: "gallery-raptors-demo", alt: "Instant Replay — Raptors demo (archive)" },
  { file: "Page1563.htm", prefix: "gallery-alumni", alt: "Instant Replay — alumni (archive)" },
];

function collectImagesOrdered(html) {
  const re =
    /(?:src=|imagedata\s[^>]*\ssrc=)["']?(image\d+\.(?:jpg|jpeg|png))/gi;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const name = m[1];
    if (EXCLUDE.has(name.toLowerCase())) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function main() {
  if (!fs.existsSync(legacyDir)) {
    console.error("Legacy folder not found:", legacyDir);
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });

  const assigned = new Map();
  const assignOrder = [];
  const counters = Object.fromEntries(PAGE_CONFIG.map((p) => [p.prefix, 0]));

  for (const cfg of PAGE_CONFIG) {
    const fp = path.join(legacyDir, cfg.file);
    if (!fs.existsSync(fp)) {
      console.warn("Skip missing page:", cfg.file);
      continue;
    }
    const html = fs.readFileSync(fp, "utf8");
    for (const name of collectImagesOrdered(html)) {
      if (assigned.has(name)) continue;
      counters[cfg.prefix] += 1;
      const n = counters[cfg.prefix];
      const ext = path.extname(name);
      const newName = `${cfg.prefix}-${String(n).padStart(2, "0")}${ext}`;
      assigned.set(name, { newName, alt: cfg.alt });
      assignOrder.push(name);
    }
  }

  const images = [];
  let copied = 0;
  let missing = 0;

  for (const legacyName of assignOrder) {
    const { newName, alt } = assigned.get(legacyName);
    const src = path.join(legacyDir, legacyName);
    if (!fs.existsSync(src)) {
      missing++;
      console.warn("Missing file:", legacyName);
      continue;
    }
    const dst = path.join(destDir, newName);
    fs.copyFileSync(src, dst);
    copied++;
    images.push({
      src: `images/gallery/${newName}`,
      alt,
    });
  }

  const payload = {
    _source: `Synced from ${PAGE_CONFIG.map((p) => p.file).join(", ")}. Live site: https://www.instantreplayflyball.org/pictures--video — re-run after updating the legacy export.`,
    images,
    videos: [],
  };
  fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n", "utf8");

  for (const f of fs.readdirSync(destDir)) {
    if (!images.some((im) => im.src.endsWith(f))) {
      fs.unlinkSync(path.join(destDir, f));
      console.log("Removed stale gallery file:", f);
    }
  }

  console.log(
    `Wrote ${images.length} images to gallery.json, copied ${copied} (${missing} missing).`
  );
}

main();
