import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
from statistics import mean

print('Starting distribution script')

csv.field_size_limit(sys.maxsize)
filename = './data/keystroke/events0.csv'


headers = []
data = []
with open('./data/keystroke/events0.csv', newline='') as csvfile:
    csvReader = csv.reader(csvfile)
    i = 0
    for row in csvReader:
        if headers == []:
            headers = list(row)
        else:
            obj = {}
            for field, header in zip(row, headers):
                obj[header] = field
            data.append(obj)


users_sims_events = [[[]]]
current_user = data[0]['user_id']
for event in data:
    # switch to a new user
    if not event['user_id'] == current_user:
        users_sims_events.append([[]])
        current_user = event['user_id']
    # switch to a new sim
    if event['change_type'] == 'RUN':
        users_sims_events[-1].append([])
    # add the event to the most recent user, most recent sim
    users_sims_events[-1][-1].append(event)

user_count_data = []
for user in users_sims_events:
    user_count_data.append([])
    for sim in user:
        user_count_data[-1].append(len(sim))

fig1 = plt.figure(1)
for user in user_count_data:
    x_pos = np.arange(len(user))
    plt.bar(x_pos, user, align='center', alpha=0.5)

plt.title('Keystrokes Between Runs')
fig1.show()

BINS = 10
user_binAverage = []
for user in user_count_data:
    user_binAverage.append([])
    user_length = len(user)
    if user_length == 0:
        continue
    bin_size = math.ceil(user_length / BINS)
    i = 0
    while i < user_length:
        if user_length == 1:
            for j in range(BINS):
                user_binAverage[-1].append(user[0])
            i += 1
        else:
            user_binAverage[-1].append(mean(user[i : i + bin_size]))
            i += bin_size
    # print(len(user_binAverage[-1]), user_binAverage[-1])

fig2 = plt.figure(2)
for i in range(len(user_binAverage) - 1):
    user = user_binAverage[i]
    x_pos = np.arange(len(user)) + (i * 0.1)
    plt.bar(x_pos, user, align='center', alpha=0.3)

plt.title('Overlapping Binned Keystrokes Between Runs')
fig2.show()

fig3 = plt.figure(3)
bar_width = (1 / len(user_binAverage))
for i in range(len(user_binAverage) - 1):
    user = user_binAverage[i]
    x_pos = np.arange(len(user)) + (i * bar_width)
    plt.bar(x_pos, user, width=bar_width)

plt.title('Binned Keystrokes Between Runs')
fig3.show()

print('Press enter to continue')
input()
print('Finishing distribution script')
