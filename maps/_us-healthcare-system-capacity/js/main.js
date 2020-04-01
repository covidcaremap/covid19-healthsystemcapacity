mapboxgl.accessToken =
  "pk.eyJ1IjoiY292aWRjYXJlbWFwIiwiYSI6ImNrODlia3NvMTAzYmMzZmw5MTM3d3QyMXgifQ.XMvZuDfN2vnhi5ltTBx1MQ";

var defaultCircleRadius = 0;
var defaultCircleColor = "transparent";

var type = 2;
var number = 1;
var indicator = 0;

function formatNumber(x, theIndicator) {
  if (isNaN(x)) {
    return "N/A";
  } else if (indicators[theIndicator].displayAsPercent) {
    return (x * 100).toFixed(0) + "%";
  } else if (Number.isInteger(x)) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x.toFixed(2);
  }
}

function removeLayerAndSource(map, layer) {
  map.getLayer(layer) && map.removeLayer(layer);
  map.getSource(layer) && map.removeSource(layer);
}

function removeLayer(map, layer) {
  map.getLayer(layer) && map.removeLayer(layer);
}

function removeSource(map, layer) {
  map.getSource(layer) && map.removeSource(layer);
}

function setType(newType) {
  var el = this.event.target;
  el.parentNode.querySelectorAll("#aggregation button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  type = newType;
  onMapChange();
}

function setScenario(newScenario) {
  var el = this.event.target;
  el.parentNode.querySelectorAll("#scenario button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  scenario = newScenario;
  onMapChange();
}

function setIndicator(newIndicator) {
  var el = this.event.target;
  el.parentNode.querySelectorAll("#indicator button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  indicator = newIndicator;
  onMapChange();
}

function setNumber() {
  number = this.event.target.value;
  onMapChange();
}

function onMapChange() {
  map.off("mousemove", "state-fill", updatePopup);
  map.off("mouseleave", "state-fill", removePopup);
  map.off("mousemove", "county-fill", updatePopup);
  map.off("mouseleave", "county-fill", removePopup);
  map.off("mousemove", "hrr-fill", updatePopup);
  map.off("mouseleave", "hrr-fill", removePopup);
  map.off("mousemove", "facility-circle", updatePopup);
  map.off("mouseleave", "facility-circle", removePopup);
  resetFillPaintStyle("state-fill");
  resetLinePaintStyle("state-line");
  resetFillPaintStyle("county-fill");
  resetLinePaintStyle("county-line");
  resetFillPaintStyle("hrr-fill");
  resetLinePaintStyle("hrr-line");
  resetCirclePaintStyle("facility-circle");
  if (allowTypeChange(indicator)) {
    document.getElementById("number").classList.remove("disabled");
  } else {
    var e = document.getElementById("number");
    e.classList.add("disabled");
  }
  if (type === 0) {
    setFillPaintStyle("state-fill");
    setLinePaintStyle("state-line");
    map.on("mousemove", "state-fill", updatePopup);
    map.on("mouseleave", "state-fill", removePopup);
  } else if (type === 1) {
    setFillPaintStyle("hrr-fill");
    setLinePaintStyle("hrr-line");
    map.on("mousemove", "hrr-fill", updatePopup);
    map.on("mouseleave", "hrr-fill", removePopup);
  } else if (type === 2) {
    setFillPaintStyle("county-fill");
    setLinePaintStyle("county-line");
    map.on("mousemove", "county-fill", updatePopup);
    map.on("mouseleave", "county-fill", removePopup);
  } else if (type === 3) {
    setCirclePaintStyle("facility-circle");
    map.on("mousemove", "facility-circle", updatePopup);
    map.on("mouseleave", "facility-circle", removePopup);
  }
}

var types = [
  {
    id: "state",
    label: "State",
    nameProperty: "State Name",
    breaksUrl: "data/config/ccm_state_breaks.json",
    includeState: false
  },
  {
    id: "hrr",
    label: "HRR",
    nameProperty: "HRRCITY",
    breaksUrl: "data/config/ccm_hrr_breaks.json",
    includeState: false
  },
  {
    id: "county",
    label: "County",
    nameProperty: "County Name",
    breaksUrl: "data/config/ccm_county_breaks.json",
    includeState: true
  },
  {
    id: "facility",
    label: "Facility",
    nameProperty: "Name",
    breaksUrl: "data/config/ccm_facility_breaks.json",
    includeState: false
  }
];

var numbers = [
  { label: "", stringInData: "" },
  {
    labelAbbreviated: "per 1k people",
    label: "per 1,000 people",
    stringInData: " [Per 1000 People]"
  },
  {
    labelAbbreviated: "per 1k adults (20+)",
    label: "per 1,000 adults (20+)",
    stringInData: " [Per 1000 Adults (20+)]"
  },
  {
    labelAbbreviated: "per 1k elderly (65+)",
    label: "per 1,000 elderly (65+)",
    stringInData: " [Per 1000 Elderly (65+)]"
  }
];

var indicators = [
  {
    propertyInData: "Staffed All Beds",
    label: "Staffed All Beds",
    colors: ["#fff7fb", "#9db5ce", "#4d7596", "#023858"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "Staffed ICU Beds",
    label: "Staffed ICU Beds",
    colors: ["#f7fcfd", "#b0aacb", "#7a5a8d", "#4d004b"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "Licensed All Beds",
    label: "Licensed All Beds",
    colors: ["#f7fcfd", "#8cc1aa", "#40825e", "#00441b"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "All Bed Occupancy Rate",
    label: "All Bed Occupancy Rate",
    colors: ["#f3e7e9", "#d49ebb", "#a55c90", "#6c2167"],
    displayAsPercent: true,
    radii: [[1, 8], [5, 40]]
  },
  {
    propertyInData: "ICU Bed Occupancy Rate",
    label: "ICU Bed Occupancy Rate",
    colors: ["#e9eeed", "#91bec5", "#56899d", "#2a5675"],
    displayAsPercent: true,
    radii: [[1, 8], [5, 40]]
  }
];

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/covidcaremap/ck89blkw62p7h1irla8z8b7fy",
  zoom: 3.5,
  center: [-96, 38],
  minZoom: 3,
  maxZoom: 14,
  hash: true
});

var nav = new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
});

map.addControl(nav, "top-right");

map.dragRotate.disable();

map.touchZoomRotate.disableRotation();

var popup;

var $body = document.getElementById("body");

document.onkeydown = function(e) {
  if (e.key === "Escape") {
    if ($body.classList.contains("modal-open")) hideModal();
  }
};

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

function updatePopup(event) {
  var feature = event.features[0];
  var nameProperty = types[type]["nameProperty"];
  var name = feature.properties[nameProperty];

  if (types[type].includeState) {
    name += ", " + feature.properties["State"];
  }

  var rows = indicators
    .map(function(theIndicator, i) {
      var perCapita = usePerCapita(i)
        ? " " + numbers[number].labelAbbreviated
        : "";
      return `<tr><th>${
        theIndicator.label
      } ${perCapita}</th><td>${formatNumber(feature.properties[getProperty(i)], i)}</td></tr>`;
    })
    .join("");

  popup.setHTML(
    `<div class="tooltip-heading">${name}</div><table>${rows}</table>`
  );

  popup.setLngLat(event.lngLat).addTo(map);
  map.getCanvas().style.cursor = "default";
}

function removePopup() {
  popup.remove();
  map.getCanvas().style.cursor = "";
}

function resetCirclePaintStyle(layerName) {
  map.setPaintProperty(layerName, "circle-radius", defaultCircleRadius);
  map.setPaintProperty(layerName, "circle-color", defaultCircleColor);
  map.setLayoutProperty(layerName, "visibility", "none");
}

function resetLinePaintStyle(layerName) {
  map.setLayoutProperty(layerName, "visibility", "none");
}

function setLinePaintStyle(layerName) {
  map.setLayoutProperty(layerName, "visibility", "visible");
}

function resetFillPaintStyle(layerName) {
  map.setPaintProperty(layerName, "fill-color", "transparent");
}

function usePerCapita(theIndicator) {
  // number == 0 is showing total values
  // Indicators 3 and 4 are capacity
  // type == 3 is facility-level data
  return number != 0 && !(theIndicator == 3 || theIndicator == 4) && type !== 3;
}

function allowTypeChange(theIndicator) {
  return !(theIndicator == 3 || theIndicator == 4) && type !== 3;
}

function getProperty(theIndicator) {
  var indicatorProperty = indicators[theIndicator]["propertyInData"];
  if (usePerCapita(theIndicator)) {
    indicatorProperty += numbers[number]["stringInData"];
  }
  return indicatorProperty;
}

function getBreaks() {
  var breakpoints = breaks[type][getProperty(indicator)];
  // TODO: Find a better way to handle this
  // Mapbox's step expression doesn't like it when one of the breakpoints is equal to the smallest
  // property value; this comes up some places in our map where the first breakpoint is 0, where it
  // won't style any of the features with a value of 0. I am temporarily getting around this by
  // adding a very small value to the break point when this happens.
  var modifiedBreaks = breakpoints.map(function(breakpoint, i) {
    if (i > 0 && breakpoint === breakpoints[i - 1]) {
      return breakpoint + 0.0000000000001;
    } else {
      return breakpoint;
    }
  });
  return modifiedBreaks;
}

function setFillPaintStyle(layerName) {
  var breaksValues = getBreaks();
  var colors = indicators[indicator].colors;
  var breaks = _.flatten(_.zip(breaksValues, colors)).splice(
    1,
    colors.length + breaksValues.length - 2
  );

  style = [
    "case",
    // Check to make sure property is not undefined
    ["all", ["has", getProperty(indicator)]],
    ["step", ["number", ["get", getProperty(indicator)]]].concat(breaks),
    // Fallback color for undefined indicator
    "#ccc"
  ];

  setLegend(colors, breaksValues);

  map.setPaintProperty(layerName, "fill-color", style);
}

function setLegend(colors, breaksValues) {
  var legend = colors
    .map(function(color, i) {
      return `<div class="legend-color" style="background-color: ${color}"></div><div class="legend-numbers">${formatNumber(breaksValues[i], indicator)}–${formatNumber(breaksValues[i + 1], indicator)}</div>`;
    })
    .join("");
  document.getElementById("legend").innerHTML = legend;
}

function setCirclePaintStyle(layerName) {
  var colors = indicators[indicator].colors,
    radii = indicators[indicator].radii,
    breaksValues = getBreaks(),
    radiiZ1 = _.map([...Array(breaksValues.length).keys()], function(i) {
      return (i / breaksValues.length) * 19 + 1;
    }),
    radiiZ2 = _.map([...Array(breaksValues.length).keys()], function(i) {
      return (i / breaksValues.length) * 5 + 5;
    });

  map.setLayoutProperty(layerName, "visibility", "visible");
  setLegend(colors, breaksValues);

  map.setPaintProperty(layerName, "circle-radius", [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      breaksValues[0],
      radii[0][0],
      breaksValues[breaksValues.length - 1],
      radii[0][1]
    ],
    10,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      breaksValues[0],
      radii[1][0],
      breaksValues[breaksValues.length - 1],
      radii[1][1]
    ]
  ]);

  var breaksValues = getBreaks();
  var colors = indicators[indicator].colors;
  var breaks = _.flatten(_.zip(breaksValues, colors)).splice(
    1,
    colors.length + breaksValues.length - 2
  );

  map.setPaintProperty(
    layerName,
    "circle-color",
    ["step", ["number", ["get", getProperty(indicator)]]].concat(breaks)
  );
}

