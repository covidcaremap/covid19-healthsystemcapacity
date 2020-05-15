import React, { useState } from 'react';
import * as _ from 'underscore';
import { Slider, Button, ButtonGroup, MenuItem, Switch } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { DateInput } from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import moment from "moment";
import { aggregationTypes } from '../utils/config';

// Option Menu bar for selecting different aggregation levels
// Selected values are sent back to Visualizations to set Map
// properties.
export default function OptionsBar({
    activeDate,
    onActiveDateChange,
    dates
}) {
    let lastDateUpdateTime = Date.now();

    const updateDate = (dateIndex, force) => {
        if(force || Date.now() - lastDateUpdateTime > 150) {
            lastDateUpdateTime = Date.now();
            onActiveDateChange(dateIndex);
        }
    };

    const handleDateSliderChange = event => {
        updateDate(parseInt(event));
    };

    const handleDateSliderRelease = event => {
        updateDate(parseInt(event), true);
    };

    const formatDateToData = date => {
        return moment(date).format("YYYY-MM-DD");
    };

    const formatDateReadable = date => {
        return moment(date).format("MM/DD/YY");
    };

    const handleDateInputChange = event => {
        const dateFormatted = formatDateToData(event);
        console.log(dateFormatted);
        const dateIndex = dates.indexOf(dateFormatted);
        updateDate(dateIndex !== -1 ? dateIndex : dates.length - 1);
    };

    const handleDateButtonClick = dayDelta => {
        return event => {
            const newDateIndex = activeDate + dayDelta;
            if(newDateIndex >= 0 && newDateIndex < dates.length) {
                updateDate(newDateIndex);
            }

        };
    };

    return (
        <div className="options-container">
          <div className="primary-options">
            <div className="date-controls-container">
              <div className="date-picker" id="date-picker">
                <Button icon="minus" onClick={handleDateButtonClick(-1)}/>
                <DateInput
                  className="date-input"
                  popoverProps={{ minimal: true }}
                  formatDate={date => formatDateReadable(date)}
                  onChange={handleDateInputChange}
                  parseDate={str => new Date(str)}
                  canClearSelection={false}
                  placeholder={"Select date"}
                  value={new Date(moment(dates[activeDate]))}
                />
                <Button icon="plus"  onClick={handleDateButtonClick(1)}/>
              </div>
              <div className="date-slider" id="date-slider">
                <Slider
                  min={0}
                  max={dates.length - 1}
                  onChange={handleDateSliderChange}
                  onReleae={handleDateSliderRelease}
                  value={activeDate}
                  labelRenderer={number => formatDateReadable(dates[number]) }
                  stepSize={1}
                  labelStepSize={(dates.length - 1) / 2}
                  showTrackFill={false}
                />
              </div>
            </div>
          </div>
        </div>
    );
}
