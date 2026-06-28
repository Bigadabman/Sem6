from __future__ import annotations

import json
from pathlib import Path

import pytest

from pages.wikipedia_home_page import WikipediaHomePage


REPORTS_DIR = Path(__file__).resolve().parents[1] / "reports"


@pytest.mark.run_order(1)
@pytest.mark.smoke
@pytest.mark.search
def test_home_page_is_real_wikipedia(driver, base_url):
    page = WikipediaHomePage(driver).load(base_url)

    assert "wikipedia.org" in page.current_url
    assert "Wikipedia" in page.title


@pytest.mark.run_order(2)
@pytest.mark.search
@pytest.mark.parametrize(
    ("query", "language", "expected_text"),
    [
        ("Selenium", "en", "Selenium"),
        ("Pytest", "en", "pytest"),
        ("Минск", "ru", "Минск"),
    ],
)
def test_search_finds_articles_in_different_languages(driver, base_url, query, language, expected_text):
    results_page = WikipediaHomePage(driver).load(base_url).search(query, language)

    assert "wikipedia.org" in results_page.current_url
    assert results_page.page_contains(expected_text)


@pytest.mark.run_order(3)
@pytest.mark.cookies
def test_cookie_can_be_created_read_and_exported(driver, base_url):
    page = WikipediaHomePage(driver).load(base_url)
    cookie = {"name": "lab_cookie", "value": "demo", "path": "/"}

    driver.add_cookie(cookie)
    saved_cookie = driver.get_cookie(cookie["name"])
    all_cookies = driver.get_cookies()

    REPORTS_DIR.mkdir(exist_ok=True)
    (REPORTS_DIR / "cookies.json").write_text(
        json.dumps(all_cookies, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    assert saved_cookie is not None
    assert saved_cookie["value"] == cookie["value"]
    assert "wikipedia.org" in page.current_url


@pytest.mark.run_order(4)
@pytest.mark.screenshot
def test_search_page_screenshot_is_saved(driver, base_url):
    results_page = WikipediaHomePage(driver).load(base_url).search("Page Object Model", "en")
    screenshot_path = results_page.save_screenshot(REPORTS_DIR / "page_object_model_search.png")

    assert screenshot_path.exists()
    assert screenshot_path.stat().st_size > 0


@pytest.mark.run_order(5)
@pytest.mark.skip(reason="Demonstration of a skipped test required by the lab.")
def test_skipped_mobile_layout_demo():
    assert False


@pytest.mark.run_order(6)
@pytest.mark.xfail(reason="Demonstration of an expected failing test required by the lab.", strict=True)
def test_expected_failure_demo(driver, base_url):
    page = WikipediaHomePage(driver).load(base_url)

    assert "This title is intentionally wrong" in page.title
