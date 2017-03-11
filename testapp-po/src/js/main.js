var ol = require('openlayers')
require('whatwg-fetch')

var image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({
    color: 'red',
    width: 1
  })
});

var styles = {
  'Point': new ol.style.Style({
    image: image
  }),
  'LineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  }),
  'MultiLineString': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  }),
  'MultiPoint': new ol.style.Style({
    image: image
  }),
  'MultiPolygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  }),
  'Polygon': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  }),
  'GeometryCollection': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'magenta'
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: null,
      stroke: new ol.style.Stroke({
        color: 'magenta'
      })
    })
  }),
  'Circle': new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.2)'
    })
  })
};

var styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

var geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [0, 0]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, -2e6], [8e6, 2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, 2e6], [8e6, -2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiLineString',
      'coordinates': [
        [[-1e6, -7.5e5], [-1e6, 7.5e5]],
        [[1e6, -7.5e5], [1e6, 7.5e5]],
        [[-7.5e5, -1e6], [7.5e5, -1e6]],
        [[-7.5e5, 1e6], [7.5e5, 1e6]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
        [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
        [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'GeometryCollection',
      'geometries': [{
        'type': 'LineString',
        'coordinates': [[-5e6, -5e6], [0, -5e6]]
      }, {
        'type': 'Point',
        'coordinates': [4e6, -5e6]
      }, {
        'type': 'Polygon',
        'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
      }]
    }
  }]
};

var vectorSource = new ol.source.Vector({
  features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
});

vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));
var vectorLayer = new ol.layer.Vector({ source: vectorSource, style: styleFunction });

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

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
  handleMoveEvent: function(e) {
    var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    // console.log('e', e, t)
  }
})

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        // url: "http://tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
        url: 'http://a.tile.stamen.com/toner/{z}/{x}/{y}.png'
      })
    }),
  ],
  target: 'map',
  interactions: ol.interaction.defaults().extend([handler1]),
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }).extend(mousePositionControl),
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
    map.addLayer(vectorLayer)
    console.log('x')
  });
});

