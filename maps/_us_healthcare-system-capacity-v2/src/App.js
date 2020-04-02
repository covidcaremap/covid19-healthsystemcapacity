import React, { useState } from 'react';
import './App.css';
import './fontello.css';
import './normalize.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';

function App() {
    // Track which aggregation and per capita types are selected
    // within the OptionsBar
    const [aggType, setAggType] = useState(2);
    const [perCapita, setPerCapita] = useState(1);
    const [indicator, setIndicator] = useState(0);

    const handleTypeChange = updatedType => {
        setAggType(updatedType);
    };
    const handleCapitaChange = updateCapita => {
        setPerCapita(updateCapita);
    };
    const handleIndicatorChange = updateIndicator => {
        setIndicator(updateIndicator);
    };

    return (
        <div className="app">
            <Header />
            <Sidebar
                onIndicatorChanged={handleIndicatorChange}
                indicator={indicator}
            />
            <Visualization
                perCapita={perCapita}
                onPerCapitaChange={handleCapitaChange}
                aggType={aggType}
                onTypeChange={handleTypeChange}
                indicator={indicator}
            />
        </div>
    );
}

export default App;
