import React, { useState } from 'react';
import * as _ from 'underscore';
import { Slider, Button, ButtonGroup, MenuItem } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { DateInput } from '@blueprintjs/datetime';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import moment from 'moment';
import NewTabLink from './NewTabLink';
import { aggregationTypes, indicators } from '../utils/config';
import { formatNumber } from '../utils/healthcareMapStyling';

export default function Sidebar({
  modelVersion,
  aggType,
  onAggTypeChange,
  usePerCapita,
  onUsePerCapitaChange,
  boundLevel,
  onBoundLevelChange,
  indicator,
  onIndicatorChange,
}) {
  const handleAggTypeChange = (typeId) => {
    return () => onAggTypeChange(typeId);
  };

  const handleUsePerCapitaChange = (flag) => {
    return () => onUsePerCapitaChange(flag);
  };

  const handleBoundLevelChanged = (level) => {
    return () => onBoundLevelChange(level);
  };

  const handleIndicatorChanged = (indicatorId) => {
    return () => onIndicatorChange(indicatorId);
  };

  const aggregationButtons = _.map(_.pairs(aggregationTypes), (kv) => {
    return (
      <Button
        key={kv[0]}
        active={aggType === kv[0]}
        onClick={handleAggTypeChange(kv[0])}
        className="two-selector-button"
      >
        {kv[1].label}
      </Button>
    );
  });

  const indicatorButtons = _.map(
    _.sortBy(_.pairs(indicators), (kv) => kv[1].order),
    (kv) => {
      return (
        <button
          key={kv[0]}
          className={indicator === kv[0] ? 'active' : ''}
          onClick={handleIndicatorChanged(kv[0])}
        >
          <div className="button-icon" style={{ color: '#023858' }}>
            <i className="icon-dot-circled"></i>
            <i className="icon-circle-empty"></i>
          </div>
          <div className="button-text">
            <div className="button-label">{kv[1].label}</div>
            <div className="button-description">{kv[1].description}</div>
          </div>
        </button>
      );
    },
  );

  return (
    <div className="sidebar">
      <div className="content">
        <h2 className="large">IHME COVID-19 Projections</h2>
        <p id="model-version">Model Version: {modelVersion}</p>
        <p>
          <b>Source:</b> Institute for Health Metrics and Evaluation (IHME).
          COVID-19 Hospital Needs and Death Projections. Seattle, United States
          of America: Institute for Health Metrics and Evaluation (IHME),
          University of Washington, 2020.{' '}
          <a href="http://www.healthdata.org/covid">
            http://www.healthdata.org/covid
          </a>
        </p>
        <p>
          <b>Disclaimer:</b> Projections are estimates and assume that current
          social distancing is strictly adhered to until infections are
          minimized and containment is implemented. Projections can change with
          new data (see{' '}
          <a href="http://www.covid-projections.com/">covid-projections</a>) and
          there are different models with different projections (see{' '}
          <a href="https://reichlab.io/covid19-forecast-hub/">
            Reich Lab COVID-19 Forecast Hub
          </a>
          ).
        </p>
        {!!aggregationTypes['country'].per_capita_base && (
          <p>
            {`Per capita figure are per ${formatNumber(
              aggregationTypes['country'].per_capita_base,
            )} people for national data, and per `}
            {`${formatNumber(
              aggregationTypes['region'].per_capita_base,
            )} people for regional data.`}
          </p>
        )}
        <hr />
        <div className="sidebar-button-panel" id="sidebar-option-buttons">
          <div className="map-options sidebar-button-group-container">
            <ButtonGroup className="sidebar-button-group">
              {aggregationButtons}
            </ButtonGroup>
          </div>
          <div className="map-options sidebar-button-group-container">
            <ButtonGroup className="sidebar-button-group">
              <Button
                id="per-capita-button"
                active={usePerCapita}
                onClick={handleUsePerCapitaChange(true)}
                className="two-selector-button"
              >
                Per Capita
              </Button>
              <Button
                active={!usePerCapita}
                onClick={handleUsePerCapitaChange(false)}
                className="two-selector-button"
              >
                Totals
              </Button>
            </ButtonGroup>
          </div>
          <div className="map-options sidebar-button-group-container">
            <ButtonGroup className="sidebar-button-group">
              <Button
                active={boundLevel === 'lower' ? 'active' : ''}
                onClick={handleBoundLevelChanged('lower')}
                className="three-selector-button"
              >
                Lower
              </Button>
              <Button
                active={boundLevel === 'mean' ? 'active' : ''}
                onClick={handleBoundLevelChanged('mean')}
                className="three-selector-button"
              >
                Mean
              </Button>
              <Button
                active={boundLevel === 'upper' ? 'active' : ''}
                onClick={handleBoundLevelChanged('upper')}
                className="three-selector-button"
              >
                Upper
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div className="map-options menu" id="indicator">
          {indicatorButtons}
        </div>
      </div>
    </div>
  );
}
