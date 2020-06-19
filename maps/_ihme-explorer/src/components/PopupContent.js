import React from 'react';
import * as _ from 'underscore';
import { Popup } from 'react-mapbox-gl';
import { aggregationTypes, indicators, perCapitas } from '../utils/config';
import {
  formatNumber,
  shouldUsePerCapita,
  getProperty,
} from '../utils/healthcareMapStyling';

export default function PopupContent({
  feature,
  coordinates,
  countryData,
  regionData,
  dates,
  aggType,
  indicator,
  activeDate,
  boundLevel,
  usePerCapita,
}) {
  if (!feature) return null;

  const data = aggType == 'country' ? countryData : regionData;

  if (!data) return null;

  const aggregation = aggregationTypes[aggType],
    per_capita_base = aggregationTypes[aggType]['per_capita_base'],
    population = feature.properties['population'],
    locationId = feature.properties['id'];

  if (!(locationId in data)) {
    return null;
  }

  const locationData = data[locationId]['values'];

  let name = usePerCapita
    ? feature.properties['location_name'] +
      ' (per ' +
      formatNumber(per_capita_base) +
      ' people)'
    : feature.properties['location_name'];

  const rows = _.pairs(indicators).map(function (kv) {
    const rawValue = locationData[kv[0]][boundLevel][dates[activeDate]];
    const value = usePerCapita
      ? rawValue / (population / per_capita_base)
      : rawValue;
    return (
      <tr key={`popup-${kv[0]}`}>
        <th>
          {kv[1].label} - {boundLevel}
        </th>
        <td>{formatNumber(value)}</td>
      </tr>
    );
  });

  const content = (
    <>
      <div className="tooltip-heading">{name}</div>
      <div className="tooltip-subheading">
        Population: {formatNumber(population)}
      </div>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </>
  );

  return <Popup coordinates={coordinates}>{content}</Popup>;
}
