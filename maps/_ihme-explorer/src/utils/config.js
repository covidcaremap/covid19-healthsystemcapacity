import * as _ from 'underscore';

export const loadConfig = (config, setDates, setActiveDate) => {

    // Handle dates
    let dates = config['dates'],
        sortedDates = Array.from(new Set(dates)).sort();
    setDates(sortedDates);

    const today = new Date().toISOString().slice(0, 10),
    todayIndex = sortedDates.indexOf(today);

    setActiveDate(todayIndex !== -1 ? todayIndex : sortedDates.length - 1);

    // Handle aggregation type properties
    let aggTypeConfig = config['aggregations'];
    _.pairs(aggTypeConfig).map(kv => {
        let aggConfig = aggregationTypes[kv[0]];
        _.pairs(kv[1]).map(kv2 => {
            aggConfig[kv2[0]] = kv2[1];
        });
    });
};

export const aggregationTypes = {
    'country': {
        label: 'National'
    },
    'region': {
        label: 'Regional',
        default: true
    }
};

// Keys match IHME columns
export const indicators = {
    'allbed': {
        label: 'All Beds',
        colors: ['#fff7fb', '#9db5ce', '#4d7596', '#023858'],
        description: 'Hospital beds needed per day for COVID-19 patients'
    },
    'ICUbed': {
        label: 'ICU Beds',
        colors: ['#f7fcfd', '#b0aacb', '#7a5a8d', '#4d004b'],
        description: 'ICU beds needed per day for COVID-19 patients',
        default: true
    },
    'InvVen': {
        label: 'Ventilators',
        colors: ['#f7fcfd', '#8cc1aa', '#40825e', '#00441b'],
        description: 'Invasive ventilation needed per day for COVID-19 patients'
    },
    'admis': {
        label: 'Daily Hospital Admissions',
        colors: ['#fff7fb', '#9db5ce', '#4d7596', '#023858'],
        description: 'Daily deaths of COVID-19 patients'
    },
    'newICU': {
        label: 'Daily ICU Admissions',
        colors: ['#f7fcfd', '#b0aacb', '#7a5a8d', '#4d004b'],
        description: 'New hospital admissions per day of COVID-19 patients'
    },
    'deaths': {
        label: 'Daily COVID-19 Deaths',
        colors: ['#f3e7e9', '#d49ebb', '#a55c90', '#6c2167'],
        description: 'New ICU admissions per day of COVID-19 patients'
    },
    'totdea': {
        label: 'Total COVID-19 Deaths',
        colors: ['#f3e7e9', '#d49ebb', '#a55c90', '#6c2167'],
        description: 'Cumulative deaths of COVID-19 patients'
    },
    'bedover': {
        label: 'Hospital Bed Shortage',
        colors: ['#fff7fb', '#9db5ce', '#4d7596', '#023858'],
        description: 'Difference between total hospital beds needed for COVID-19 patients and estimated count of hospital beds available'
    },
    'icuover': {
        label: 'ICU Bed Shortage',
        colors: ['#f7fcfd', '#b0aacb', '#7a5a8d', '#4d004b'],
        description: 'Difference between total ICU beds needed for COVID-19 patients and estimated count of ICU beds available'
    }
};

// Keys match IHME column suffixes
export const boundLevels = {
    'lower': {
        label: 'Lower Bound'
    },
    'mean': {
        label: 'Mean',
        default: true
    },
    'upper': {
        label: 'Upper'
    }
};
