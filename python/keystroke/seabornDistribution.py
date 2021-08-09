import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import csv
import sys
import math
from statistics import mean

print('Starting distribution script')

csv.field_size_limit(sys.maxsize)
filename = './data/keystroke/events0.csv'

BINS = 20
sns.set_theme(style="darkgrid")

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

# sns.displot(user_count_data)
# plt.show()

user_bin_average = []
for user in user_count_data:
    user_bin_average.append([])
    user_length = len(user)
    if user_length == 0:
        continue
    bin_size = math.ceil(user_length / BINS)
    i = 0
    while i < user_length:
        if user_length == 1:
            # with only one value, divide it evenly into the bins
            for j in range(BINS):
                user_bin_average[-1].append(user[0] / BINS)
            i += 1
        else:
            user_bin_average[-1].append(mean(user[i : i + bin_size]))
            i += bin_size

user_sum = []
for user in user_count_data:
    user_sum.append(sum(user))

sns.displot(user_bin_average)
plt.show()

print('Finishing distribution script')
