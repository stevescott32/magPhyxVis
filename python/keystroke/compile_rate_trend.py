import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
from statistics import mean, median

print('Starting distribution script')

csv.field_size_limit(sys.maxsize)
filename = './data/keystroke/events0.csv'

BINS = 10

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
        users_sims_events[-1][-1].append(event)
        users_sims_events[-1].append([])
    # add the event to the most recent user, most recent sim
    users_sims_events[-1][-1].append(event)


user_bin_events = []
for user in users_sims_events:
    # add a new user
    user_bin_events.append([])
    # add bins to the user
    for b in range(BINS):
        user_bin_events[-1].append([])

    user_length = len(user)
    if user_length == 0:
        continue
    for i in range(user_length):
        target_bin = math.floor(i / user_length * BINS)
        user_bin_events[-1][target_bin].append(user[i])


user_bin_stats = []
for user in user_bin_events:
    user_bin_stats.append([])
    for one_bin in user:
        stats =	{
            "keystrokes": 0,
            "compiles": 0,
            "failures": 0,
            "successes": 0,
            "keystrokes_before_failures": 0,
            "keystrokes_before_successes": 0
        }
        for sim in one_bin:
            stats["keystrokes"] += len(sim)
            stats["compiles"] += 1
            if sim[-1]["change_type"] == "RUN":
                if sim[-1]["has_error"] == "True":
                    stats["failures"] += 1
                    stats["keystrokes_before_failures"] += len(sim)
                else:
                    stats["successes"] += 1
                    stats["keystrokes_before_successes"] += len(sim)

        user_bin_stats[-1].append(stats)


for (i, user) in zip(range(len(user_bin_stats)), user_bin_stats):
    fig = plt.figure(i)
    x = np.arange(BINS)
    y = [ b["keystrokes_before_successes"] / ( max(b["keystrokes_before_successes"] + b["keystrokes_before_failures"], 1)) for b in user ]
    plt.plot(x, y)  
    plt.title('Successful compile rate')
    fig.show()


combined_fig = plt.figure(i + 1)
for user in user_bin_stats:
    x = np.arange(BINS)
    y = [ b["keystrokes_before_successes"] / ( max(b["keystrokes_before_successes"] + b["keystrokes_before_failures"], 1)) for b in user ]
    plt.plot(x, y)  

plt.title('Successful compile rate')
combined_fig.show()

print('Press enter to continue')
input()
print('Finishing revised distribution')
