from __future__ import annotations

from pages.saucedemo_pages import SauceLoginPage


def test_find_elements_by_different_locators(driver):
    login_page = SauceLoginPage(driver).load()

    assert login_page.username_placeholder_by_id() == "Username"
    assert login_page.password_placeholder_by_name() == "Password"
    assert login_page.login_value_by_css() == "Login"
    assert login_page.username_name_by_css() == "user-name"
    assert login_page.login_type_by_xpath() == "submit"
    assert login_page.username_id_by_xpath() == "user-name"

    inventory_page = login_page.login().wait_loaded()

    assert "twitter.com" in inventory_page.twitter_href()
    assert len(inventory_page.item_names()) > 0


def test_authorization(driver):
    inventory_page = SauceLoginPage(driver).load().login().wait_loaded()

    assert "inventory" in inventory_page.current_url


def test_add_item_to_cart(driver):
    inventory_page = SauceLoginPage(driver).load().login().wait_loaded()

    inventory_page.add_backpack_to_cart()

    assert inventory_page.cart_badge_text() == "1"


def test_item_is_present_in_cart(driver):
    cart_page = SauceLoginPage(driver).load().login().wait_loaded().add_backpack_to_cart().open_cart()

    assert "Backpack" in cart_page.item_name()


def test_checkout_order(driver):
    complete_page = (
        SauceLoginPage(driver)
        .load()
        .login()
        .wait_loaded()
        .add_backpack_to_cart()
        .open_cart()
        .start_checkout()
        .fill_user_data("Test", "User", "12345")
        .finish_order()
    )

    assert "Thank you" in complete_page.complete_text()


def test_sorting_by_dropdown(driver):
    inventory_page = SauceLoginPage(driver).load().login().wait_loaded()

    inventory_page.sort_by_visible_text("Price (low to high)")

    prices = inventory_page.prices()
    assert len(prices) > 0
    assert "$" in prices[0]
