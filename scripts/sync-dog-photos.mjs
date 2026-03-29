#!/usr/bin/env node
/**
 * Pairs dogs on each legacy handler page with the first N large <img> files (in document order),
 * updates src/_data/team.json photo fields, and prints cp commands for missing images.
 *
 * Run from project root:
 *   node scripts/sync-dog-photos.mjs
 * Then copy files it lists from IR_Website (or run with --copy if paths exist).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { slugifyDogName } from "./lib/slug-dog-name.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const legacyDir =
  process.env.IR_LEGACY ||
  path.join(process.env.HOME, "Documents", "IR_Website", "Site_Update_July2017", "index_files");
const destDir = path.join(root, "images", "dogs");

const PAGES = [
  ["Page600.htm", "Tammy & Henry Frank"],
  ["Page607.htm", "Kelly Ciggaar & Marty Murdock"],
  ["Page522.htm", "Marg"],
  ["Page1660.htm", "Theresa"],
  ["Page720.htm", "Chris"],
  ["Page421.htm", "Ridley"],
  ["Page1213.htm", "Kate"],
  ["Page1230.htm", "Lucin"],
  ["Page459.htm", "Bob"],
  ["Page749.htm", "Lauren"],
  ["Page616.htm", "Mary"],
  ["Page827.htm", "Jay-Jay"],
  ["Page1563.htm", "Alumni"],
  ["Page1938.htm", "Kelly & Dave"],
];

function dogNames(html) {
  const names = [];
  const reDog = /<h5>[\s\S]*?<\/h5>/g;
  let m;
  while ((m = reDog.exec(html))) {
    const name = m[0]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (name.includes("Return to Team")) continue;
    names.push(name);
  }
  return names;
}

function largeImages(html) {
  const re = /<img[^>]+width=(\d+)[^>]+src=([a-z0-9]+\.jpg)/gi;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    if (+m[1] < 175) continue;
    if (m[2].startsWith("image298")) continue;
    if (seen.has(m[2])) continue;
    seen.add(m[2]);
    out.push(m[2]);
  }
  return out;
}

function normDog(s) {
  return s
    .replace(/[\u201c\u201d\u2018\u2019\u00a0]/g, " ")
    .replace(/[""'']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const pairs = [];
for (const [file, handler] of PAGES) {
  const fp = path.join(legacyDir, file);
  if (!fs.existsSync(fp)) {
    console.warn("Skip (missing file):", fp);
    continue;
  }
  const html = fs.readFileSync(fp, "utf8");
  const dogs = dogNames(html);
  const imgs = largeImages(html);
  const n = Math.min(dogs.length, imgs.length);
  for (let i = 0; i < n; i++) {
    pairs.push({
      handler,
      dogRaw: dogs[i],
      dogNorm: normDog(dogs[i]),
      file: imgs[i],
    });
  }
}

const key = (handler, dog) => `${handler}|||${normDog(dog)}`;

const map = new Map();
for (const p of pairs) {
  map.set(key(p.handler, p.dogRaw), p.file);
  map.set(key(p.handler, p.dogNorm), p.file);
}

const teamPath = path.join(root, "src", "_data", "team.json");
const data = JSON.parse(fs.readFileSync(teamPath, "utf8"));
const members = data.members || [];
let matched = 0;

for (const m of members) {
  const h = String(m.handler || "").trim();
  const d = String(m.dog || "").trim();
  let img = map.get(key(h, d)) || map.get(`${h}|||${normDog(d)}`);
  if (img) {
    const ext = path.extname(img) || ".jpg";
    m.photo = `images/dogs/dog-${slugifyDogName(d)}${ext}`;
    m.photoAlt = `${d} — ${h}`;
    matched++;
  }
}

fs.writeFileSync(teamPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Updated team.json photo paths for", matched, "of", members.length, "dogs.");

fs.mkdirSync(destDir, { recursive: true });
let copied = 0;
for (const m of members) {
  const h = String(m.handler || "").trim();
  const d = String(m.dog || "").trim();
  const legacyFile = map.get(key(h, d)) || map.get(`${h}|||${normDog(d)}`);
  if (!legacyFile || !m.photo) continue;
  const src = path.join(legacyDir, legacyFile);
  const dst = path.join(destDir, path.basename(m.photo));
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    copied++;
  } else {
    console.warn("Missing source (copy manually):", src);
  }
}
console.log("Copied", copied, "images to", destDir);