var facilities = undefined;
var breaks = undefined;

map.on("load", function() {
  Promise.all(
    types.map(type =>
      fetch(type.breaksUrl).then(function(response) {
        return response.json();
      })
    )
  ).then(data => {
    breaks = [data[0], data[1], data[2], data[3]];

    map.addSource("boundaries", {
      type: "vector",
      tiles: [
        window.location.origin +
          window.location.pathname +
          "data/tiles/{z}/{x}/{y}.pbf"
      ],
      minzoom: 3,
      maxzoom: 8
    });

    map.addLayer(
      {
        id: "county-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "county",
        paint: {
          "fill-color": "transparent"
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "county-line",
        type: "line",
        source: "boundaries",
        "source-layer": "county",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.25, 10, 2],
          "line-color": "#000",
          "line-opacity": 0.25
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "hrr-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "hrr",
        paint: {
          "fill-color": "transparent"
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "hrr-line",
        type: "line",
        source: "boundaries",
        "source-layer": "hrr",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.25, 10, 2],
          "line-color": "#000",
          "line-opacity": 0.25
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "state-line",
        type: "line",
        source: "boundaries",
        "source-layer": "state",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.75, 10, 4],
          "line-color": "#000",
          "line-opacity": 0.25
        }
      },
      "road-label"
    );

    map.addLayer(
      {
        id: "state-fill",
        type: "fill",
        source: "boundaries",
        "source-layer": "state",
        paint: {
          "fill-color": "transparent"
        }
      },
      "state-line"
    );

    map.addLayer(
      {
        id: "facility-circle",
        type: "circle",
        source: "boundaries",
        "source-layer": "facility",
        paint: {
          "circle-radius": defaultCircleRadius,
          "circle-color": defaultCircleColor,
          "circle-stroke-color": "#000",
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            0.5,
            10,
            1
          ],
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 10, 1]
        }
      },
      "road-label"
    );

    onMapChange();
  });
});

function handleFirstTab(e) {
  if (e.keyCode === 9) {
    // the "I am a keyboard user" key
    document.body.classList.add("user-is-tabbing");
    window.removeEventListener("keydown", handleFirstTab);
  }
}

window.addEventListener("keydown", handleFirstTab);
