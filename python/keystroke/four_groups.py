import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import csv
import sys
import math
from statistics import mean, median

print('Starting four groups script')

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

# correlation between number of keystrokes and the percentage chance the next compile is a failure
# two groups - successful runs, failed runs, take stats
# four groups - sucess to success, fail to fail, success to fail, fail to success

# weighted moving average
print('Success success: median: ' + str(median(success_success)) + ' mean: ' + str(mean(success_success)) + ' std: ' + str(np.std(success_success)))
print('Success failure: median: ' + str(median(success_failure)) + ' mean: ' + str(mean(success_failure)) + ' std: ' + str(np.std(success_failure)))
print('Failure success: median: ' + str(median(failure_success)) + ' mean: ' + str(mean(failure_success)) + ' std: ' + str(np.std(failure_success)))
print('Failure failure: median: ' + str(median(failure_failure)) + ' mean: ' + str(mean(failure_failure)) + ' std: ' + str(np.std(failure_failure)))


print('Finishing four groups script')
