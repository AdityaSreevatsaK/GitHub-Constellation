"""Optional deterministic, GitHub-compatible GIF exports of the offline Constellation SVGs.

Use after ``node export.mjs``. No GitHub token or
network services are needed for rendering. Requires Pillow, Playwright and
its installed Chromium browser. GIF is used because GitHub's SVG proxy may
suppress SMIL/CSS motion inside README images.
"""
from __future__ import annotations

import argparse
from io import BytesIO
import os
from pathlib import Path
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
DESIGNS = ("comet", "cartographer", "starforge")
THEMES = ("night", "paper")
LOOP_SECONDS = 16


def frame_durations(fps: int, seconds: int = LOOP_SECONDS) -> list[int]:
    """Exact loop duration, even for rates such as 3 FPS that don't divide 1000."""
    if not isinstance(fps, int) or not 2 <= fps <= 12 or seconds <= 0:
        raise ValueError("FPS must be an integer from 2 to 12")
    return [round((n + 1) * 1000 / fps) - round(n * 1000 / fps)
            for n in range(seconds * fps)]


def save_gif(frames: list, target: Path, fps: int, *, colours: int = 96) -> None:
    """One shared palette and explicitly coalesced identical frames retain a full loop."""
    from PIL import Image

    durations = frame_durations(fps)
    if len(frames) != len(durations):
        raise ValueError("Every 16-second interval must have a rendered frame")
    if not 16 <= colours <= 256:
        raise ValueError("GIF palette size must be 16-256 colours")
    w, h = frames[0].size
    if any(f.size != (w, h) for f in frames):
        raise ValueError("GIF frames must have equal dimensions")
    montage = Image.new("RGB", (w * 2, h * 2))
    for i, frame in enumerate((0, len(frames)//4, len(frames)//2, 3*len(frames)//4)):
        montage.paste(frames[frame], ((i % 2) * w, (i // 2) * h))
    palette = montage.quantize(colors=colours, method=Image.Quantize.MEDIANCUT)
    indexed = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    # Pillow may discard identical trailing frames. Group and accumulate their
    # duration explicitly, so a 16-second 2 FPS sweep never ends at 13.5 sec.
    packed, times = [], []
    for frame, duration in zip(indexed, durations):
        if packed and frame.tobytes() == packed[-1].tobytes():
            times[-1] += duration
        else:
            packed.append(frame)
            times.append(duration)
    target.parent.mkdir(parents=True, exist_ok=True)
    packed[0].save(target, save_all=True, append_images=packed[1:],
                   optimize=True, duration=times, loop=0, disposal=2)
    # Verify actual encoded timing and motion rather than trusting the encoder.
    with Image.open(target) as result:
        total = 0
        snapshots = set()
        for i in range(result.n_frames):
            result.seek(i)
            total += result.info.get("duration", 0)
            snapshots.add(result.convert("RGB").tobytes())
        if abs(total - LOOP_SECONDS * 1000) > 20:
            raise RuntimeError(f"GIF loop duration is {total}ms instead of 16000ms: {target}")
        if len(snapshots) < 2:
            raise RuntimeError(f"Animation collapsed into a still: {target}")


def export_gifs(source: Path, target: Path, *, fps: int = 2, width: int = 720,
                designs: tuple[str, ...] = DESIGNS,
                themes: tuple[str, ...] = THEMES) -> list[Path]:
    try:
        from PIL import Image
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "Install the optional tools: py -3 -m pip install pillow playwright; "
            "py -3 -m playwright install chromium"
        ) from exc
    if not isinstance(width, int) or not 480 <= width <= 1200:
        raise ValueError("GIF width must be 480-1200 pixels")
    frame_durations(fps)
    if any(name not in DESIGNS for name in designs) or any(name not in THEMES for name in themes):
        raise ValueError("Unknown design or theme")
    outputs = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True,
            executable_path=os.environ.get("CONSTELLATION_CHROMIUM") or None)
        try:
            page = browser.new_page(viewport={"width": 1200, "height": 390},
                device_scale_factor=1, reduced_motion="no-preference")
            for theme in themes:
                for design in designs:
                    asset = source / f"{design}-{theme}-animated.svg"
                    if not asset.is_file():
                        raise FileNotFoundError(f"Missing {asset}; run export.mjs first")
                    svg = asset.read_text(encoding="utf-8")
                    root = ET.fromstring(svg)
                    if not root.tag.endswith('svg') or root.attrib.get('data-design') != design or root.attrib.get('data-theme') != theme:
                        raise ValueError(f"SVG metadata does not match asset filename: {asset}")
                    page.set_content(f'<html><body style="margin:0">{svg}</body></html>')
                    selector = page.locator('svg')
                    rendered = []
                    for i in range(LOOP_SECONDS * fps):
                        # Control both SVG/SMIL and CSS timelines explicitly.
                        page.evaluate("t => {const svg=document.querySelector('svg'); "
                            "svg.setCurrentTime(t);svg.pauseAnimations();"
                            "for(const animation of document.getAnimations()){"
                            "animation.pause();animation.currentTime=t*1000;}}", i / fps)
                        png = selector.screenshot(type='png', animations='allow')
                        frame = Image.open(BytesIO(png)).convert('RGB')
                        if width != 1200:
                            frame = frame.resize((width, round(width * 390 / 1200)),
                                                 Image.Resampling.LANCZOS)
                        rendered.append(frame)
                    destination = target / f"{design}-{theme}.gif"
                    save_gif(rendered, destination, fps)
                    outputs.append(destination)
                    print(f"{destination} ({destination.stat().st_size // 1024} KiB)")
        finally:
            browser.close()
    return outputs


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Render six native 16-second GitHub README GIF loops")
    parser.add_argument('--source', type=Path, default=HERE / 'assets' / 'stress')
    parser.add_argument('--out', type=Path, default=None)
    parser.add_argument('--fps', type=int, default=2)
    parser.add_argument('--width', type=int, default=720)
    parser.add_argument('--design', choices=DESIGNS)
    parser.add_argument('--theme', choices=THEMES)
    args = parser.parse_args()
    export_gifs(args.source, args.out or args.source, fps=args.fps, width=args.width,
                designs=(args.design,) if args.design else DESIGNS,
                themes=(args.theme,) if args.theme else THEMES)
