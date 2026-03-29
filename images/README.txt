Asset naming (edit paths in JSON/HTML if you replace files):

- logo-instant-replay-flyball.svg — header logo on every page
- brand-tennis-ball.png — Pictures & Video intro graphic
- dogs/dog-{slug}.jpg — roster photos; slug matches call name (see src/_data/team.json)
- gallery/gallery-{topic}-{nn}.jpg|png — archive photos (see src/_data/gallery.json)

Regenerate from July 2017 export:
  node scripts/sync-dog-photos.mjs
  node scripts/sync-gallery.mjs

Rename dog + brand files to match slugs (after changing src/_data/team.json paths):
  node scripts/normalize-image-assets.mjs
