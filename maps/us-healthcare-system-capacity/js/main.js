mapboxgl.accessToken =
  "pk.eyJ1IjoiYXphdmVhIiwiYSI6IkFmMFBYUUUifQ.eYn6znWt8NzYOa3OrWop8A";

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
    colors: ["#e0ecf4", "#8856a7"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "Staffed ICU Beds",
    label: "Staffed ICU Beds",
    colors: ["#ece7f2", "#2b8cbe"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "Licensed All Beds",
    label: "Licensed All Beds",
    colors: ["#e5f5f9", "#2ca25f"],
    displayAsPercent: false,
    radii: [[1, 20], [5, 50]]
  },
  {
    propertyInData: "All Bed Occupancy Rate",
    label: "All Bed Occupancy Rate",
    colors: ["#D6EDEA", "#345672"],
    displayAsPercent: true,
    radii: [[1, 8], [5, 40]]
  },
  {
    propertyInData: "ICU Bed Occupancy Rate",
    label: "ICU Bed Occupancy Rate",
    colors: ["#EDCDD3", "#632864"],
    displayAsPercent: true,
    radii: [[1, 8], [5, 40]]
  }
];

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/azavea/ck7z6wmai0zje1ioas2t1bzoo",
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
  return breaks[type][getProperty(indicator)];
}

function setFillPaintStyle(layerName) {
  var colorsMinMax = indicators[indicator].colors,
    breaksValues = getBreaks(),
    palette = interpolate(colorsMinMax),
    colors = _.map([...Array(breaksValues.length).keys()], function(i) {
      return palette(i / breaksValues.length);
    }),
    style = [
      "interpolate",
      ["linear"],
      ["number", ["get", getProperty(indicator)], breaksValues[0]]
    ].concat(_.flatten(_.zip(breaksValues, colors)));

  setLegend(colors, breaksValues);

  map.setPaintProperty(layerName, "fill-color", style);
}

function setLegend(colors, breaksValues) {
  document.getElementById("legend-min").innerHTML = formatNumber(
    breaksValues[0],
    indicator
  );
  document.getElementById("legend-max").innerHTML = formatNumber(
    breaksValues[breaksValues.length - 1],
    indicator
  );
  document.getElementById(
    "colors"
  ).style.backgroundImage = `linear-gradient(to right, ${colors[0]}, ${
    colors[colors.length - 1]
  })`;
}

function setCirclePaintStyle(layerName) {
  var colorsMinMax = indicators[indicator].colors,
    radii = indicators[indicator].radii,
    breaksValues = getBreaks(),
    palette = interpolate(colorsMinMax),
    colors = _.map([...Array(breaksValues.length).keys()], function(i) {
      return palette(i / breaksValues.length);
    }),
    radiiZ1 = _.map([...Array(breaksValues.length).keys()], function(i) {
      return (i / breaksValues.length) * 19 + 1;
    }),
    radiiZ2 = _.map([...Array(breaksValues.length).keys()], function(i) {
      return (i / breaksValues.length) * 5 + 5;
    });

  map.setLayoutProperty(layerName, "visibility", "visible");
  setLegend(colors, breaksValues);

  // ].concat(_.flatten(_.zip(breaksValues, radiiZ1))),
  // ].concat(_.flatten(_.zip(breaksValues, radiiZ2)))

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

  map.setPaintProperty(
    layerName,
    "circle-color",
    ["interpolate", ["linear"], ["get", getProperty(indicator)]].concat(
      _.flatten(_.zip(breaksValues, colors))
    )
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

    // map.addSource("facility", {
    //   type: "geojson",
    //   data: facilities
    // });

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
