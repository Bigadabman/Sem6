from __future__ import annotations

from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions


PROJECT_ROOT = Path(__file__).parent
REPORTS_DIR = PROJECT_ROOT / "reports"


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        choices=("chrome", "firefox"),
        help="Browser used for Selenium tests.",
    )
    parser.addoption(
        "--base-url",
        action="store",
        default="https://www.wikipedia.org/",
        help="Real public site under test.",
    )
    parser.addoption(
        "--headless",
        action="store_true",
        help="Run browser without a visible window.",
    )


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    def order_of(item: pytest.Item) -> int:
        marker = item.get_closest_marker("run_order")
        if marker and marker.args:
            return int(marker.args[0])
        return 1000

    items.sort(key=order_of)


@pytest.fixture(scope="session")
def base_url(pytestconfig: pytest.Config) -> str:
    return str(pytestconfig.getoption("--base-url")).rstrip("/") + "/"


@pytest.fixture()
def driver(pytestconfig: pytest.Config):
    REPORTS_DIR.mkdir(exist_ok=True)
    browser_name = pytestconfig.getoption("--browser")
    headless = bool(pytestconfig.getoption("--headless"))

    if browser_name == "chrome":
        options = ChromeOptions()
        options.add_argument("--window-size=1365,900")
        options.add_argument("--disable-notifications")
        options.add_argument("--lang=en-US")
        if headless:
            options.add_argument("--headless=new")
        browser = webdriver.Chrome(options=options)
    else:
        options = FirefoxOptions()
        options.set_preference("dom.webnotifications.enabled", False)
        options.set_preference("intl.accept_languages", "en-US")
        if headless:
            options.add_argument("--headless")
        browser = webdriver.Firefox(options=options)

    browser.implicitly_wait(0)
    yield browser
    browser.quit()
