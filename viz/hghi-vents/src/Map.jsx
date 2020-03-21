import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useAsync } from 'react-use';

import ClassyBrew from 'classybrew';

import { GeoJSON, Map, TileLayer } from 'react-leaflet'
import { Card } from 'antd';
import Control from 'react-leaflet-control';

import {displayAttrs} from './utils';

const hghiVentDataUrl = './hghi_state_data_with_vents.geojson';

const defaultStyle = {
    weight: 2,
    fillOpacity: 0.9,
    color: '#aaa',
};

const classificationMethod = 'quantile' // or jenks, equal_interval

const createHoverDisplay = (feature, activeAttribute) => {
    const attrs = feature?.properties;
    const title = feature ? attrs['State Name'] : "Select state";
    const content = feature ? displayAttrs.map((attr, idx) => {
        const activeClass = attr === activeAttribute ? 'active-attr' : '';
        return (
            <div key={`disp-${idx}`} className={`${activeClass} attr-display`}>
                <p><strong>{attr}</strong></p>
                <p>{clean(attrs[attr], true)}</p>
            </div>
        );
    }) : '';

    return (
        <Card 
            className="state-attrs"
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
            background: brew.getColorInRange(from+1)
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

const clean = (val, pretty=false) => {
    let out = val;
    if (typeof(val) === "string") {
        out = parseFloat(val.replace(',', ''));
    }
    out = parseFloat(out.toFixed(2));

    if (pretty) {
        out = out.toLocaleString();
    }
    return out;
}

export default function VentMap({activeAttribute}) {
    const [hiFeature, setHiFeature] = useState(null);
    const [currentBrew, setCurrentBrew] = useState(null);
    const [baseData, setBaseData] = useState(null);
    const [currentLayer, setCurrentLayer] = useState(null);

    // When the selected attribute changes, rerender the layer
    useEffect (() => {
        if (!baseData) return;
        const layer = createLayer(baseData);
        setCurrentLayer(layer)
    }, [activeAttribute, baseData]);

    // Determine the color breaks based on the values of the current
    // attribute for all states
    const createClasses = (attrName, collection) => {
        const brew = new ClassyBrew();
        const dataSeries = collection.features.map((feature) => clean(feature.properties[attrName]) || 0)

        brew.setSeries(dataSeries);
        brew.setNumClasses(5);
        brew.setColorCode('PuBu');
        brew.classify(classificationMethod);
        setCurrentBrew(brew);
        return brew;
    }

    // Restyle the feature currently being hovered over
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '4',
        });

        layer.bringToFront();
        setHiFeature(layer.feature);
    }

    function resetHighlight(e) {
        e.target.setStyle({
            weight:2, color: '#aaa', dashArray: '',
        });
        setHiFeature(null);
    }

    function handleOnEach(feature, layer) {
        layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: highlightFeature,
        });
    }

    const featureStyle = (brew, attrName) => {
        return (feature) => {
            const style = Object.assign(defaultStyle, {
                fillColor: brew.getColorInRange(clean(feature.properties[attrName]))
            });
            return style;
        };
    }

    const createLayer = (geojson) => {
        const brew = createClasses(activeAttribute, geojson);
        return (<GeoJSON
            data={geojson}
            onEachFeature={handleOnEach}
            style={featureStyle(brew, activeAttribute)}/>);
    }

    useAsync(async (cur) => {
        const resp = await axios.get(hghiVentDataUrl);
        setBaseData(resp.data);
        setCurrentLayer(createLayer(resp.data));
    });

    const position = [42, -92]
    const highlightDisplay = createHoverDisplay(hiFeature, activeAttribute);
    const legend = createLegend(currentBrew);

    const map = (
        <Map center={position} zoom={4}>
            <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            />
            {currentLayer}
            <Control position="topright">{highlightDisplay}</Control>
            <Control position="bottomleft">{legend}</Control>
        </Map>
    )
    return map;
    
}
