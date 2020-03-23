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
  var el = this.event.toElement;
  el.parentNode.querySelectorAll("#aggregation button").forEach(function(item) {
    item.classList.remove("active");
  });
  el.classList.add("active");
  type = newType;
  onMapChange();
}

function setScenario(newScenario) {
  var el = this.event.toElement;
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
  if (usePerCapita(indicator)) {
    document.getElementById("number").classList.remove("disabled");
  } else {
    document.getElementById("number").classList.add("disabled");
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
    minMaxUrl: "data/config/ccm_state_min_max_values.json",
    includeState: false
  },
  {
    id: "hrr",
    label: "HRR",
    nameProperty: "HRRCITY",
    minMaxUrl: "data/config/ccm_hrr_min_max_values.json",
    includeState: false
  },
  {
    id: "county",
    label: "County",
    nameProperty: "County Name",
    minMaxUrl: "data/config/ccm_county_min_max_values.json",
    includeState: true
  },
  {
    id: "facility",
    label: "Facility",
    nameProperty: "Name",
    minMaxUrl: "data/config/ccm_facility_min_max_values.json",
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
    displayAsPercent: false
  },
  {
    propertyInData: "Staffed ICU Beds",
    label: "Staffed ICU Beds",
    colors: ["#ece7f2", "#2b8cbe"],
    displayAsPercent: false
  },
  {
    propertyInData: "Licensed All Beds",
    label: "Licensed All Beds",
    colors: ["#e5f5f9", "#2ca25f"],
    displayAsPercent: false
  },
  {
    propertyInData: "All Bed Occupancy Rate",
    label: "All Bed Occupancy Rate",
    colors: ["#D6EDEA", "#345672"],
    displayAsPercent: true
  },
  {
    propertyInData: "ICU Bed Occupancy Rate",
    label: "ICU Bed Occupancy Rate",
    colors: ["#EDCDD3", "#632864"],
    displayAsPercent: true
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
      return (
        "<tr><th>" +
        theIndicator.label +
        perCapita +
        "</th><td>" +
        formatNumber(feature.properties[getProperty(i)], i) +
        "</td></tr>"
      );
    })
    .join("");

  popup.setHTML(`<h1>${name}</h1><table>${rows}</table>`);

  // console.log(indicators[indicator].label);

  // var perCapita = usePerCapita(indicator) ? " " + numbers[number].label : "";

  // popup.setHTML(
  //   "<div class='tooltip-heading'>" +
  //     name +
  //     "</div>" +
  //     "<div class='tooltip-number'>" +
  //     formatNumber(feature.properties[getProperty(indicator)], indicator) +
  //     "</div>" +
  //     indicators[indicator].label +
  //     " " +
  //     perCapita
  // );
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
  return number !== 0 && theIndicator !== 3 && theIndicator !== 4 && type !== 3;
}

function getProperty(theIndicator) {
  var indicatorProperty = indicators[theIndicator]["propertyInData"];
  if (usePerCapita(theIndicator)) {
    indicatorProperty += numbers[number]["stringInData"];
  }
  return indicatorProperty;
}

function getMinMax() {
  return minMax[type][getProperty(indicator)];
}

function setFillPaintStyle(layerName) {
  var colors = indicators[indicator].colors;
  var minMaxValues = getMinMax();
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "fill-color", [
    "interpolate",
    ["linear"],
    ["number", ["get", getProperty(indicator)], minMaxValues[0]],
    minMaxValues[0],
    colors[0],
    minMaxValues[1],
    colors[1]
  ]);
}

function setLegend(colors, minMaxValues) {
  document.getElementById("legend-min").innerHTML = formatNumber(
    minMaxValues[0],
    indicator
  );
  document.getElementById("legend-max").innerHTML = formatNumber(
    minMaxValues[1],
    indicator
  );
  document.getElementById(
    "colors"
  ).style.backgroundImage = `linear-gradient(to right, ${colors[0]}, ${
    colors[1]
  })`;
}

function setCirclePaintStyle(layerName) {
  var colors = indicators[indicator].colors;
  var minMaxValues = getMinMax();
  map.setLayoutProperty(layerName, "visibility", "visible");
  setLegend(colors, minMaxValues);

  map.setPaintProperty(layerName, "circle-radius", [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      minMaxValues[0],
      1,
      minMaxValues[1],
      20
    ],
    10,
    [
      "interpolate",
      ["linear"],
      ["get", getProperty(indicator)],
      minMaxValues[0],
      5,
      minMaxValues[1],
      50
    ]
  ]);

  map.setPaintProperty(layerName, "circle-color", [
    "interpolate",
    ["linear"],
    ["get", getProperty(indicator)],
    minMaxValues[0],
    colors[0],
    minMaxValues[1],
    colors[1]
  ]);
}

var facilities = undefined;
var minMax = undefined;

map.on("load", function() {
  Promise.all(
    types.map(type =>
      fetch(type.minMaxUrl).then(function(response) {
        return response.json();
      })
    )
  ).then(data => {
    minMax = [data[0], data[1], data[2], data[3]];

    map.addSource("boundaries", {
      type: "vector",
      tiles: [window.location.origin + window.location.pathname + "data/tiles/{z}/{x}/{y}.pbf"],
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
