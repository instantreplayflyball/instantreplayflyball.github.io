#!/usr/bin/env python3
"""
Regenerate src/_data/homeCarousel.json slide *paths* from files in images/home/.
Preserves labels for hero-* and facebook-* if present; other files get generic Club photo labels.
Run from repo root: python3 scripts/sync-home-carousel-slides.py
"""
from __future__ import annotations

import glob
import json
import os

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
IMG_DIR = os.path.join(ROOT, "images", "home")
OUT = os.path.join(ROOT, "src", "_data", "homeCarousel.json")

EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def sort_key(name: str) -> tuple:
    if name.startswith("hero-"):
        return (0, name)
    if name.startswith("facebook-"):
        return (1, name)
    return (2, name)


def main() -> None:
    names = []
    for p in glob.glob(os.path.join(IMG_DIR, "*")):
        if not os.path.isfile(p):
            continue
        base = os.path.basename(p)
        if base.startswith("."):
            continue
        ext = os.path.splitext(base)[1].lower()
        if ext in EXT:
            names.append(base)
    names.sort(key=sort_key)

    prev: dict | None = None
    if os.path.isfile(OUT):
        with open(OUT, encoding="utf-8") as f:
            prev = json.load(f)
    old_by_src = {}
    if prev and isinstance(prev.get("slides"), list):
        for s in prev["slides"]:
            if isinstance(s, dict) and s.get("src"):
                old_by_src[s["src"]] = s

    slides = []
    for name in names:
        src = f"images/home/{name}"
        if src in old_by_src:
            slides.append(dict(old_by_src[src]))
            continue
        if name.startswith("hero-"):
            slides.append(
                {
                    "src": src,
                    "label": "Team moment",
                    "alt": "Instant Replay Flyball — team photo",
                }
            )
        elif name.startswith("facebook-"):
            slides.append(
                {
                    "src": src,
                    "label": "Club",
                    "alt": "Instant Replay Flyball — club photo",
                }
            )
        else:
            slides.append(
                {
                    "src": src,
                    "label": "Club photo",
                    "alt": "Instant Replay Flyball — club photo",
                }
            )

    out = {
        "_note": "Regenerate paths with: python3 scripts/sync-home-carousel-slides.py",
        "slides": slides,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {len(slides)} slides to {OUT}")


if __name__ == "__main__":
    main()
