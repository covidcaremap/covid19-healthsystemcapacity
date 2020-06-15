import React, { useState } from 'react';
import ReactMapGL, { Source, ZoomControl } from 'react-mapbox-gl';
import * as _ from 'underscore';
import { Layer } from 'react-mapbox-gl';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import {
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight,
} from '@deck.gl/core';
import { scaleThreshold } from 'd3-scale';
import IHMELayers from './IHMELayers';
import PopupContent from './PopupContent';
import Legend from './Legend';
import { aggregationTypes } from '../utils/config';

const MapGL = ReactMapGL({
  accessToken:
    'pk.eyJ1IjoiY292aWRjYXJlbWFwIiwiYSI6ImNrODlia3NvMTAzYmMzZmw5MTM3d3QyMXgifQ.XMvZuDfN2vnhi5ltTBx1MQ',
  minZoom: 0,
  maxZoom: 14,
  hash: true,
});

const center = [-46, 38];
const zoom = [1.75];
const boundarySource = {
  type: 'vector',
  tiles: [
    window.location.origin +
      window.location.pathname +
      'data/tiles/{z}/{x}/{y}.pbf',
  ],
  minzoom: 0,
  maxzoom: 8,
};

export default function Map({
  dates,
  aggType,
  activeDate,
  indicator,
  boundLevel,
  usePerCapita,
  configLoaded,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupDetails, setPopupDetails] = useState();

  let currentBreaks = null;

  if (aggregationTypes[aggType].breaks) {
    if (usePerCapita) {
      currentBreaks =
        aggregationTypes[aggType].breaks['per_capita'][indicator][boundLevel];
    } else {
      currentBreaks =
        aggregationTypes[aggType].breaks['totals'][indicator][boundLevel];
    }
  }

  const handleHoverFeature = (feature, coordinates) => {
    setPopupDetails({ coords: coordinates, feature: feature });
    setShowPopup(true);
  };

  const popup = showPopup ? (
    <PopupContent
      feature={popupDetails.feature}
      coordinates={popupDetails.coords}
      dates={dates}
      aggType={aggType}
      indicator={indicator}
      activeDate={activeDate}
      boundLevel={boundLevel}
      usePerCapita={usePerCapita}
    />
  ) : null;

  const handleMapOut = (e) => {
    e._canvas.style.cursor = '';
    setShowPopup(false);
  };

  const layers = !configLoaded ? null : (
    <IHMELayers
      dates={dates}
      aggType={aggType}
      activeDate={activeDate}
      indicator={indicator}
      boundLevel={boundLevel}
      usePerCapita={usePerCapita}
      onHover={handleHoverFeature}
      onHoverOut={handleMapOut}
      classBreaks={currentBreaks}
    />
  );

  return (
    <div className="map-container">
      <MapGL
        className="map"
        zoom={zoom}
        center={center}
        dragRotate={false}
        pitchWithRotate={false}
        touchZoomRotate={false}
        onMouseMove={handleMapOut}
        // eslint-disable-next-line
        style="mapbox://styles/covidcaremap/ck89blkw62p7h1irla8z8b7fy"
      >
        <Source id="boundaries" tileJsonSource={boundarySource} />
        {popup}
        {layers}
        <ZoomControl position="top-right" />
        <Legend
          indicator={indicator}
          aggType={aggType}
          classBreaks={currentBreaks}
          usePerCapita={usePerCapita}
          boundLevel={boundLevel}
        />
      </MapGL>

      {/* </DeckGL> */}
    </div>
  );
}
