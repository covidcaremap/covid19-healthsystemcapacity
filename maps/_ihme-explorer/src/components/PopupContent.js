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
    dates,
    aggType,
    indicator,
    activeDate,
    boundLevel,
    usePerCapita,
}) {
    if (!feature) return null;
    const aggregation = aggregationTypes[aggType],
          per_capita_base = aggregationTypes[aggType]['per_capita_base'],
          population = feature.properties['population'];

    let name = usePerCapita
        ? (
            feature.properties['location_name'] +
                ' (per ' +
                formatNumber(per_capita_base) +
                ' people)'
        ) : feature.properties['location_name'];

    const rows = _.pairs(indicators).map(function (kv) {
        const propName = getProperty(dates[activeDate], kv[0], boundLevel);
        const value = usePerCapita ?
              (feature.properties[propName] / (population / per_capita_base)) :
              feature.properties[propName];
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
            <div className="tooltip-subheading">Population: {formatNumber(population)}</div>
            <table>
                <tbody>{rows}</tbody>
            </table>
        </>
    );

    return <Popup coordinates={coordinates}>{content}</Popup>;
}
