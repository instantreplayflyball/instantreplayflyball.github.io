# Where this content came from

- **Team roster (`team.json`)** — Dog names and handler groupings were reconstructed from the Microsoft Publisher / FrontPage–style export in  
  `~/Documents/IR_Website/Site_Update_July2017/index_files/`  
  (handler pages like `Page600.htm` “Tammy’s Dogs”, `Page607.htm`, etc.). Bios were not on the old pages; placeholder copy was added so you can edit per dog in JSON.

- **Tournaments (`events.json`)** — Intro text, secretary email **kellyciggaar@gmail.com**, and the 2017 weekend listings were taken from `Page954.htm` in that same folder.

- **About / contact** — Paragraphs and **tammyfrank63@yahoo.ca** came from `Page384.htm` (About) and `Page434.htm` (Contact).

**Before going live:** Confirm all email addresses and tournament dates; remove or refresh the 2017 archive block when you no longer want it public.

Regenerate only the roster **structure** (clears photos) with `node scripts/build-team-json.mjs`.  
Re-link photos from the legacy export: `node scripts/sync-dog-photos.mjs`, then normalize filenames with `node scripts/normalize-image-assets.mjs`.  
Gallery images: `node scripts/sync-gallery.mjs`.
