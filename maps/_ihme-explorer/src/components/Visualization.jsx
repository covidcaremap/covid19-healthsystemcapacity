import React, { useState } from 'react';
import Map from './Map';
import OptionsBar from './OptionsBar';

export default function Visualization({
    aggType,
    usePerCapita,
    boundLevel,
    indicator,
    activeDate,
    onActiveDateChange,
    dates,
    configLoaded
}) {
    return (
        <div className="visualization">
          <OptionsBar
            indicator={indicator}
            activeDate={activeDate}
            onActiveDateChange={onActiveDateChange}
            dates={dates}
          />
          <Map
            dates={dates}
            aggType={aggType}
            activeDate={activeDate}
            indicator={indicator}
            boundLevel={boundLevel}
            usePerCapita={usePerCapita}
            configLoaded={configLoaded}
          />
        </div>
    );
}
