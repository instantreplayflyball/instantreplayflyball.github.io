/**
 * Public display: drop the last word of each handler segment (surname).
 * "Janice Ridley" → "Janice"
 * "Kelly & Marty Murdock" → "Kelly & Marty"
 * Single-word names are unchanged.
 */
export function handlerDisplayName(handler) {
  const s = String(handler ?? "").trim();
  if (!s) return "";
  const parts = s.split(/\s*&\s*/).map((p) => p.trim()).filter(Boolean);
  const stripped = parts.map((part) => {
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length <= 1) return part;
    return words.slice(0, -1).join(" ");
  });
  return stripped.join(" & ");
}
