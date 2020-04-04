export const aggregationTypes = [
    {
        id: 'state',
        label: 'State',
        nameProperty: 'State Name',
        breaksUrl: 'data/config/ccm_state_breaks.json',
        includeState: false,
    },
    {
        id: 'hrr',
        label: 'HRR',
        nameProperty: 'HRRCITY',
        breaksUrl: 'data/config/ccm_hrr_breaks.json',
        includeState: false,
    },
    {
        id: 'county',
        label: 'County',
        nameProperty: 'County Name',
        breaksUrl: 'data/config/ccm_county_breaks.json',
        includeState: true,
    },
    {
        id: 'facility',
        label: 'Facility',
        nameProperty: 'Name',
        breaksUrl: 'data/config/ccm_facility_breaks.json',
        includeState: false,
    },
];

export const perCapitas = [
    { label: '', stringInData: '' },
    {
        labelAbbreviated: 'per 1k people',
        label: 'per 1,000 people',
        stringInData: ' [Per 1000 People]',
    },
    {
        labelAbbreviated: 'per 1k adults (20+)',
        label: 'per 1,000 adults (20+)',
        stringInData: ' [Per 1000 Adults (20+)]',
    },
    {
        labelAbbreviated: 'per 1k elderly (65+)',
        label: 'per 1,000 elderly (65+)',
        stringInData: ' [Per 1000 Elderly (65+)]',
    },
];

export const indicators = [
    {
        propertyInData: 'Staffed All Beds',
        label: 'Staffed All Beds',
        colors: ['#fff7fb', '#9db5ce', '#4d7596', '#023858'],
        displayAsPercent: false,
        radii: [
            [1, 20],
            [5, 50],
        ],
    },
    {
        propertyInData: 'Staffed ICU Beds',
        label: 'Staffed ICU Beds',
        colors: ['#f7fcfd', '#b0aacb', '#7a5a8d', '#4d004b'],
        displayAsPercent: false,
        radii: [
            [1, 20],
            [5, 50],
        ],
    },
    {
        propertyInData: 'Licensed All Beds',
        label: 'Licensed All Beds',
        colors: ['#f7fcfd', '#8cc1aa', '#40825e', '#00441b'],
        displayAsPercent: false,
        radii: [
            [1, 20],
            [5, 50],
        ],
    },
    {
        propertyInData: 'All Bed Occupancy Rate',
        label: 'All Bed Occupancy Rate',
        colors: ['#f3e7e9', '#d49ebb', '#a55c90', '#6c2167'],
        displayAsPercent: true,
        radii: [
            [1, 8],
            [5, 40],
        ],
    },
    {
        propertyInData: 'ICU Bed Occupancy Rate',
        label: 'ICU Bed Occupancy Rate',
        colors: ['#e9eeed', '#91bec5', '#56899d', '#2a5675'],
        displayAsPercent: true,
        radii: [
            [1, 8],
            [5, 40],
        ],
    },
];
