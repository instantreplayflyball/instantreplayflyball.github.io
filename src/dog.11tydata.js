import { handlerDisplayName } from "../scripts/lib/handler-display.mjs";

export default {
  layout: "layout.njk",
  current: "athletes",
  eleventyComputed: {
    title: (data) =>
      data.member && data.member.dog
        ? `${data.member.dog} | Instant Replay Flyball`
        : "Instant Replay Flyball",
    description: (data) => {
      const m = data.member;
      if (!m || !m.dog) return "";
      const h = m.handler
        ? ` Handler: ${handlerDisplayName(m.handler)}.`
        : "";
      return `${m.dog} — Instant Replay Flyball, Caledonia, Ontario.${h}`;
    },
  },
};
