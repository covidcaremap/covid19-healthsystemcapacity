import React from 'react';
import Map from './Map';
import OptionsBar from './OptionsBar';

export default function Visualization({
    aggType,
    onTypeChange,
    perCapita,
    onPerCapitaChange,
    indicator,
}) {
    return (
        <div className="visualization">
            <OptionsBar
                onPerCapitaChange={onPerCapitaChange}
                onTypeChange={onTypeChange}
                currentAggType={aggType}
                currentPerCapita={perCapita}
                indicator={indicator}
            />
            <Map
                indicator={indicator}
                aggType={aggType}
                perCapita={perCapita}
            />
        </div>
    );
}
