import React, {useRef, useState} from 'react';
import axios from 'axios';
import { useAsync } from 'react-use';

import ClassyBrew from 'classybrew';

import { GeoJSON, Map, TileLayer } from 'react-leaflet'
import { Card } from 'antd';
import Control from 'react-leaflet-control';

const hghiVentDataUrl = './hghi_state_data_with_vents.geojson';
const vizAttribute = 'Estimated No. Full-Featured Mechanical Ventilators per 100,000 Population';

const displayAttrs = [
    'Estimated No. Full-Featured Mechanical Ventilators',
    'Estimated No. Full-Featured Mechanical Ventilators per 100,000 Population',
    'Total ICU Beds',
    'Available ICU Beds',
    //'Potentially Available ICU Beds*',
    //'ICU Beds Needed, Six Months',
    //'ICU Beds Needed, Twelve Months',
    //'ICU Beds Needed, Eighteen Months',
]

const defaultStyle = {
    weight: 2,
    fillOpacity: 0.9,
    color: '#ccc',
};


const createHoverDisplay = (feature) => {
    const attrs = feature?.properties;
    const title = feature ? attrs['State Name'] : "Hover over a state";
    const content = feature ? displayAttrs.map((attr, idx) => {
        return (
            <div key={`disp-${idx}`}>
                <p>{attr}</p>
                <p>{attrs[attr]}</p>
            </div>
        );
    }) : '';

    return (
        <Card 
            size="small" 
            title={title}
            style={{width: 300}}
        >
        {content} 
        </Card>
    )
}

const createLegend = (brew) => {
    if (!brew) return;

    const breaks = brew.getBreaks();
    const labels = [];

    for (let i=0; i< breaks.length; i++) {
        const from = breaks[i];
        const to = breaks[i+1];
        const style = {
            background: brew.getColorInRange(from)
        }
        if (to) {
            labels.push(
                    <React.Fragment key={`leg-${i}`}>
                        <i style={style}></i>
                        {`${from} - ${to}`}
                        <br/>
                    </React.Fragment>
            )        
        }
    }

    return (
        <Card className="legend" size="small">
            {labels}
        </Card> 
    )
}

export default function VentMap() {
    const LRef = useRef(null);
    const [hiFeature, setHiFeature] = useState(null);
    const [currentBrew, setCurrentBrew] = useState(null);

    const createClasses = (attrName, collection) => {
        const brew = new ClassyBrew();
        const dataSeries = collection.features.map((feature) => feature.properties[attrName] || 0)
        brew.setSeries(dataSeries);
        brew.setNumClasses(5);
        brew.setColorCode('BuPu');
        brew.classify('jenks');
        setCurrentBrew(brew);
        return brew;
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
        });

        layer.bringToFront();
        setHiFeature(layer.feature);
    }

    function resetHighlight(e) {
        LRef.current.leafletElement.resetStyle(e.target);
        setHiFeature(null);
    }

    function handleOnEach(feature, layer) {
        layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
        });
    }

    const handleOnClick = (e) => {
        console.log(e);
    }

    const featureStyle = (brew, attrName) => {
        return (feature) => {
            const style = Object.assign(defaultStyle, {
                fillColor: brew.getColorInRange(feature.properties[attrName])
            });
            return style;
        };
    }

    const createLayer = (geojson) => {
        const brew = createClasses(vizAttribute, geojson);
        return (<GeoJSON
            data={geojson}
            onclick={handleOnClick}
            onEachFeature={handleOnEach}
            ref={LRef}
            style={featureStyle(brew, vizAttribute)}/>);
    }

    const dataReq = useAsync(async () => {
        const resp = await axios.get(hghiVentDataUrl);
        return createLayer(resp.data);
    });

    const layer = dataReq.value ?? null;
    const position = [42, -92]
    const highlightDisplay = createHoverDisplay(hiFeature);
    const legend = createLegend(currentBrew);

    const map = (
        <Map center={position} zoom={4}>
            <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            />
            {layer}
            <Control position="topright">{highlightDisplay}</Control>
            <Control position="bottomright">{legend}</Control>
        </Map>
    )
    return map;
    
}
