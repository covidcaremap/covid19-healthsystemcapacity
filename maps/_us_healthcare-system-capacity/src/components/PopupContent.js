import React from 'react';
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
    aggType,
    perCapita,
}) {
    if (!feature) return null;
    const aggregation = aggregationTypes[aggType];
    const nameProperty = aggregation['nameProperty'];
    let name = feature.properties[nameProperty];

    if (aggregation.includeState) {
        name += ', ' + feature.properties['State'];
    }

    const rows = indicators.map(function (indicator, indIdx) {
        const perCapitaLabel = shouldUsePerCapita(indIdx, perCapita, aggType)
            ? ' ' + perCapitas[perCapita].labelAbbreviated
            : '';
        const propName = getProperty(indIdx, aggType, perCapita);
        return (
            <tr key={`popup-${indIdx}`}>
                <th>
                    {indicator.label}
                    {perCapitaLabel}
                </th>
                <td>{formatNumber(feature.properties[propName], indIdx)}</td>
            </tr>
        );
    });

    const content = (
        <>
            <div className="tooltip-heading">{name}</div>
            <table>
                <tbody>{rows}</tbody>
            </table>
        </>
    );

    return <Popup coordinates={coordinates}>{content}</Popup>;
}
