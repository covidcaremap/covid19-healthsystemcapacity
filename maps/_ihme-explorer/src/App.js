import React, { useState, useEffect } from 'react';
import * as _ from 'underscore';
import './normalize.css';
import './App.css';
import './fontello.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import {
  loadConfig,
  aggregationTypes,
  indicators,
  boundLevels,
} from './utils/config';

function App() {
  // IHME model version
  const [modelVersion, setModelVersion] = useState(null);

  // Map and indicator options
  const [aggType, setAggType] = useState(
    // Grabs the key of the default setting
    _.filter(_.pairs(aggregationTypes), (pair) => pair[1].default)[0][0],
  );
  const [indicator, setIndicator] = useState(
    _.filter(_.pairs(indicators), (pair) => pair[1].default)[0][0],
  );
  const [boundLevel, setBoundLevel] = useState(
    _.filter(_.pairs(boundLevels), (pair) => pair[1].default)[0][0],
  );
  const [usePerCapita, setUsePerCapita] = useState(true);

  // Data
  const [countryData, setCountryData] = useState(undefined);
  const [regionData, setRegionData] = useState(undefined);

  // Date
  const [activeDate, setActiveDate] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const [dates, setDates] = useState([today, today]);

  const [configLoaded, setConfigLoaded] = useState(false);
  const [countryDataLoaded, setCountryDataLoaded] = useState(false);
  const [regionDataLoaded, setRegionDataLoaded] = useState(false);

  useEffect(() => {
    if (!configLoaded) {
      fetch('data/ihme-config.json')
        .then((response) => response.json())
        .then((data) => {
          loadConfig(data, setModelVersion, setDates, setActiveDate);
          setConfigLoaded(true);
        });
    }

    if (!countryDataLoaded) {
      fetch('data/ihme-country-data.json')
        .then((response) => response.json())
        .then((data) => {
          setCountryData(data);
          setCountryDataLoaded(true);
        });
    }

    if (!regionDataLoaded) {
      fetch('data/ihme-region-data.json')
        .then((response) => response.json())
        .then((data) => {
          setRegionData(data);
          setRegionDataLoaded(true);
        });
    }
  }, []);

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
        modelVersion={modelVersion}
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
        countryData={countryData}
        regionData={regionData}
        dates={dates}
        configLoaded={configLoaded}
        countryData={countryData}
        regionData={regionData}
      />
    </div>
  );
}

export default App;
