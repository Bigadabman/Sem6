from __future__ import annotations

from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class SearchResultsPage(BasePage):
    FIRST_HEADING = (By.ID, "firstHeading")
    CONTENT = (By.ID, "content")

    def heading(self) -> str:
        return self.visible(self.FIRST_HEADING).text

    def content_text(self) -> str:
        return self.visible(self.CONTENT).text

    def page_contains(self, expected_text: str) -> bool:
        expected = expected_text.casefold()
        return expected in self.heading().casefold() or expected in self.content_text().casefold()
