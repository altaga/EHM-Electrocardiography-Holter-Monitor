from heartpy import remove_baseline_wander,filter_signal,process,scale_data
import numpy as np
import json

def lambda_handler(event, context):

    body = event["body"]

    ecg = body.split(",")
    sample_rate = 150

    ecg = np.array([ecg])
    ecg = ecg.astype(np.float64)
    ecg = ecg[0]

    filtered1= remove_baseline_wander(ecg, sample_rate)

    filtered = filter_signal(filtered1, cutoff = [2, 32], sample_rate = sample_rate , order = 1, filtertype='bandpass')

    wd, m = process(scale_data(filtered), sample_rate)

    d = []

    for measure in m.keys():
        d.append(measure)
        d.append(m[measure])
        print('%s: %f' %(measure, m[measure]))

    return d