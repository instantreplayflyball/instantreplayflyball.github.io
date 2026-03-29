#!/usr/bin/env python3
"""
Organize Old_Site Files/: themed folders + clearer filenames.
Run: python3 scripts/organize-old-site-files.py
"""
from __future__ import annotations

import os
import re
import shutil
import sys

BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "Old_Site Files"))


def mkdir(p: str) -> None:
    os.makedirs(p, exist_ok=True)


def safe_move(src: str, dst: str) -> None:
    if not os.path.isfile(src):
        print(f"  skip (missing): {src}", file=sys.stderr)
        return
    mkdir(os.path.dirname(dst))
    if os.path.abspath(src) == os.path.abspath(dst):
        return
    if os.path.exists(dst):
        root, ext = os.path.splitext(dst)
        n = 2
        while os.path.exists(f"{root}-{n}{ext}"):
            n += 1
        dst = f"{root}-{n}{ext}"
    shutil.move(src, dst)
    rel = os.path.relpath(dst, BASE)
    print(f"  -> {rel}")


def main() -> None:
    if not os.path.isdir(BASE):
        print(f"Not found: {BASE}", file=sys.stderr)
        sys.exit(1)

    brand = os.path.join(BASE, "brand")
    people = os.path.join(BASE, "people-handlers")
    dogs = os.path.join(BASE, "dogs-fletch")
    raptors = os.path.join(BASE, "raptors-booth-photos")
    events = os.path.join(BASE, "events")
    camera = os.path.join(BASE, "camera-roll")
    fb = os.path.join(BASE, "facebook-wix-archive")
    legacy = os.path.join(BASE, "misc-legacy-ids")
    unlabeled = os.path.join(BASE, "unlabeled")
    heic = os.path.join(BASE, "heic-originals")
    gifs = os.path.join(BASE, "gifs")
    archives = os.path.join(BASE, "archives")
    for d in (
        brand,
        people,
        dogs,
        raptors,
        events,
        camera,
        fb,
        legacy,
        unlabeled,
        heic,
        gifs,
        archives,
    ):
        mkdir(d)

    explicit: list[tuple[str, str]] = [
        ("IR_Tennis_Ball.png", "brand/ir-tennis-ball-graphic.png"),
        ("ancaster.png", "brand/ancaster-graphic.png"),
        ("ancaster_fairgrounds.jpg", "brand/ancaster-fairgrounds.jpg"),
        ("Amelie.jpg", "people-handlers/amelie.jpg"),
        ("jen.jpg", "people-handlers/jen.jpg"),
        ("kate.jpg", "people-handlers/kate.jpg"),
        ("lauren.jpg", "people-handlers/lauren.jpg"),
        ("mary.jpg", "people-handlers/mary.jpg"),
        ("melissa.jpg", "people-handlers/melissa.jpg"),
        ("michelle.jpg", "people-handlers/michelle.jpg"),
        ("natasha.jpg", "people-handlers/natasha.jpg"),
        ("ridleys.jpg", "people-handlers/ridleys-family.jpg"),
        ("trish_kevin.jpg", "people-handlers/trish-and-kevin.jpg"),
        ("Mick1.jpg", "people-handlers/mick.jpg"),
        ("Fletch1JPG.JPG", "dogs-fletch/fletch-01.jpg"),
        ("Fletch2.JPG", "dogs-fletch/fletch-02.jpg"),
        ("Fletch3.JPG", "dogs-fletch/fletch-03.jpg"),
        ("Fletch4.jpg", "dogs-fletch/fletch-04.jpg"),
        ("raptors.jpg", "raptors-booth-photos/raptors-00.jpg"),
        ("raptors1.jpg", "raptors-booth-photos/raptors-01.jpg"),
        ("raptors2.jpg", "raptors-booth-photos/raptors-02.jpg"),
        ("raptors3.jpg", "raptors-booth-photos/raptors-03.jpg"),
        ("raptors4.jpg", "raptors-booth-photos/raptors-04.jpg"),
        ("raptors5.jpg", "raptors-booth-photos/raptors-05.jpg"),
        ("raptors6.jpg", "raptors-booth-photos/raptors-06.jpg"),
        ("25yr_anniv.jpg", "events/25-year-anniversary.jpg"),
        ("July2017_BragBoard.jpg", "events/brag-board-2017-07.jpg"),
        ("June2017_BragBoard.jpg", "events/brag-board-2017-06.jpg"),
        ("panther_table1.jpg", "events/panther-booth-table.jpg"),
        ("Untitled.jpg", "unlabeled/unlabeled-01.jpg"),
        ("Untitled.png", "unlabeled/unlabeled-02.png"),
        ("pic4.jpg", "unlabeled/pic4-original.jpg"),
        ("pic4_edited.jpg", "unlabeled/pic4-edited.jpg"),
        ("IMG_4916.HEIC.heif", "heic-originals/IMG_4916.HEIC.heif"),
        ("IMG_4952.HEIC.heif", "heic-originals/IMG_4952.HEIC.heif"),
    ]

    explicit_src = {a for a, _ in explicit}

    print("1) Named / explicit moves…")
    for rel_src, rel_dst in explicit:
        safe_move(os.path.join(BASE, rel_src), os.path.join(BASE, rel_dst))

    zip_path = os.path.join(BASE, "instantreplayflyba-1.zip")
    if os.path.isfile(zip_path):
        print("2) Zip archive…")
        safe_move(zip_path, os.path.join(archives, "instantreplayflyba-1.zip"))

    uuid_start = re.compile(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I
    )

    def is_facebook_style(name: str) -> bool:
        n = name.lower()
        if re.match(r"^\d{8,}_", name):
            return True
        if "_n." in n or "_o." in n or "_n_" in n or "_o_" in n:
            return True
        if n.endswith("_n_edited.png") or "_o_edited" in n:
            return True
        return False

    print("3) Remaining root files…")
    for name in sorted(os.listdir(BASE)):
        if name in explicit_src or name == "instantreplayflyba-1.zip":
            continue
        path = os.path.join(BASE, name)
        if not os.path.isfile(path) or name.startswith("."):
            continue
        if name == ".DS_Store":
            continue

        if name.startswith("IMG_"):
            new = (
                name.replace("_edited_edited", "-edited-x2")
                .replace("_edited", "-edited")
            )
            safe_move(path, os.path.join(camera, new))
            continue

        if uuid_start.match(name) or name.startswith("3cb0e19a"):
            short = re.split(r"[\s.]", name)[0][:20].replace(" ", "")
            _, ext = os.path.splitext(name)
            safe_move(path, os.path.join(legacy, f"legacy-id-{short}{ext}"))

        elif is_facebook_style(name):
            safe_move(path, os.path.join(fb, name.replace(" ", "-")))

        elif re.match(r"^57827270725", name) or re.match(r"^[a-f0-9-]{36}", name, re.I):
            safe_move(
                path,
                os.path.join(legacy, f"legacy-{name.replace(' ', '-')}"),
            )

        else:
            safe_move(path, os.path.join(legacy, f"legacy-other-{name.replace(' ', '-')}"))

    # Wix export subfolder
    old_wix = os.path.join(BASE, "instantreplayflyba-1")
    if os.path.isdir(old_wix):
        print("4) instantreplayflyba-1/ folder…")
        files = sorted(
            f
            for f in os.listdir(old_wix)
            if not f.startswith(".") and os.path.isfile(os.path.join(old_wix, f))
        )
        for i, name in enumerate(files, start=1):
            src = os.path.join(old_wix, name)
            lower = name.lower()
            if lower.endswith(".gif"):
                dst = os.path.join(gifs, f"wix-legacy-gif-{i:03d}.gif")
            else:
                _, ext = os.path.splitext(name)
                ext = ext.lower()
                if ext == ".jpeg":
                    ext = ".jpg"
                if ext not in (".jpg", ".png", ".gif"):
                    ext = ".bin"
                dst = os.path.join(fb, f"wix-export-{i:03d}{ext}")
            safe_move(src, dst)
        try:
            os.rmdir(old_wix)
        except OSError:
            print(f"  (folder not empty: {old_wix})", file=sys.stderr)

    print("Done. Remaining at top level (should be folders only):")
    for x in sorted(os.listdir(BASE)):
        p = os.path.join(BASE, x)
        t = "dir" if os.path.isdir(p) else "file"
        print(f"  [{t}] {x}")


if __name__ == "__main__":
    main()
