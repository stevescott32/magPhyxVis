import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
import seaborn as sns
from statistics import mean, median

# correlation between number of keystrokes and the percentage chance the next compile is a failure
# four groups - sucess to success, fail to fail, success to fail, fail to success

print('Starting four groups script')

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
        users_sims_events[-1][-1].append(event)
        users_sims_events[-1].append([])
    # add the event to the most recent user, most recent sim
    users_sims_events[-1][-1].append(event)


success_success = []
success_failure = []
failure_success = []
failure_failure = []

for user in users_sims_events:
    last_result_success = True
    for sim in user:
        current_result_success = sim[-1]['has_error'] == 'True'
        # success success
        if last_result_success and current_result_success:
            success_success.append(len(sim))
            last_result_success = True
        # success failure
        elif last_result_success and not current_result_success:
            success_failure.append(len(sim))
            last_result_success = False
        # failure success 
        elif not last_result_success and current_result_success:
            failure_success.append(len(sim))
            last_result_success = True
        # failure failure 
        else:
            failure_failure.append(len(sim))
            last_result_success = False


four_groups = []
four_groups.append({
    "name": "Success success",
    "data": success_success
})
four_groups.append({
    "name": "Success failure",
    "data": success_failure
})
four_groups.append({
    "name": "Failure success",
    "data": failure_success
})
four_groups.append({
    "name": "Failure failure",
    "data": failure_failure
})

for group in four_groups:
    print(group["name"])
    print('    Mean: ' + str(mean(group["data"])))
    print('    Std: ' + str(np.std(group["data"])))
    print('    Q1: ' + str(np.quantile(group["data"], 0.25)))
    print('    Median: ' + str(np.quantile(group["data"], 0.5)))
    print('    Q3: ' + str(np.quantile(group["data"], 0.75)))
    sns.displot(group["data"])

plt.show()

print('Finishing four groups script')
