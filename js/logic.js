// Earthquake data link
var EarthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tectonic plates link
var TectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the Earthquake query URL
d3.json(EarthquakeLink, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data);
    
});


function createFeatures(earthquakeData) {       

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup(`<h3>${feature.properties.place}</h3><br><h4>Magnitude:  ${feature.properties.mag}</h4>
      </h3><hr><p> ${new Date(feature.properties.time)} </p>`);
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjakahzysbllh2rl87e2dg27b/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjc2vqswz0efp2rpfjnhunj68/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjc2wvic01j3l2rpbfsypf8qk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnVjaGljaGFuZHJhIiwiYSI6ImNqYzJ2dXlvcDA2a2gycW4zb2RkOXpmZjgifQ.EABSXTlj3gpJcvk8zJL2DQ");

  

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Outdoors": outdoorMap,
    "Grayscale": lightMap
  };

  // Add a tectonic plate layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    zoom: 2.5,
    layers: [lightMap, earthquakes, tectonicPlates]
  });

   // Add Fault lines data
   d3.json(TectonicPlatesLink, function(plateData) {
     // Adding our geoJSON data, along with style information, to the tectonicplates
     // layer.
     L.geoJson(plateData, {
       color: "orange",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);

}

function getColor(magnitude) {
  if (magnitude > 5) {
      return '#F30'
  } else if (magnitude > 4) {
      return '#F60'
  } else if (magnitude > 3) {
      return '#F90'
  } else if (magnitude > 2) {
      return '#FC0'
  } else if (magnitude > 1) {
      return '#FF0'
  } else {
      return '#9F3'
  }
};

function getRadius(value){
  return value*40000
}
