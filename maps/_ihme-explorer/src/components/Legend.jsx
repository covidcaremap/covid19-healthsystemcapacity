import React from 'react';
import { getBreaksStyle, formatNumber } from '../utils/healthcareMapStyling';

export default function Legend({ classBreaks, indicator }) {
  if (!classBreaks) return null;
  const { colors } = getBreaksStyle(classBreaks, indicator);

  const legendSteps = colors.map((color, i) => {
    const from = formatNumber(classBreaks[i], indicator, 1);
    return (
      <React.Fragment key={`break-${i}`}>
        <div className="legend-color" style={{ backgroundColor: color }}></div>

        <div className="legend-numbers">{from}</div>
      </React.Fragment>
    );
  });
  return (
    <div className="legend-container">
      <div id="legend">{legendSteps}</div>
    </div>
  );
}
