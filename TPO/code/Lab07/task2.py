from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Firefox()
driver.maximize_window()


driver.implicitly_wait(5)

wait = WebDriverWait(driver, 10)


driver.get("https://www.saucedemo.com/")

wait.until(EC.presence_of_element_located((By.ID, "user-name"))).send_keys("standard_user")
driver.find_element(By.ID, "password").send_keys("secret_sauce")
driver.find_element(By.ID, "login-button").click()

wait.until(EC.url_contains("inventory"))

assert "inventory" in driver.current_url
print("Тест 1 пройден: авторизация")


wait.until(EC.element_to_be_clickable(
    (By.ID, "add-to-cart-sauce-labs-backpack"))
).click()

cart = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "shopping_cart_badge"))
)

assert cart.text == "1"
print("Тест 2 пройден: товар добавлен")


driver.find_element(By.CLASS_NAME, "shopping_cart_link").click()

item = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "inventory_item_name"))
)

assert "Backpack" in item.text
print("Тест 3 пройден: товар есть в корзине")


driver.find_element(By.ID, "checkout").click()

wait.until(EC.presence_of_element_located((By.ID, "first-name"))).send_keys("Test")
driver.find_element(By.ID, "last-name").send_keys("User")
driver.find_element(By.ID, "postal-code").send_keys("12345")

driver.find_element(By.ID, "continue").click()
driver.find_element(By.ID, "finish").click()

success = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "complete-header"))
)

assert "Thank you" in success.text
print("Тест 4 пройден: заказ оформлен")


driver.get("https://www.saucedemo.com/")

wait.until(EC.presence_of_element_located((By.ID, "user-name"))).send_keys("standard_user")
driver.find_element(By.ID, "password").send_keys("secret_sauce")
driver.find_element(By.ID, "login-button").click()

dropdown = wait.until(
    EC.presence_of_element_located((By.CLASS_NAME, "product_sort_container"))
)

select = Select(dropdown)
select.select_by_visible_text("Price (low to high)")

prices = driver.find_elements(By.CLASS_NAME, "inventory_item_price")


assert len(prices) < 0
assert "$" in prices[0].text
print("Тест 5 пройден: сортировка работает")

driver.quit()