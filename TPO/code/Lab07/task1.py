from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

driver = webdriver.Firefox()
driver.get("https://www.saucedemo.com/")


username = driver.find_element(By.ID, "user-name")
print("ID найден:", username.get_attribute("placeholder"))


password = driver.find_element(By.NAME, "password")
print("NAME найден:", password.get_attribute("placeholder"))


login_btn = driver.find_element(By.CSS_SELECTOR, "input.submit-button.btn_action")
print("CSS 1 найден:", login_btn.get_attribute("value"))


username_css = driver.find_element(By.CSS_SELECTOR, "input#user-name.input_error")
print("CSS 2 найден:", username_css.get_attribute("name"))


login_xpath = driver.find_element(By.XPATH, "//input[@id='login-button' and @type='submit']")
print("XPath 1 найден")


user_xpath = driver.find_element(By.XPATH, "//input[contains(@class,'input_error')]")
print("XPath 2 найден")

driver.find_element(By.ID, "user-name").send_keys("standard_user")
driver.find_element(By.ID, "password").send_keys("secret_sauce")
driver.find_element(By.ID, "login-button").click()
time.sleep(2)



link = driver.find_element(By.PARTIAL_LINK_TEXT, "Twitter")
print("Link найден:", link.get_attribute("href"))



items = driver.find_elements(By.CLASS_NAME, "inventory_item_name")
print("Список товаров:")
for item in items:
    print("-", item.text)

driver.quit()