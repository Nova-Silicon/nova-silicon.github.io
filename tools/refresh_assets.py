#!/usr/bin/env python3
"""Version local CSS/JavaScript/font URLs so a new page loads matching assets."""

import hashlib
from pathlib import Path
import re


def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


def refresh(root):
    css_path = root / "styles.css"
    css = css_path.read_text(encoding="utf-8")
    font_version = fingerprint(root / "assets" / "noto-sans-sc-subset.woff2")
    css = re.sub(
        r"(assets/noto-sans-sc-subset\.woff2)(?:\?v=[a-f0-9]+)?",
        lambda match: f"{match[1]}?v={font_version}",
        css,
    )
    css_path.write_text(css, encoding="utf-8")

    html_path = root / "index.html"
    html = html_path.read_text(encoding="utf-8")
    for name in ("styles.css", "showcase.js", "main.js"):
        version = fingerprint(root / name)
        html = re.sub(
            rf'((?:href|src)="){re.escape(name)}(?:\?v=[a-f0-9]+)?(")',
            lambda match: f"{match[1]}{name}?v={version}{match[2]}",
            html,
        )
    html_path.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    refresh(Path(__file__).resolve().parents[1])
    print("Refreshed CSS, JavaScript and font URL versions.")
