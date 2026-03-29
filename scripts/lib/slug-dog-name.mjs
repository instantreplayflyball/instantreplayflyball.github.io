/**
 * URL-safe filename slug from a dog call name (e.g. for images/dogs/dog-{slug}.jpg).
 */
export function slugifyDogName(dog) {
  let s = String(dog)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[\u201C\u201D\u2018\u2019\u0022\u0027]/g, "");
  s = s.replace(/\(([^)]*)\)/g, (_, inner) => {
    const innerSlug = inner
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return innerSlug ? `-${innerSlug}` : "";
  });
  s = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "dog";
}
