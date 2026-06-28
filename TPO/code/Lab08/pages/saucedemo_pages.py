from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

from pages.base_page import BasePage


class SauceLoginPage(BasePage):
    URL = "https://www.saucedemo.com/"

    USERNAME_BY_ID = (By.ID, "user-name")
    PASSWORD_BY_NAME = (By.NAME, "password")
    LOGIN_BY_CSS = (By.CSS_SELECTOR, "input.submit-button.btn_action")
    USERNAME_BY_CSS = (By.CSS_SELECTOR, "input#user-name.input_error")
    LOGIN_BY_XPATH = (By.XPATH, "//input[@id='login-button' and @type='submit']")
    USERNAME_BY_XPATH = (By.XPATH, "//input[contains(@class,'input_error')]")
    PASSWORD_BY_ID = (By.ID, "password")
    LOGIN_BY_ID = (By.ID, "login-button")

    def load(self) -> "SauceLoginPage":
        self.open(self.URL)
        self.visible(self.USERNAME_BY_ID)
        return self

    def username_placeholder_by_id(self) -> str:
        return self.visible(self.USERNAME_BY_ID).get_attribute("placeholder")

    def password_placeholder_by_name(self) -> str:
        return self.visible(self.PASSWORD_BY_NAME).get_attribute("placeholder")

    def login_value_by_css(self) -> str:
        return self.visible(self.LOGIN_BY_CSS).get_attribute("value")

    def username_name_by_css(self) -> str:
        return self.visible(self.USERNAME_BY_CSS).get_attribute("name")

    def login_type_by_xpath(self) -> str:
        return self.visible(self.LOGIN_BY_XPATH).get_attribute("type")

    def username_id_by_xpath(self) -> str:
        return self.visible(self.USERNAME_BY_XPATH).get_attribute("id")

    def login(self, username: str = "standard_user", password: str = "secret_sauce") -> "SauceInventoryPage":
        self.visible(self.USERNAME_BY_ID).send_keys(username)
        self.visible(self.PASSWORD_BY_ID).send_keys(password)
        self.clickable(self.LOGIN_BY_ID).click()
        return SauceInventoryPage(self.driver)


class SauceInventoryPage(BasePage):
    INVENTORY_CONTAINER = (By.ID, "inventory_container")
    TWITTER_LINK = (By.PARTIAL_LINK_TEXT, "Twitter")
    ITEM_NAMES = (By.CLASS_NAME, "inventory_item_name")
    BACKPACK_ADD_BUTTON = (By.ID, "add-to-cart-sauce-labs-backpack")
    CART_BADGE = (By.CLASS_NAME, "shopping_cart_badge")
    CART_LINK = (By.CLASS_NAME, "shopping_cart_link")
    SORT_DROPDOWN = (By.CLASS_NAME, "product_sort_container")
    ITEM_PRICES = (By.CLASS_NAME, "inventory_item_price")

    def wait_loaded(self) -> "SauceInventoryPage":
        self.visible(self.INVENTORY_CONTAINER)
        return self

    def twitter_href(self) -> str:
        return self.visible(self.TWITTER_LINK).get_attribute("href")

    def item_names(self) -> list[str]:
        self.visible(self.ITEM_NAMES)
        return [item.text for item in self.driver.find_elements(*self.ITEM_NAMES)]

    def add_backpack_to_cart(self) -> "SauceInventoryPage":
        self.clickable(self.BACKPACK_ADD_BUTTON).click()
        return self

    def cart_badge_text(self) -> str:
        return self.visible(self.CART_BADGE).text

    def open_cart(self) -> "SauceCartPage":
        self.clickable(self.CART_LINK).click()
        return SauceCartPage(self.driver)

    def sort_by_visible_text(self, text: str) -> "SauceInventoryPage":
        Select(self.visible(self.SORT_DROPDOWN)).select_by_visible_text(text)
        return self

    def prices(self) -> list[str]:
        self.visible(self.ITEM_PRICES)
        return [price.text for price in self.driver.find_elements(*self.ITEM_PRICES)]


class SauceCartPage(BasePage):
    CART_ITEM_NAME = (By.CLASS_NAME, "inventory_item_name")
    CHECKOUT_BUTTON = (By.ID, "checkout")

    def item_name(self) -> str:
        return self.visible(self.CART_ITEM_NAME).text

    def start_checkout(self) -> "SauceCheckoutPage":
        self.clickable(self.CHECKOUT_BUTTON).click()
        return SauceCheckoutPage(self.driver)


class SauceCheckoutPage(BasePage):
    FIRST_NAME = (By.ID, "first-name")
    LAST_NAME = (By.ID, "last-name")
    POSTAL_CODE = (By.ID, "postal-code")
    CONTINUE_BUTTON = (By.ID, "continue")
    FINISH_BUTTON = (By.ID, "finish")

    def fill_user_data(self, first_name: str, last_name: str, postal_code: str) -> "SauceCheckoutPage":
        self.visible(self.FIRST_NAME).send_keys(first_name)
        self.visible(self.LAST_NAME).send_keys(last_name)
        self.visible(self.POSTAL_CODE).send_keys(postal_code)
        return self

    def finish_order(self) -> "SauceCompletePage":
        self.clickable(self.CONTINUE_BUTTON).click()
        self.clickable(self.FINISH_BUTTON).click()
        return SauceCompletePage(self.driver)


class SauceCompletePage(BasePage):
    COMPLETE_HEADER = (By.CLASS_NAME, "complete-header")

    def complete_text(self) -> str:
        return self.visible(self.COMPLETE_HEADER).text
