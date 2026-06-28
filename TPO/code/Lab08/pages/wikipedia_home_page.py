from __future__ import annotations

from selenium.webdriver.common.by import By

from pages.base_page import BasePage
from pages.search_results_page import SearchResultsPage


class WikipediaHomePage(BasePage):
    SEARCH_INPUT = (By.ID, "searchInput")
    LANGUAGE_SELECT = (By.ID, "searchLanguage")
    SEARCH_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")

    def load(self, base_url: str) -> "WikipediaHomePage":
        self.open(base_url)
        self.visible(self.SEARCH_INPUT)
        return self

    def search(self, query: str, language: str = "en") -> SearchResultsPage:
        search_input = self.visible(self.SEARCH_INPUT)
        search_input.clear()
        search_input.send_keys(query)
        language_select = self.present(self.LANGUAGE_SELECT)
        self.driver.execute_script(
            """
            const select = arguments[0];
            select.value = arguments[1];
            select.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            language_select,
            language,
        )
        self.clickable(self.SEARCH_BUTTON).click()
        return SearchResultsPage(self.driver)
