import React from 'react';
import { shouldUsePerCapita } from '../utils/healthcareMapStyling';

// Option Menu bar for selecting different aggregation levels
// Selected values are sent back to Visualizations to set Map
// properties.
export default function OptionsBar({
    currentAggType,
    onTypeChange,
    currentPerCapita,
    onPerCapitaChange,
    indicator,
}) {
    const handleTypeChange = typeId => {
        return () => {
            onTypeChange(typeId);
        };
    };

    const handlePerCapitaChange = e => {
        onPerCapitaChange(parseFloat(e.target.value));
    };

    return (
        <div className="options-container">
            <div className="primary-options">
                <span className="menu" id="aggregation">
                    <b>Aggregation</b>
                    <button
                        className={currentAggType === 0 ? 'active' : ''}
                        onClick={handleTypeChange(0)}
                    >
                        State
                    </button>
                    <button
                        className={currentAggType === 1 ? 'active' : ''}
                        onClick={handleTypeChange(1)}
                    >
                        HRR
                    </button>
                    <button
                        className={currentAggType === 2 ? 'active' : ''}
                        onClick={handleTypeChange(2)}
                    >
                        County
                    </button>
                    <button
                        className={currentAggType === 3 ? 'active' : ''}
                        onClick={handleTypeChange(3)}
                    >
                        Facility
                    </button>
                </span>

                <span className="menu" id="number">
                    <b>Numbers</b>
                    <select
                        id="numbers-select"
                        disabled={
                            !shouldUsePerCapita(
                                indicator,
                                currentPerCapita,
                                currentAggType,
                            )
                        }
                        defaultValue={currentPerCapita}
                        onChange={handlePerCapitaChange}
                    >
                        <option value={0}>show absolute numbers</option>
                        <option value={1}>per 1,000 people</option>
                        <option value={2}>per 1,000 adults (20+)</option>
                        <option value={3}>per 1,000 elderly (65+)</option>
                    </select>
                </span>
            </div>
        </div>
    );
}
