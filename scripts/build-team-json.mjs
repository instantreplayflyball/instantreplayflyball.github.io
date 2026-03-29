#!/usr/bin/env node
/**
 * Regenerates src/_data/team.json from the embedded roster only (clears all photo paths).
 * Prefer editing team.json directly. Afterward: node scripts/sync-dog-photos.mjs then
 * node scripts/normalize-image-assets.mjs (or set photo paths to images/dogs/dog-{slug}.jpg by hand).
 *
 *   node scripts/build-team-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const bio =
  "Races with Instant Replay (Caledonia, Ontario). Personal bios were mostly photos on the legacy site — edit this line in src/_data/team.json anytime.";

const rows = [
  ["Tammy & Henry Frank", "JAG"],
  ["Tammy & Henry Frank", "QUEST"],
  ["Tammy & Henry Frank", "EDGE"],
  ["Tammy & Henry Frank", 'BOSTON (“BOSS”)'],
  ["Kelly Ciggaar & Marty Murdock", "MYLES"],
  ["Kelly Ciggaar & Marty Murdock", "DICE"],
  ["Kelly Ciggaar & Marty Murdock", "JAX"],
  ["Kelly Ciggaar & Marty Murdock", "JIVE"],
  ["Marg", "VEGAS"],
  ["Marg", "MICK"],
  ["Marg", "FLETCHER"],
  ["Marg", "GEMMA"],
  ["Theresa", "INFINITI"],
  ["Theresa", "NOVEL"],
  ["Theresa", "SAXEN"],
  ["Theresa", "TEVA"],
  ["Theresa", "WiFi"],
  ["Theresa", "THRILL"],
  ["Chris", "SETNA"],
  ["Chris", "DAKRA"],
  ["Chris", "TALOS"],
  ["Ridley", "PROPHET"],
  ["Ridley", "GRIMM"],
  ["Ridley", "CAMOUFLAGE"],
  ["Kate", "EVE-L"],
  ["Lucin", "PANTHER"],
  ["Lucin", "ERROW"],
  ["Lucin", "FYURIE"],
  ["Lucin", "MINX"],
  ["Bob", "SCOTTY"],
  ["Lauren", "PEACH JUICE"],
  ["Lauren", "TRIX"],
  ["Lauren", "APPLE SNAPPLE"],
  ["Lauren", "CREDIT"],
  ["Mary", "CASTAWAY"],
  ["Mary", "ESME"],
  ["Mary", "VANQUISH"],
  ["Jay-Jay", "FUN"],
  ["Jay-Jay", "SIR"],
  ["Alumni", "LEROY"],
  ["Alumni", "RUMOUR"],
  ["Alumni", "PAISLEY"],
  ["Alumni", "PHEONIX"],
  ["Alumni", "KAYZA"],
  ["Kelly & Dave", "KELLA"],
];

const members = rows.map(([handler, dog], i) => ({
  order: i + 1,
  handler,
  dog,
  bio,
  photo: "",
  photoAlt: "",
}));

const out = {
  _source:
    "Roster template from July 2017 IR_Website export. Photos: run scripts/sync-dog-photos.mjs, then scripts/normalize-image-assets.mjs, or set images/dogs/dog-{slug}.jpg in team.json.",
  members,
};

fs.writeFileSync(
  path.join(root, "src", "_data", "team.json"),
  JSON.stringify(out, null, 2) + "\n",
  "utf8"
);
console.log("Wrote src/_data/team.json with", members.length, "dogs.");
