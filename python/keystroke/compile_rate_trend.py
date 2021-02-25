import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
from statistics import mean, median
from sklearn.cluster import KMeans

print('Starting distribution script')

csv.field_size_limit(sys.maxsize)
filename = './data/keystroke/events0.csv'

BINS = 4
SHOW_ALL_USERS = False

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

i = 0
if SHOW_ALL_USERS:
    for (i, user) in zip(range(len(user_bin_stats)), user_bin_stats):
        fig = plt.figure(i)
        x = np.arange(BINS)
        y = [ b["keystrokes_before_successes"] / ( max(b["keystrokes_before_successes"] + b["keystrokes_before_failures"], 1)) for b in user ]
        plt.plot(x, y)
        plt.title('Successful compile rate')
        fig.show()

user_bin_compile_rate = []
for user in user_bin_stats:
    user_bin_compile_rate.append([ b["keystrokes_before_successes"] / ( max(b["keystrokes_before_successes"] + b["keystrokes_before_failures"], 1)) for b in user ])

i += 1
combined_fig = plt.figure(i)
for user in user_bin_compile_rate:
    x = np.arange(BINS)
    plt.plot(x, user)  

plt.title('Successful compile rate')
combined_fig.show()

potential_ks = range(2, 10)
i += 1
elbow_plot = plt.figure(i)
wcss = []
for k in potential_ks:
    kmeans = KMeans(n_clusters=k, init='k-means++', max_iter=300, n_init=10, random_state=0)
    kmeans.fit(user_bin_compile_rate)
    wcss.append(kmeans.inertia_)

plt.plot(potential_ks, wcss)
plt.title('Elbow Method')
plt.xlabel('Number of clusters')
plt.ylabel('WCSS')
elbow_plot.show()

num_clusters = 4
clusters = []
cluster_bin_median = []
for x in range(num_clusters):
    clusters.append([])
    cluster_bin_median.append([])
    for y in range(BINS):
        clusters[x].append([])

kmeans = KMeans(n_clusters=num_clusters, init='k-means++', max_iter=300, n_init=10, random_state=0)
predicted_cluster = kmeans.fit_predict(user_bin_compile_rate)
for (user, c) in zip(user_bin_compile_rate, predicted_cluster):
    for b in range(BINS):
        clusters[c][b].append(user[b])

for (cluster, c) in zip(clusters, range(len(clusters))):
    for b in cluster:
        cluster_bin_median[c].append(median(b))

i += 1
cluster_median_fig = plt.figure(i)

# flip cluster_user_bin to cluster_bin_user
for cluster in cluster_bin_median:
    plt.plot(range(len(cluster)), cluster)

cluster_median_fig.show()

print('Press enter to continue')
input()
print('Finishing revised distribution')
