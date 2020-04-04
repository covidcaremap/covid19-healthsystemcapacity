import { indicators, perCapitas } from './config';
import { flatten, zip } from 'lodash';

export const fillStyleByType = (aggTypeMatchValue) => {
    return (breaks, indicator, aggType, perCapita) => {
        // Fill based on breaks only if this layer matches the
        // defined aggregation type, else just render it transparent
        // (effectively turning the layer off)
        if (breaks && aggType === aggTypeMatchValue) {
            return getFillPaintStyle(breaks, indicator, aggType, perCapita);
        }
        return { 'fill-color': 'transparent' };
    };
};

export const facilityCircleStyle = (breaks, indicator, aggType, perCapita) => {
    if (breaks && aggType === 3) {
        return getCirclePaintStyle(breaks, indicator, aggType, perCapita);
    }
    return {
        'circle-radius': 0,
        'circle-color': 'transparent',
    };
};

function getFillPaintStyle(breaks, indicator, aggType, perCapita) {
    const { colorBreaks } = getBreaksStyle(
        breaks,
        indicator,
        aggType,
        perCapita,
    );
    const property = getProperty(indicator, aggType, perCapita);
    return {
        'fill-color': [
            'case',
            // Check to make sure property is not undefined
            ['all', ['has', property]],
            ['step', ['number', ['get', property]]].concat(colorBreaks),
            // Fallback color for undefined indicator
            '#ccc',
        ],
    };

    //setLegend(colors, breaksValues);
}

function getCirclePaintStyle(breaks, indicator, aggType, perCapita) {
    const radii = indicators[indicator].radii;
    const { breaksValues, colorBreaks } = getBreaksStyle(
        breaks,
        indicator,
        aggType,
        perCapita,
    );
    const property = getProperty(indicator, aggType, perCapita);

    return {
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            [
                'interpolate',
                ['linear'],
                ['get', property],
                breaksValues[0],
                radii[0][0],
                breaksValues[breaksValues.length - 1],
                radii[0][1],
            ],
            10,
            [
                'interpolate',
                ['linear'],
                ['get', property],
                breaksValues[0],
                radii[1][0],
                breaksValues[breaksValues.length - 1],
                radii[1][1],
            ],
        ],
        'circle-color': ['step', ['number', ['get', property]]].concat(
            colorBreaks,
        ),
        'circle-stroke-color': '#000',
        'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            0.5,
            10,
            1,
        ],
        'circle-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 1],
    };

    //setLegend(colors, breaksValues);
}

export const getBreaksStyle = (breaks, indicator, aggType, perCapita) => {
    const breaksValues = getBreaks(breaks, indicator, aggType, perCapita);
    const colors = indicators[indicator].colors;
    const colorBreaks = flatten(zip(breaksValues, colors)).splice(
        1,
        colors.length + breaksValues.length - 2,
    );

    return {
        breaksValues,
        colors,
        colorBreaks,
    };
};

export const getBreaks = (breaks, indicator, aggType, perCapita) => {
    const property = getProperty(indicator, aggType, perCapita);
    var breakpoints = breaks[aggType][property];
    // TODO: Find a better way to handle this
    // Mapbox's step expression doesn't like it when one of the breakpoints is equal to the smallest
    // property value; this comes up some places in our map where the first breakpoint is 0, where it
    // won't style any of the features with a value of 0. I am temporarily getting around this by
    // adding a very small value to the break point when this happens.
    var modifiedBreaks = breakpoints.map(function (breakpoint, i) {
        if (i > 0 && breakpoint === breakpoints[i - 1]) {
            return breakpoint + 0.0000000000001;
        } else {
            return breakpoint;
        }
    });
    return modifiedBreaks;
};

export const shouldUsePerCapita = (indicator, perCapita, aggType) => {
    // number == 0 is showing total values
    // Indicators 3 and 4 are capacity
    // type == 3 is facility-level data
    return (
        perCapita !== 0 &&
        !(indicator === 3 || indicator === 4) &&
        aggType !== 3
    );
};

export const getProperty = (theIndicator, aggType, perCapita) => {
    var indicatorProperty = indicators[theIndicator]['propertyInData'];
    if (shouldUsePerCapita(theIndicator, perCapita, aggType)) {
        indicatorProperty += perCapitas[perCapita]['stringInData'];
    }
    return indicatorProperty;
};

export const formatNumber = (x, indicator) => {
    if (isNaN(x)) {
        return 'N/A';
    } else if (indicators[indicator].displayAsPercent) {
        return (x * 100).toFixed(0) + '%';
    } else if (Number.isInteger(x)) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        return x.toFixed(2);
    }
};
