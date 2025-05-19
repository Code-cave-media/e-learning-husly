import datetime

for day in range(31, 24, -1):  # From 31 to 25
  if datetime.date(year=2024,month=10,day=day).weekday() == 5:
    print(day)