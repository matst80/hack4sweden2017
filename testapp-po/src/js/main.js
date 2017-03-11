var ol = require('openlayers')
require('whatwg-fetch')

var styles = require('./styles')

var styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

var handler1 = new ol.interaction.Pointer({
  handleDownEvent: function(e) {
    var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    console.log('click on', e, t)
    map.forEachFeatureAtPixel(e.pixel, function(f) {
      var prop = f.getProperties()
      console.log('feature', prop)
      var propnames = Object.getOwnPropertyNames(prop)
      var newdata = {}
      delete(prop.geometry)
      propnames.forEach(function(k) {
        newdata[k] = prop[k]
      })
      console.log('cleaned', newdata)
      document.getElementById('overlay').innerText = JSON.stringify(newdata, null, 2)
    })
  },
  // handleMoveEvent: function(e) {
  //   var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
  //   // console.log('e', e, t)
  // }
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
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: new ol.View({
    center: ol.proj.fromLonLat([15.066667, 62.35]),
    zoom: 5
  })
});



fetch('data/test.json').then(function(response) {
  console.log('response', response);
  response.json().then(function(json) {
    console.log('json', json)
    var gj2 = new ol.format.GeoJSON()
    var features2 = gj2.readFeatures(json, { featureProjection: 'EPSG:3857' })
    var vectorSource2 = new ol.source.Vector({ features: features2 })
    var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction })
    // console.log('vectorLayer2', vectorLayer2)
    map.addLayer(vectorLayer2)
    // map.addLayer(vectorLayer)
    console.log('x')
  });
});

