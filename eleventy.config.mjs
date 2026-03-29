import { slugifyDogName } from "./scripts/lib/slug-dog-name.mjs";

function sortKeyDogName(dog) {
  const s = String(dog || "").toUpperCase();
  const cut = s.indexOf("(");
  return (cut >= 0 ? s.slice(0, cut) : s).replace(/['"]/g, "").trim() || "\uFFFF";
}

function compareMembers(a, b, mode) {
  if (mode === "order") {
    const oa = Number(a.order) || 999;
    const ob = Number(b.order) || 999;
    if (oa !== ob) return oa - ob;
    return sortKeyDogName(a.dog).localeCompare(sortKeyDogName(b.dog));
  }
  if (mode === "breed") {
    const ba = String(a.breed || "").trim() || "\uFFFF";
    const bb = String(b.breed || "").trim() || "\uFFFF";
    if (ba !== bb) return ba.localeCompare(bb, undefined, { sensitivity: "base" });
    return sortKeyDogName(a.dog).localeCompare(sortKeyDogName(b.dog));
  }
  return sortKeyDogName(a.dog).localeCompare(sortKeyDogName(b.dog));
}

/** @param {unknown} member */
function memberDogSlug(member) {
  const dog =
    member && typeof member === "object" && "dog" in member
      ? /** @type {{ dog?: string }} */ (member).dog
      : member;
  return slugifyDogName(dog);
}

/** @param {unknown} entry */
function youtubeEmbedUrl(entry) {
  if (!entry || typeof entry !== "object") return null;
  const e = /** @type {{ youtubeId?: string; url?: string }} */ (entry);
  if (e.youtubeId && String(e.youtubeId).trim()) {
    const id = String(e.youtubeId).trim();
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
  }
  const u = String(e.url || "").trim();
  const m = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return m
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(m[1])}`
    : null;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  eleventyConfig.addFilter("trim", (s) => String(s ?? "").trim());

  eleventyConfig.addFilter("dogSlug", memberDogSlug);

  eleventyConfig.addFilter("sortTeamMembers", (members, rosterSort) => {
    const list = Array.isArray(members) ? [...members] : [];
    const raw = String(rosterSort || "alphabetical").toLowerCase();
    const mode =
      raw === "breed" || raw === "order" ? raw : "alphabetical";
    return list.sort((a, b) => compareMembers(a, b, mode));
  });

  eleventyConfig.addFilter("sortEvents", (items) => {
    const list = Array.isArray(items) ? [...items] : [];
    return list.sort(
      (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
    );
  });

  eleventyConfig.addFilter("bioLines", (text) => {
    return String(text || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  });

  eleventyConfig.addFilter("youtubeEmbed", youtubeEmbedUrl);

  eleventyConfig.addFilter("filterYoutubeEmbeds", (videos) => {
    if (!Array.isArray(videos)) return [];
    return videos.filter((v) => youtubeEmbedUrl(v));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: "",
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
