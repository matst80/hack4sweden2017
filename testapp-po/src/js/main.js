require('whatwg-fetch')
var ol = require('openlayers')
var proj4 = require('proj4')
var Promise = require('es6-promise')

var styles = require('./styles')

proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")

ol.proj.setProj4(proj4)



var styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};




function getPixelFeatures(px, py) {
  return new Promise(function(resolve, reject) {
    map.forEachFeatureAtPixel([px, py], function(f) {
      var prop = f.getProperties()
      console.log('feature', prop)
      var propnames = Object.getOwnPropertyNames(prop)
      var newdata = {}
      delete(prop.geometry)
      propnames.forEach(function(k) {
        newdata[k] = prop[k]
      })
      console.log('cleaned', newdata)
      resolve(newdata)
    })
  })
}









var handler1 = new ol.interaction.Pointer({
  handleDownEvent: function(e) {
    var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    console.log('click on', e, t)
    var p1 = getPixelFeatures(e.pixel[0], e.pixel[1]);
    var p2 = getPixelFeatures(e.pixel[0] + 100, e.pixel[1]);
    p1.then(function(clean) {
      p2.then(function(clean2) {
        document.getElementById('overlay').innerText = JSON.stringify(clean, null, 2)
        document.getElementById('overlay2').innerText = JSON.stringify(clean2, null, 2)
      })
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
  // controls: ol.control.defaults({
  //   attributionOptions: {
  //     collapsible: false
  //   }
  // }),
  view: new ol.View({
    center: ol.proj.fromLonLat([15.066667, 62.35]),
    zoom: 5
  })
});


function loadGeoJsonLayer(url, proj, format) {
  var data = {};
  fetch(url).then(function(response) {
    console.log('response', response);
    response.json().then(function(json) {
      console.log('json', json)
      var gj2 = new ol.format.GeoJSON()
      var features2 = gj2.readFeatures(json, proj)
      console.log('features2', features2)
      var vectorSource2 = new ol.source.Vector({ features: features2 })
      var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction })
      map.addLayer(vectorLayer2)
      data.layer = vectorLayer2;
    });
  });
  return data;
}

loadGeoJsonLayer('data/test.json', { featureProjection: 'EPSG:3857'}, {})
loadGeoJsonLayer('data/drivmedel.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/butiker.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/smhi.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
