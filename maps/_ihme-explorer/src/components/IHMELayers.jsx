import React from 'react';
import * as _ from 'underscore';
import { Layer } from 'react-mapbox-gl';
import { getFillStyle } from '../utils/healthcareMapStyling';
import { aggregationTypes } from '../utils/config';

export default function IHMELayers({
  dates,
  aggType,
  activeDate,
  indicator,
  boundLevel,
  usePerCapita,
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

  let layers = _.flatten(
    _.map(Object.entries(aggregationTypes), (kv) => {
      return [
        <Layer
          id={kv[0] + '-fill'}
          key={kv[0] + '-fill'}
          type="fill"
          sourceId="boundaries"
          sourceLayer={kv[0]}
          before="road-label"
          layout={{ visibility: aggType === kv[0] ? 'visible' : 'none' }}
          onMouseMove={handleMouseMove(kv[0])}
          paint={getFillStyle(kv[0])(
            dates,
            classBreaks,
            activeDate,
            indicator,
            aggType,
            boundLevel,
            usePerCapita,
          )}
        />,
        <Layer
          id={kv[0] + '-line'}
          key={kv[0] + '-line'}
          type="line"
          sourceId="boundaries"
          sourceLayer={kv[0]}
          before="road-label"
          layout={{ visibility: aggType === kv[0] ? 'visible' : 'none' }}
          paint={{
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 10, 3],
            'line-color': '#000',
            'line-opacity': 0.25,
          }}
        />,
      ];
    }),
  );

  return <>{layers}</>;
}
