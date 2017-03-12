require('whatwg-fetch')
var ol = require('openlayers')
var proj4 = require('proj4')
var Promise = require('es6-promise')

var styles = require('./styles')
var groupIt = require('./groupit')

proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")
proj4.defs("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs")

ol.proj.setProj4(proj4)

var styleFunction = function (override, feature) {
  return styles[override || feature.getGeometry().getType()];
};

function getPixelFeatures(px, py) {
  return new Promise(function(resolve, reject) {
    var agg = {};
    map.forEachFeatureAtPixel([px, py], function(f) {
      var prop = f.getProperties()
      console.log('feature', prop)
      var propnames = Object.getOwnPropertyNames(prop)
      // var newdata = {}
      delete(prop.geometry)
      propnames.forEach(function(k) {
        agg[k] = prop[k]
      })
    })
    setTimeout(function(k) {
      console.log('agg', agg)
      resolve(agg)
    }, 300)
  })
}

function clearLayers() {
  console.log('map', map)
  var layers = map.getLayers()
  var num = layers.length
  console.log('number of layers', num)
  for (var i = num - 1; i >= 1; i--) {
    map.removeLayer(layers.item(i))
  }
}

var handler1 = new ol.interaction.Pointer({
  handleDownEvent: function(e) {
    var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    console.log('click on', e.pixel, e.coordinate, t)
    var p1 = getPixelFeatures(e.pixel[0], e.pixel[1]);
    p1.then(function(clean) {
      var grouped = groupIt(clean)
      document.getElementById('overlay').innerText = JSON.stringify(grouped, null, 2)
      clearLayers();
      loadPointsLayer('http://localhost:8080/api/point/?lat=' + t[0] + '&lng=' + t[1], { featureProjection: 'EPSG:3857' })
      loadRelatedLayer('http://localhost:8080/api/related/?lat=' + t[0] + '&lng=' + t[1] + '&fields=income_5064_mid,income_5064_med', { featureProjection: 'EPSG:3857' })
    })
  }
})

var map = new ol.Map({
  renderer: 'webgl',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        // url: "http://tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
        url: 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png'
      }),
      opacity: 0.2,
    }),
  ],
  target: 'map',
  interactions: ol.interaction.defaults().extend([handler1]),
  view: new ol.View({
    center: ol.proj.fromLonLat([15.066667, 62.35]),
    zoom: 5
  })
});


function loadGeoJsonLayer(url, proj, style, hidden) {
  var data = {};
  fetch(url).then(function(response) {
    console.log('response', response);
    response.json().then(function(json) {
      console.log('json', json)
      var gj2 = new ol.format.GeoJSON()
      var features2 = gj2.readFeatures(json, proj)
      console.log('features2', features2)
      var vectorSource2 = new ol.source.Vector({ features: features2 })
      var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
      // vectorLayer2.setVisible(!(hidden || false))
      map.addLayer(vectorLayer2)
      data.layer = vectorLayer2;
    });
  });
  return data;
}

function loadPointsLayer(url, proj, style, hidden) {
  var data = {};
  fetch(url).then(function(response) {
    console.log('response', response);
    response.json().then(function(json) {
      console.log('json', json)

      var fcollection = {
        type: 'FeatureCollection',
        features: json 
      };

      var gj2 = new ol.format.GeoJSON()
      var features2 = gj2.readFeatures(fcollection, proj)
      console.log('features2', features2)
      var vectorSource2 = new ol.source.Vector({ features: features2 })
      var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
      // vectorLayer2.setVisible(!(hidden || false))
      map.addLayer(vectorLayer2)
      data.layer = vectorLayer2;

    });
  });
  return data;
}

function loadRelatedLayer(url, proj, style, hidden) {
  var data = {};
  fetch(url).then(function(response) {
    console.log('response', response);
    response.json().then(function(json) {
      console.log('json', json)

      var fcollection = {
        type: 'FeatureCollection',
        features: json.related 
      };

      var gj2 = new ol.format.GeoJSON()
      var features2 = gj2.readFeatures(fcollection, proj)
      console.log('features2', features2)
      var vectorSource2 = new ol.source.Vector({ features: features2 })
      var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
      // vectorLayer2.setVisible(!(hidden || false))
      map.addLayer(vectorLayer2)
      data.layer = vectorLayer2;

    });
  });
  return data;
}

// loadGeoJsonLayer('data/test.json', { featureProjection: 'EPSG:3857' })
// loadGeoJsonLayer('data/drivmedel.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
// loadGeoJsonLayer('data/butiker.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
// loadGeoJsonLayer('data/smhi.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' }, 'Transparent' )
// loadGeoJsonLayer('data/svavel.json', { dataProjection: 'EPSG:2400', featureProjection: 'EPSG:3857' }, 'Transparent' )
// loadGeoJsonLayer('data/ozon.json', { dataProjection: 'EPSG:2400', featureProjection: 'EPSG:3857' }, undefined, true )
