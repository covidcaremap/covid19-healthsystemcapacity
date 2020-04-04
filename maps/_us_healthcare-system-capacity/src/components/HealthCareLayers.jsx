import React from 'react';
import { Layer } from 'react-mapbox-gl';
import {
    fillStyleByType,
    facilityCircleStyle,
} from '../utils/healthcareMapStyling';

const stateFillStyle = fillStyleByType(0);
const hrrFillStyle = fillStyleByType(1);
const countyFillStyle = fillStyleByType(2);

export default function HealthCareLayers({
    indicator,
    aggType,
    perCapita,
    onHover,
    onHoverOut,
    classBreaks,
}) {
    const handleMouseMove = (boundAggType) => {
        return (e) => {
            if (boundAggType === aggType) {
                e.target.getCanvas().style.cursor = 'default';
                const feature = e.features?.[0];
                if (feature) {
                    const { lng, lat } = e.lngLat;
                    onHover(feature, [lng, lat]);
                } else {
                    onHoverOut();
                }
            }
        };
    };

    return (
        <>
            <Layer
                id="county-fill"
                type="fill"
                sourceId="boundaries"
                sourceLayer="county"
                before="road-label"
                onMouseMove={handleMouseMove(2)}
                paint={countyFillStyle(
                    classBreaks,
                    indicator,
                    aggType,
                    perCapita,
                )}
            />
            <Layer
                id="county-line"
                type="line"
                sourceId="boundaries"
                sourceLayer="county"
                before="road-label"
                layout={{ visibility: aggType === 2 ? 'visible' : 'none' }}
                paint={{
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        3,
                        0.25,
                        10,
                        2,
                    ],
                    'line-color': '#000',
                    'line-opacity': 0.25,
                }}
            />
            <Layer
                id="hrr-fill"
                type="fill"
                sourceId="boundaries"
                sourceLayer="hrr"
                before="road-label"
                onMouseMove={handleMouseMove(1)}
                paint={hrrFillStyle(classBreaks, indicator, aggType, perCapita)}
            />
            <Layer
                id="hrr-line"
                type="line"
                sourceId="boundaries"
                sourceLayer="hrr"
                before="road-label"
                layout={{ visibility: aggType === 1 ? 'visible' : 'none' }}
                paint={{
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        3,
                        0.25,
                        10,
                        2,
                    ],
                    'line-color': '#000',
                    'line-opacity': 0.25,
                }}
            />
            <Layer
                id="state-line"
                type="line"
                sourceId="boundaries"
                sourceLayer="state"
                before="road-label"
                layout={{ visibility: aggType === 0 ? 'visible' : 'none' }}
                paint={{
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        3,
                        0.75,
                        10,
                        4,
                    ],
                    'line-color': '#000',
                    'line-opacity': 0.25,
                }}
            />
            <Layer
                id="state-fill"
                type="fill"
                sourceId="boundaries"
                sourceLayer="state"
                before="state-line"
                onMouseMove={handleMouseMove(0)}
                paint={stateFillStyle(
                    classBreaks,
                    indicator,
                    aggType,
                    perCapita,
                )}
            />
            <Layer
                id="facility-circle"
                type="circle"
                sourceId="boundaries"
                sourceLayer="facility"
                before="road-label"
                onMouseMove={handleMouseMove(3)}
                paint={facilityCircleStyle(
                    classBreaks,
                    indicator,
                    aggType,
                    perCapita,
                )}
            />
        </>
    );
}
