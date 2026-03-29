#!/usr/bin/env node
/**
 * Renames brand + dog photos to predictable paths and updates src/_data/team.json.
 * Safe to re-run: skips entries already using images/dogs/dog-*.jpg.
 *
 *   node scripts/normalize-image-assets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { slugifyDogName } from "./lib/slug-dog-name.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "images");
const dogsDir = path.join(imagesDir, "dogs");
const teamPath = path.join(root, "src", "_data", "team.json");

function renameIfExists(from, to) {
  if (!fs.existsSync(from)) return false;
  if (fs.existsSync(to) && path.resolve(from) !== path.resolve(to)) {
    console.warn("Skip (target exists):", to);
    return false;
  }
  fs.renameSync(from, to);
  return true;
}

function main() {
  const logoOld = path.join(imagesDir, "INSTANT_REPLAY_FLYBALL.svg");
  const logoNew = path.join(imagesDir, "logo-instant-replay-flyball.svg");
  if (renameIfExists(logoOld, logoNew)) {
    console.log("Renamed logo → logo-instant-replay-flyball.svg");
  }

  const ballOld = path.join(imagesDir, "IR_Tennis_Ball.png");
  const ballNew = path.join(imagesDir, "brand-tennis-ball.png");
  if (renameIfExists(ballOld, ballNew)) {
    console.log("Renamed tennis ball → brand-tennis-ball.png");
  }

  const data = JSON.parse(fs.readFileSync(teamPath, "utf8"));
  const members = data.members || [];

  const byBasename = new Map();
  for (const m of members) {
    const ph = (m.photo || "").trim();
    if (!ph.startsWith("images/dogs/")) continue;
    const base = path.basename(ph);
    if (base.startsWith("dog-")) continue;
    if (!byBasename.has(base)) byBasename.set(base, []);
    byBasename.get(base).push(m);
  }

  for (const [oldBase, group] of byBasename) {
    const oldPath = path.join(dogsDir, oldBase);
    if (!fs.existsSync(oldPath)) {
      console.warn("Missing dog image:", oldPath);
      continue;
    }
    group.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999));
    const ext = path.extname(oldBase) || ".jpg";

    const first = group[0];
    const slug0 = slugifyDogName(first.dog);
    const newBase0 = `dog-${slug0}${ext}`;
    const newPath0 = path.join(dogsDir, newBase0);

    fs.renameSync(oldPath, newPath0);
    first.photo = `images/dogs/${newBase0}`;
    console.log(`${oldBase} → ${newBase0}`);

    for (let i = 1; i < group.length; i++) {
      const m = group[i];
      const slug = slugifyDogName(m.dog);
      const newBase = `dog-${slug}${ext}`;
      const newPath = path.join(dogsDir, newBase);
      fs.copyFileSync(newPath0, newPath);
      m.photo = `images/dogs/${newBase}`;
      console.log(`  (copy shared file) → ${newBase}`);
    }
  }

  fs.writeFileSync(teamPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Updated", teamPath);

  const refBasenames = new Set();
  for (const m of members) {
    const ph = (m.photo || "").trim();
    if (ph.startsWith("images/dogs/")) refBasenames.add(path.basename(ph));
  }

  if (fs.existsSync(dogsDir)) {
    for (const f of fs.readdirSync(dogsDir)) {
      if (!f.match(/^image\d+\./i) && !f.match(/^image_minx_fallback/i)) continue;
      const fp = path.join(dogsDir, f);
      if (!refBasenames.has(f)) {
        fs.unlinkSync(fp);
        console.log("Removed orphan:", f);
      }
    }
  }
}

main();
