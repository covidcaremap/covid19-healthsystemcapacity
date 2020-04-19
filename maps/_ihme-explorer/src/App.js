import React, { useState, useEffect } from 'react';
import * as _ from 'underscore';
import './normalize.css';
import './App.css';
import './fontello.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import { loadConfig, aggregationTypes, indicators, boundLevels } from './utils/config';

function App() {
    const [aggType, setAggType] = useState(
        // Grabs the key of the default setting
        _.filter(_.pairs(aggregationTypes), (pair => pair[1].default))[0][0]
    );
    const [indicator, setIndicator] = useState(
        _.filter(_.pairs(indicators), (pair => pair[1].default))[0][0]
    );
    const [boundLevel, setBoundLevel] = useState(
        _.filter(_.pairs(boundLevels), (pair => pair[1].default))[0][0]
    );
    const [usePerCapita, setUsePerCapita] = useState(true);
    const [activeDate, setActiveDate] = useState(0);
    const today = new Date().toISOString().slice(0, 10);
    const [dates, setDates] = useState([today, today]);

    const [loadingConfig, setLoadingConfig] = useState(false);
    const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
        if(!configLoaded && !loadingConfig) {
            setLoadingConfig(true);
            fetch("data/ihme-config.json")
                .then(response => response.json())
                .then(data => {
                    loadConfig(data, setDates, setActiveDate);
                    setConfigLoaded(true);
                    setLoadingConfig(false);
                });
        }
    });

    const handleTypeChange = (updatedType) => {
        setAggType(updatedType);
    };
    const handleUsePerCapitaChange = (updateCapita) => {
        setUsePerCapita(updateCapita);
    };
    const handleIndicatorChange = (updateIndicator) => {
        setIndicator(updateIndicator);
    };
    const handleActiveDateChange = (dateIndex) => {
        setActiveDate(dateIndex);
    };
    const handleBoundLevelChange = (newLevel) => {
        setBoundLevel(newLevel);
    };

    return (
        <div className="app">
          <Header />
          <Sidebar
            aggType={aggType}
            onAggTypeChange={handleTypeChange}
            usePerCapita={usePerCapita}
            onUsePerCapitaChange={handleUsePerCapitaChange}
            boundLevel={boundLevel}
            onBoundLevelChange={setBoundLevel}
            indicator={indicator}
            onIndicatorChange={handleIndicatorChange}
          />
          <Visualization
            aggType={aggType}
            usePerCapita={usePerCapita}
            boundLevel={boundLevel}
            indicator={indicator}
            activeDate={activeDate}
            onActiveDateChange={handleActiveDateChange}
            dates={dates}
            configLoaded={configLoaded}
          />
        </div>
    );
}

export default App;
