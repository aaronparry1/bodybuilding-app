from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
PACK = Path(__file__).resolve().parent
OUT = PACK / "6.9-inch"
MANIFEST = PACK / "source-manifest.json"

WIDTH = 1320
HEIGHT = 2868

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"

BG = (5, 8, 13)
PANEL = (14, 23, 36)
PANEL_2 = (19, 28, 42)
GOLD = (226, 189, 107)
GOLD_DEEP = (142, 106, 46)
CREAM = (245, 240, 232)
MUTED = (155, 167, 185)


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if text_size(draw, trial, fnt)[0] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_height: int,
) -> int:
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_height
    return y


def vertical_gradient() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    px = img.load()
    for y in range(HEIGHT):
        t = y / HEIGHT
        for x in range(WIDTH):
            dx = (x - WIDTH * 0.73) / WIDTH
            dy = (y - HEIGHT * 0.26) / HEIGHT
            glow = max(0.0, 1.0 - math.sqrt(dx * dx + dy * dy) * 2.2)
            gold_glow = max(0.0, 1.0 - math.sqrt(((x - WIDTH * 0.12) / WIDTH) ** 2 + ((y - HEIGHT * 0.82) / HEIGHT) ** 2) * 2.5)
            r = int(BG[0] + 16 * glow + 20 * gold_glow + 3 * t)
            g = int(BG[1] + 20 * glow + 14 * gold_glow + 3 * t)
            b = int(BG[2] + 28 * glow + 4 * gold_glow + 5 * t)
            px[x, y] = (r, g, b)
    return img


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def shadow(canvas: Image.Image, box: tuple[int, int, int, int], radius: int, opacity: int = 145) -> None:
    x1, y1, x2, y2 = box
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(box, radius=radius, fill=(0, 0, 0, opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(34))
    canvas.alpha_composite(layer)


def crop_source(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGB")
    w, h = src.size
    # Remove simulator/QA chrome from the proof image. The final card is marketing-first,
    # so the app screen supports the message without showing debug-only bars.
    top = int(h * 0.16)
    bottom = int(h * 0.79)
    left = int(w * 0.035)
    right = int(w * 0.965)
    return src.crop((left, top, right, bottom))


def fit_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    w, h = img.size
    tw, th = size
    scale = max(tw / w, th / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def fit_contain(img: Image.Image, size: tuple[int, int], fill: tuple[int, int, int] = (2, 4, 8)) -> Image.Image:
    w, h = img.size
    tw, th = size
    scale = min(tw / w, th / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGB", size, fill)
    out.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
    return out


def paste_phone(canvas: Image.Image, source_path: Path, x: int, y: int, w: int, h: int) -> None:
    shadow(canvas, (x - 8, y + 18, x + w + 8, y + h + 34), 86, opacity=160)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle((x - 8, y - 8, x + w + 8, y + h + 8), radius=88, fill=(2, 4, 8), outline=(64, 75, 92), width=3)
    screen = fit_contain(crop_source(source_path), (w, h))
    mask = rounded_mask((w, h), 78)
    canvas.paste(screen, (x, y), mask)
    # Hide any remaining source status/debug strips with a subtle phone top/bottom crop frame.
    d.rounded_rectangle((x, y, x + w, y + 66), radius=70, fill=(2, 4, 8))
    d.rounded_rectangle((x, y + h - 50, x + w, y + h), radius=70, fill=(2, 4, 8))
    d.rounded_rectangle((x + w // 2 - 78, y + 22, x + w // 2 + 78, y + 48), radius=16, fill=(0, 0, 0))


def draw_brand(draw: ImageDraw.ImageDraw) -> None:
    badge_font = font(FONT_BLACK, 36)
    label_font = font(FONT_BOLD, 32)
    x, y = 74, 86
    draw.rounded_rectangle((x, y, x + 88, y + 88), radius=24, fill=(10, 16, 25), outline=GOLD, width=3)
    draw.text((x + 18, y + 24), "ASC", font=font(FONT_BLACK, 22), fill=GOLD)
    draw.text((x + 112, y + 6), "Adaptive Strength Coach", font=label_font, fill=CREAM)
    draw.text((x + 112, y + 48), "Auto-Regulated Strength Training", font=font(FONT_REGULAR, 27), fill=MUTED)


def draw_proof_chip(draw: ImageDraw.ImageDraw, label: str) -> None:
    f = font(FONT_BOLD, 28)
    tw, _ = text_size(draw, label.upper(), f)
    x, y = 76, 1818
    draw.rounded_rectangle((x, y, x + tw + 58, y + 58), radius=29, fill=(27, 35, 49), outline=(73, 60, 37), width=2)
    draw.text((x + 29, y + 13), label.upper(), font=f, fill=GOLD)


def draw_card(spec: dict) -> Image.Image:
    canvas = vertical_gradient().convert("RGBA")
    d = ImageDraw.Draw(canvas)

    # Premium gold sweep behind the phone and headline.
    accent = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    ad = ImageDraw.Draw(accent)
    ad.ellipse((640, 1240, 1680, 2280), outline=(*GOLD, 82), width=12)
    ad.ellipse((-420, 1980, 540, 2940), outline=(*GOLD_DEEP, 80), width=10)
    accent = accent.filter(ImageFilter.GaussianBlur(1))
    canvas.alpha_composite(accent)

    draw_brand(d)

    x = 76
    y = 315
    max_width = 1120
    headline = spec["headline"]
    headline_font = font(FONT_BLACK, 84)
    # Keep all headline words intact on narrow App Store screenshots.
    while max(text_size(d, line, headline_font)[0] for line in wrap_text(d, headline, headline_font, max_width)) > max_width:
        headline_font = font(FONT_BLACK, headline_font.size - 4)
    y = draw_wrapped(d, (x, y), headline, headline_font, CREAM, max_width, headline_font.size + 13)
    y += 36
    y = draw_wrapped(d, (x, y), spec["subheading"], font(FONT_BOLD, 43), GOLD, 1010, 58)

    # Benefit proof panel.
    panel_y = y + 52
    d.rounded_rectangle((76, panel_y, 1208, panel_y + 190), radius=42, fill=(*PANEL, 226), outline=(52, 62, 80), width=2)
    d.text((124, panel_y + 42), spec["proofTitle"], font=font(FONT_BOLD, 34), fill=CREAM)
    d.text((124, panel_y + 94), spec["proofBody"], font=font(FONT_REGULAR, 31), fill=MUTED)

    # Phone proof image is intentionally supporting, not the whole story.
    phone_w, phone_h = 610, 1180
    paste_phone(canvas, ROOT / spec["source"], 590, 1430, phone_w, phone_h)
    draw_proof_chip(d, spec["proofLabel"])

    # Left outcome card for visual weight and quick scan.
    d.rounded_rectangle((76, 1932, 542, 2348), radius=48, fill=(*PANEL_2, 236), outline=(61, 70, 86), width=2)
    d.text((124, 1988), "COACHED", font=font(FONT_BLACK, 44), fill=GOLD)
    d.text((124, 2052), "progress", font=font(FONT_BLACK, 69), fill=CREAM)
    d.line((124, 2164, 494, 2164), fill=GOLD_DEEP, width=4)
    d.text((124, 2212), "Plan. Train.", font=font(FONT_BOLD, 37), fill=CREAM)
    d.text((124, 2264), "Adjust.", font=font(FONT_BOLD, 37), fill=CREAM)

    # Footer.
    d.text((76, 2632), "Adaptive Strength Coach", font=font(FONT_BOLD, 38), fill=CREAM)
    d.text((76, 2684), "adaptivestrengthcoach.com/download", font=font(FONT_REGULAR, 30), fill=MUTED)
    return canvas.convert("RGB")


def write_copy_doc(specs: Iterable[dict]) -> None:
    lines = [
        "# App Store Screenshot Copy",
        "",
        "Upload order: 1 through 7. The sequence sells the promise first, then proof, structure, progress tracking, recovery intelligence, powerlifting specificity, and workout feedback.",
        "",
    ]
    for i, spec in enumerate(specs, start=1):
        lines += [
            f"## {i}. {spec['file']}",
            "",
            f"Headline: {spec['headline']}",
            "",
            f"Subheading: {spec['subheading']}",
            "",
            f"Proof screen: {spec['proofLabel']}",
            "",
            f"Purpose: {spec['purpose']}",
            "",
        ]
    (PACK / "screenshot-copy.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for spec in manifest["screenshots"]:
        img = draw_card(spec)
        img.save(OUT / spec["file"], quality=96)
        print(OUT / spec["file"])
    write_copy_doc(manifest["screenshots"])


if __name__ == "__main__":
    main()
