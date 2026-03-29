# Instant Replay Flyball — static site (Eleventy)

The site is built with **[Eleventy](https://www.11ty.dev/)** (Nunjucks templates). Roster, tournaments, and gallery content live in **`src/_data/`** as JSON and are rendered at build time. CSS, client JS, and images stay in **`css/`**, **`js/`**, and **`images/`** and are copied into **`_site/`** on build.

## Repo naming & GitHub Pages

For a **user/org site** at `https://instantreplayflyball.github.io/`, create a **public** repository named **`instantreplayflyball.github.io`** under the `instantreplayflyball` org and push this project. **`pathPrefix`** is empty (root URL), so no extra base-path configuration is needed.

**Deploy with GitHub Actions** (included):

1. Push the default branch (workflow expects **`main`**).
2. In the repo: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. The workflow **Deploy site to GitHub Pages** builds with `npm ci` and `npm run build`, uploads **`_site`**, and publishes.

**Custom domain (e.g. Wix DNS):** In GitHub Pages settings, set the custom hostname and add the DNS records GitHub shows. Optionally add a `CNAME` file in **`src/`** and list it in **`eleventy.config.mjs`** under `addPassthroughCopy` when you are ready (not required for the default `github.io` URL).

## Commands

| Command | Purpose |
|--------|---------|
| `npm install` | Install dev dependencies (Eleventy). |
| `npm run build` | Write the static site to **`_site/`**. |
| `npm start` / `npm run serve` | Build and serve with live reload (default **http://127.0.0.1:8080**). |
| After `npm run build` | Optional: `npx serve _site` to preview the static output only (no rebuild loop). |

## Source layout

| Path | Purpose |
|------|---------|
| `src/_includes/layout.njk` | Shared header, nav, footer. |
| `src/*.njk` | Pages (`index`, `athletes`, `tournaments`, `gallery`, `about`). |
| `src/dog.njk` | Paginated **per-dog** pages at **`/dogs/{slug}/`**. |
| `src/_data/team.json` | Roster (`members`, `rosterSort`, …). |
| `src/_data/events.json` | Tournaments copy and lists. |
| `src/_data/gallery.json` | Gallery images + optional YouTube `videos`. |
| `css/`, `js/`, `images/` | Static assets (passthrough). |

## Customize

1. **Social links** — Search for `facebook.com` and `x.com` in **`src/_includes/layout.njk`** (and **`src/about.njk`** if needed).
2. **Contact / about copy** — Edit **`src/about.njk`** and **`src/_data/events.json`** as needed.
3. **Latest / home blurb** — Edit **`src/index.njk`**.
4. **Gallery** — Edit **`src/_data/gallery.json`**; put files under **`images/gallery/`**. Run **`node scripts/sync-gallery.mjs`** after updating a legacy export.
5. **Dog photos** — Paths like **`images/dogs/dog-{slug}.jpg`** (slug from call name; see **`scripts/lib/slug-dog-name.mjs`**). Run **`node scripts/normalize-image-assets.mjs`** if you still have old `imageNNN` names.

## Team roster

Edit **`src/_data/team.json`** (or use CSV import). You do **not** edit **`src/athletes.njk`** for each dog.

**CSV workflow:** Use **`data/team-roster-template.csv`** and **`data/team-roster-README.txt`**. Then:

```bash
node scripts/import-team-csv.mjs path/to/your-file.csv
npm run build
```

Each dog gets a profile URL **`/dogs/<slug>/`** (slug from `dog` name). Athletes cards link there when a photo is present.

The **Athletes** page includes client-side **search** (dog, handler, breed text), a **breed** dropdown (built from non-empty `breed` fields), and **sort** (dog A–Z, handler A–Z, breed A–Z, or roster order using the `order` field). Default sort matches **`rosterSort`** in **`team.json`** (`alphabetical` → dog A–Z, `breed`, or `order`).

## Tournaments

Edit **`src/_data/events.json`** (intro, secretary, `upcoming`, `archive`), then rebuild.

## Legacy import notes

Roster, about copy, and 2017 tournament rows came from **`IR_Website`** (see **`data/SOURCE.md`**). Verify emails and dates before publishing.

## Fonts

Uses Google Fonts (Bebas Neue + Source Sans 3). For offline use, download fonts and swap the `<link>` for local `@font-face` rules.
