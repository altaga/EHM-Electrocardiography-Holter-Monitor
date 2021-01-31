from heartpy import remove_baseline_wander,filter_signal,process,scale_data,get_data

def filter_and_visualise(data, sample_rate):
    filtered = remove_baseline_wander(data, sample_rate)
    return filtered

ecg = get_data("myOutFile.csv")
sample_rate = 200

filtered = filter_signal(ecg, 0.05, sample_rate, filtertype='notch')

wd, m = process(scale_data(filtered), sample_rate)
for measure in m.keys():
    print('%s: %f' %(measure, m[measure]))