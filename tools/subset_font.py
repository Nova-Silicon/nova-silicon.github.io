#!/usr/bin/env python3
"""Refresh the site's local Chinese font subset after editing its copy."""

import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--font", type=Path, required=True, help="Full Noto Sans SC TTF file")
    args = parser.parse_args()
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
    except ImportError:
        parser.exit(1, "Install the maintenance dependencies: python3 -m pip install fonttools brotli\n")

    root = Path(__file__).resolve().parents[1]
    source = "".join(p.read_text(encoding="utf-8") for p in root.glob("*.html"))
    source += "".join(p.read_text(encoding="utf-8") for p in root.glob("*.js"))
    font = TTFont(args.font)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    sub = subset.Subsetter(options=options)
    sub.populate(text=source)
    sub.subset(font)
    font.flavor = "woff2"
    destination = root / "assets" / "noto-sans-sc-subset.woff2"
    font.save(destination)
    from refresh_assets import refresh
    refresh(root)
    print(f"Updated {destination.name} ({destination.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
