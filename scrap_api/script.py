import requests
import pprint
response = requests.get("https://www.instagram.com/irshad0722/")
data = response.text
if "Chief technology officer at" in data:
    print('yes')


response = requests.get("https://www.instagram.com/stories/flyviz_overseas_education/3646799290696865522/")
data = response.text
with open('content.txt', 'w', encoding='utf-8') as file:
    file.write(data)
