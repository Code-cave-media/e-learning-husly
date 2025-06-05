from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def get_instagram_bio(username):
    url = f"https://www.instagram.com/{username}/"

    # Headless Chrome setup
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(5)  # Wait for JavaScript to render the content

        # Find bio element by XPath
        bio_element = driver.find_element(By.XPATH, '//*[@id="mount_0_0_49"]/div/div/div[2]/div/div/div[1]/div[2]/div/div[1]/section/main/div/header/section[4]/div/span/div/span')
        return bio_element.text
    except Exception as e:
        return f"Error: {e}"
    finally:
        driver.quit()

# Example
print(get_instagram_bio("nasa"))
