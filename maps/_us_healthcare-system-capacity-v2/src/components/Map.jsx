import React, { useState } from 'react';
import ReactMapGL, { Source, ZoomControl } from 'react-mapbox-gl';
import HealthCareLayers from './HealthCareLayers';
import PopupContent from './PopupContent';

const MapGL = ReactMapGL({
    accessToken:
        'pk.eyJ1IjoiY292aWRjYXJlbWFwIiwiYSI6ImNrODlia3NvMTAzYmMzZmw5MTM3d3QyMXgifQ.XMvZuDfN2vnhi5ltTBx1MQ',
    minZoom: 3,
    maxZoom: 14,
    hash: true,
});

const center = [-96, 38];
const zoom = [3.5];
const boundarySource = {
    type: 'vector',
    tiles: [
        window.location.origin +
            window.location.pathname +
            'data/tiles/{z}/{x}/{y}.pbf',
    ],
    minZoom: 3,
    maxZoom: 8,
};

export default function Map({ indicator, aggType, perCapita }) {
    const [showPopup, setShowPopup] = useState(false);
    const [popupDetails, setPopupDetails] = useState();

    const handleHoverFeature = (feature, coordinates) => {
        setPopupDetails({ coords: coordinates, feature: feature });
        setShowPopup(true);
    };

    const popup = showPopup ? (
        <PopupContent
            feature={popupDetails.feature}
            coordinates={popupDetails.coords}
            aggType={aggType}
            perCapita={perCapita}
        />
    ) : null;

    const handleMapOut = (e) => {
        e._canvas.style.cursor = '';
        setShowPopup(false);
    };

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
                style="mapbox://styles/covidcaremap/ck89blkw62p7h1irla8z8b7fy"
            >
                <Source id="boundaries" tileJsonSource={boundarySource} />
                {popup}
                <HealthCareLayers
                    indicator={indicator}
                    aggType={aggType}
                    perCapita={perCapita}
                    onHover={handleHoverFeature}
                />
                <ZoomControl position="top-right" />
            </MapGL>
        </div>
    );
}
/*
    <div class="map-container">
      <div class="map" id="map">
        <div class="legend-container">
          <div id="legend"></div>
        </div>
      </div>
    </div>
*/
