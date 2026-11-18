"""Optional dependency-light unit tests for the README GIF export encoder."""
import sys
import tempfile
import unittest
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    Image = None

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from export_gif import LOOP_SECONDS, frame_durations, save_gif


class GifExportTests(unittest.TestCase):
    def test_exact_frame_duration_for_non_integer_millisecond_fps(self):
        for fps in (2, 3, 7, 12):
            durations = frame_durations(fps)
            self.assertEqual(len(durations), LOOP_SECONDS * fps)
            self.assertEqual(sum(durations), LOOP_SECONDS * 1000)
            self.assertGreater(min(durations), 0)

    def test_bad_fps_is_rejected(self):
        for fps in (0, -1, 1, 13, 3.5, "3"):
            with self.assertRaises(ValueError):
                frame_durations(fps)

    @unittest.skipUnless(Image, "Pillow not installed; GIF exporter is optional")
    def test_identical_trailing_frames_preserve_full_loop(self):
        # A reveal animation that ends in a static hold must not loop early.
        frames = []
        for i in range(LOOP_SECONDS * 2):
            colour = (15, 30, 50) if i < 4 else (90, 190, 175)
            frames.append(Image.new("RGB", (48, 24), colour))
        with tempfile.TemporaryDirectory() as tmp:
            result = Path(tmp) / "loop.gif"
            save_gif(frames, result, 2)
            with Image.open(result) as gif:
                self.assertGreater(gif.n_frames, 1)
                self.assertEqual(gif.size, (48, 24))
                durations = []
                images = []
                for i in range(gif.n_frames):
                    gif.seek(i)
                    durations.append(gif.info["duration"])
                    images.append(gif.convert("RGB"))
                self.assertEqual(sum(durations), 16000)
                self.assertTrue(any(ImageChops.difference(a, b).getbbox()
                                    for a, b in zip(images, images[1:])))

    @unittest.skipUnless(Image, "Pillow not installed; GIF exporter is optional")
    def test_malformed_frame_sequences_rejected(self):
        a = Image.new("RGB", (40, 20), "#0d1b30")
        b = Image.new("RGB", (41, 20), "#0d1b30")
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "broken.gif"
            with self.assertRaises(ValueError):
                save_gif([a], target, 2)
            with self.assertRaises(ValueError):
                save_gif([a] * 31 + [b], target, 2)
            with self.assertRaises(ValueError):
                save_gif([a] * 32, target, 2, colours=3)

    @unittest.skipUnless(Image, "Pillow not installed; GIF exporter is optional")
    def test_six_showcase_gifs_have_valid_complete_motion(self):
        assets = Path(__file__).resolve().parents[1] / "assets" / "stress"
        gifs = [assets / f"{design}-{theme}.gif"
                for theme in ("night", "paper")
                for design in ("comet", "cartographer", "starforge")]
        if not all(p.exists() for p in gifs):
            self.skipTest("Generated GIFs not checked out; run export_gif.py")
        for path in gifs:
            with self.subTest(asset=path.name), Image.open(path) as gif:
                self.assertEqual(gif.size, (720, 234))
                self.assertGreaterEqual(gif.n_frames, 8)
                total = 0
                first = None
                changed = False
                for i in range(gif.n_frames):
                    gif.seek(i)
                    total += gif.info["duration"]
                    if first is None:
                        first = gif.convert("RGB")
                    elif not changed:
                        changed = bool(ImageChops.difference(first, gif.convert("RGB")).getbbox())
                self.assertEqual(total, 16000)
                self.assertTrue(changed)
                self.assertLess(path.stat().st_size, 3 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
