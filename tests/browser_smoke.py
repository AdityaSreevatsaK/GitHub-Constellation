"""Offline Chromium smoke suite. Optional: pip install playwright; python -m playwright install chromium."""
from __future__ import annotations

import base64
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONCEPT = ROOT


def offline_preview() -> str:
    """Inline module and synthetic fixtures for network-restricted browsers."""
    html = (CONCEPT / "preview.html").read_text(encoding="utf-8")
    module = base64.b64encode((CONCEPT / "engine.mjs").read_bytes()).decode("ascii")
    source = "data:text/javascript;base64," + module
    html = html.replace("from './engine.mjs'", "from '" + source + "'")
    if source not in html:
        raise AssertionError("Cannot inject the renderer module")
    fixtures = {
        "shared": json.loads((ROOT / "fixtures/demo-activity.json").read_text(encoding="utf-8")),
        "stress": json.loads((CONCEPT / "fixtures/streak-demo.json").read_text(encoding="utf-8")),
    }
    data = json.dumps(fixtures, separators=(",", ":")).replace("<", r"\u003c")
    prelude = "const offlineFixtures=" + data + "; const fetch=async url=>({ok:true,json:async()=>url.includes('streak')?offlineFixtures.stress:offlineFixtures.shared});"
    return html.replace("  const engine=constellationEngine();", prelude + "\n  const engine=constellationEngine();")


def run() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit("Install: py -3 -m pip install playwright; py -3 -m playwright install chromium") from exc

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True, executable_path=os.environ.get("CONSTELLATION_CHROMIUM") or None
        )
        try:
            for width in (390, 1280):
                page = browser.new_page(viewport={"width": width, "height": 850})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.set_content(offline_preview())
                page.locator(".stage svg").first.wait_for()
                assert "SYNTHETIC STREAK STRESS TEST" in page.locator("#summary").inner_text()
                for design in ("Cartographer", "Starforge", "Comet Streaks"):
                    page.get_by_role("button", name=design, exact=True).click()
                    assert page.locator(".stage svg").get_attribute("data-design") in ("cartographer", "starforge", "comet")
                page.get_by_role("button", name="Paper", exact=True).click()
                assert page.locator(".stage svg").get_attribute("data-theme") == "paper"
                page.get_by_role("button", name="Compare all three").click()
                assert page.locator(".stage").count() == 3
                page.get_by_role("button", name="Pause", exact=True).click()
                assert page.get_by_role("button", name="Resume", exact=True).get_attribute("aria-pressed") == "true"
                page.get_by_role("button", name="Ten-event demo").click()
                assert "10 recorded days" in page.locator("#summary").inner_text()
                assert "0 true consecutive-date streaks" in page.locator("#summary").inner_text()
                page.locator("a.active-day[data-day]").first.focus()
                assert "recorded activity unit" in page.locator("#inspector h2").inner_text()
                assert not errors, errors
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
                page.close()
            print("Chromium smoke passed: mobile/desktop; three designs, two themes, compare, pause, keyboard focus")
        finally:
            browser.close()


if __name__ == "__main__":
    run()
