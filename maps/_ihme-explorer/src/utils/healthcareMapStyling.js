import { aggregationTypes, indicators, perCapitas } from './config';
import * as _ from 'underscore';
import { map, flatten, zip } from 'lodash';
import * as interpolate from 'color-interpolate';

export const getFillStyle = (aggTypeMatchValue) => {
  return (
    dates,
    breaks,
    dateIndex,
    indicator,
    aggType,
    boundLevel,
    usePerCapita,
  ) => {
    // Fill based on breaks only if this layer matches the
    // defined aggregation type, else just render it transparent
    // (effectively turning the layer off)
    if (breaks && aggType === aggTypeMatchValue) {
      return getFillPaintStyle(
        dates,
        breaks,
        dateIndex,
        indicator,
        aggType,
        boundLevel,
        usePerCapita,
      );
    }
    return { 'fill-color': 'transparent' };
  };
};

function getFillPaintStyle(
  dates,
  breaks,
  dateIndex,
  indicator,
  aggType,
  boundLevel,
  usePerCapita,
) {
  const { colorBreaks } = getBreaksStyle(
    breaks,
    indicator,
    aggType,
    boundLevel,
    usePerCapita,
  );

  let value = ['number', ['feature-state', 'value'], 0];
  let hasValue = ['number', ['feature-state', 'hasValue'], 0];

  // If using per-capita numbers, transform the value according to the feature
  // population and the per-capita base.
  if (usePerCapita && aggregationTypes[aggType].per_capita_base) {
    const perCapitaBase = aggregationTypes[aggType].per_capita_base;
    value = [
      'number',
      ['/', value, ['/', ['get', 'population'], perCapitaBase]],
      breaks[0],
    ];
  }

  return {
    'fill-color': [
      'case',
      ['==', hasValue, 1],
      ['interpolate', ['linear'], value].concat(colorBreaks),
      // If there isn't data, make it transparent.
      'rgba(0, 0, 0, 0.1)',
    ],
  };
}

export const getBreaksStyle = (breaks, indicator) => {
  const breaksValues = modifyBreaks(breaks),
    colorStops = indicators[indicator].colors,
    palette = interpolate(colorStops),
    colors = _.map([...Array(breaksValues.length).keys()], function (i) {
      return palette(i / breaksValues.length);
    }),
    colorBreaks = _.flatten(_.zip(breaksValues, colors));

  return {
    breaksValues,
    colors,
    colorBreaks,
  };
};

export const modifyBreaks = (breaks) => {
  // TODO: Find a better way to handle this
  // Mapbox's step expression doesn't like it when one of the breakpoints is equal to the smallest
  // property value; this comes up some places in our map where the first breakpoint is 0, where it
  // won't style any of the features with a value of 0. I am temporarily getting around this by
  // adding a very small value to the break point when this happens.
  var modifiedBreaks = breaks.map(function (breakpoint, i) {
    if (i > 0 && breakpoint === breaks[i - 1]) {
      return breakpoint + 0.0000000000001;
    } else {
      return breakpoint;
    }
  });
  return modifiedBreaks;
};

export const formatNumber = (x, indicator, digits = 2) => {
  if (x === null || isNaN(x)) {
    return 'N/A';
  } else if (Number.isInteger(x)) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    return x.toFixed(digits);
  }
};
