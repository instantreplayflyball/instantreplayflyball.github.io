#!/usr/bin/env node
/**
 * Builds src/_data/team.json from a roster CSV filled out by the team.
 *
 *   node scripts/import-team-csv.mjs data/my-roster.csv
 *   node scripts/import-team-csv.mjs data/my-roster.csv --dry-run
 *
 * CSV columns (header row required): order, handler, dog, breed, bio, photo, photoAlt
 * Extra columns are ignored. Column names are case-insensitive.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { slugifyDogName } from "./lib/slug-dog-name.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const teamPath = path.join(root, "src", "_data", "team.json");

/** Minimal RFC-style CSV parse (quoted fields, commas, CRLF) */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const len = text.length;

  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
  return rows;
}

function normHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
  const dry = process.argv.includes("--dry-run");
  const csvPath = args[0]
    ? path.resolve(args[0])
    : path.join(root, "data", "team-roster-template.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }

  let raw = fs.readFileSync(csvPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

  const table = parseCSV(raw);
  if (table.length < 2) {
    console.error("CSV needs a header row and at least one data row.");
    process.exit(1);
  }

  const headers = table[0].map(normHeader);
  const idx = (name) => headers.indexOf(name);

  const oi = idx("order");
  const hi = idx("handler");
  const di = idx("dog");
  const bi = idx("breed");
  const bioi = idx("bio");
  const pi = idx("photo");
  const ai = idx("photoalt");

  if (hi < 0 || di < 0 || bioi < 0) {
    console.error('CSV must include columns: handler, dog, bio (and optional: order, breed, photo, photoAlt)');
    process.exit(1);
  }

  let prev = {};
  if (fs.existsSync(teamPath)) {
    try {
      prev = JSON.parse(fs.readFileSync(teamPath, "utf8"));
    } catch {
      prev = {};
    }
  }

  const members = [];
  let rowNum = 1;

  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    const dog = String(cells[di] ?? "").trim();
    const handler = String(cells[hi] ?? "").trim();
    const bio = String(cells[bioi] ?? "").trim();

    if (!dog && !handler && !bio) continue;

    if (!dog || !handler) {
      console.warn(`Skipping row ${r + 1}: need both handler and dog.`);
      continue;
    }

    const breed = bi >= 0 ? String(cells[bi] ?? "").trim() : "";
    let photo = pi >= 0 ? String(cells[pi] ?? "").trim() : "";
    let photoAlt = ai >= 0 ? String(cells[ai] ?? "").trim() : "";

    if (photo && !photo.includes("/")) {
      photo = `images/dogs/${photo.replace(/^\//, "")}`;
    }

    if (!photo) {
      const slug = slugifyDogName(dog);
      const guess = path.join(root, "images", "dogs", `dog-${slug}.jpg`);
      if (fs.existsSync(guess)) {
        photo = `images/dogs/dog-${slug}.jpg`;
      }
    }

    if (!photoAlt) photoAlt = `${dog} — ${handler}`;

    let order = rowNum;
    if (oi >= 0 && String(cells[oi] ?? "").trim() !== "") {
      const n = parseInt(String(cells[oi]).trim(), 10);
      if (!Number.isNaN(n)) order = n;
    }

    const entry = {
      order,
      handler,
      dog,
      bio: bio || `Races with Instant Replay Flyball in Caledonia, Ontario.`,
      photo,
      photoAlt,
    };
    if (breed) entry.breed = breed;

    members.push(entry);
    rowNum++;
  }

  const out = {
    _source: `Imported from ${path.basename(csvPath)}. Edit src/_data/team.json or re-export CSV and run scripts/import-team-csv.mjs.`,
    rosterSort: prev.rosterSort || "alphabetical",
    members,
  };

  const json = JSON.stringify(out, null, 2) + "\n";

  if (dry) {
    console.log(json);
    console.error(`\nDry run: ${members.length} dogs (no file written).`);
    return;
  }

  fs.writeFileSync(teamPath, json, "utf8");
  console.log(`Wrote ${teamPath} with ${members.length} dogs.`);
}

main();
