import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys

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

for user in user_count_data:
    x_pos = np.arange(len(user))
    plt.bar(x_pos, user, align='center', alpha=0.5)

plt.title('Keystrokes Between Runs')

plt.show()
print('Finishing distribution script')
