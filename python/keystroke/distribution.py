import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
from statistics import mean, median

# correlation between number of keystrokes and the percentage chance the next compile is a failure
# two groups - successful runs, failed runs, take stats
# four groups - sucess to success, fail to fail, success to fail, fail to success

# weighted moving average

# walk through, calculate what % of the way through you are (e.g. 40%), then
# place value into the corresponding bin (e.g. 40% of the bins)

# IEEE Viz

print('Starting distribution script')

csv.field_size_limit(sys.maxsize)
filename = './data/keystroke/events0.csv'

BINS = 80

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


# split the data by user and run event
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


# bin the events for each user
users_bins_events = []
for user in users_sims_events:
    # add a new user
    users_bins_events.append([])
    # add bins to the user
    for b in range(BINS):
        users_bins_events[-1].append([])

    user_length = len(user)
    if user_length == 0:
        continue
    for i in range(user_length):
        target_bin = math.floor(i / user_length * BINS)
        users_bins_events[-1][target_bin].append(user[i])


user_count_data = []
for user in users_bins_events:
    user_count_data.append([])
    for one_bin in user:
        bin_total = 0
        for sim in one_bin:
            bin_total += len(sim)
        user_count_data[-1].append(bin_total / len(sim))

fig1 = plt.figure(1)
for user in user_count_data:
    x_pos = np.arange(len(user))
    plt.bar(x_pos, user, align='center', alpha=0.5)

plt.title('Keystrokes Between Runs')
fig1.show()

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

fig2 = plt.figure(2)
for i in range(len(user_bin_average)):
    user = user_bin_average[i]
    x_pos = np.arange(len(user)) + (i * 0.1)
    plt.bar(x_pos, user, align='center', alpha=0.3)

plt.title('Overlapping Binned Keystrokes Between Runs')
fig2.show()


fig3 = plt.figure(3)
bar_width = (1 / len(user_bin_average))
for i in range(len(user_bin_average)):
    user = user_bin_average[i]
    x_pos = np.arange(len(user)) + (i * bar_width)
    plt.bar(x_pos, user, width=bar_width)

plt.title('Binned Keystrokes Between Runs')
fig3.show()


user_sum = []
for user in user_count_data:
    user_sum.append(sum(user))

normalized_user_bin_average = []
for (user, user_sum) in zip(user_bin_average, user_sum):
    normalized_user_bin_average.append([x / user_sum for x in user])

fig4 = plt.figure(4)
bar_width = (1 / len(normalized_user_bin_average))
for i in range(len(normalized_user_bin_average)):
    user = normalized_user_bin_average[i]
    x_pos = np.arange(len(user)) + (i * bar_width)
    plt.bar(x_pos, user, width=bar_width)

plt.title('Normalized Keystrokes Between Runs')
fig4.show()


sum_of_bins = [0] * BINS
count_of_bins = [0] * BINS
for u in range(len(normalized_user_bin_average)):
    user = normalized_user_bin_average[u]
    for bin in range(len(user)):
        sum_of_bins[bin] += user[bin]
        count_of_bins[bin] += 1

avg_of_bins = [0] * BINS
for i in range(BINS):
    avg_of_bins[i] = sum_of_bins[i] / count_of_bins[i]

fig5 = plt.figure(5)
x_pos = np.arange(0, len(avg_of_bins))
plt.bar(x_pos, avg_of_bins, align='edge')

plt.title('Averaged Normalized Keystrokes Between Runs')
fig5.show()


bin_user = []
for i in range(BINS):
    bin_user.append([])

for user in normalized_user_bin_average:
    for bin in range(len(user)):
        bin_user[bin].append(user[bin])

median_of_bins = [0] * BINS
for i in range(BINS):
    median_of_bins[i] = median(bin_user[i])

fig6 = plt.figure(6)
x_pos = np.arange(0, len(median_of_bins))
plt.bar(x_pos, median_of_bins, align='edge')

plt.title('Median Normalized Keystrokes Between Runs')
fig6.show()


print('Press enter to continue')
input()
print('Finishing distribution script')
