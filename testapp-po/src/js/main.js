require('whatwg-fetch')
var ol = require('openlayers')
var proj4 = require('proj4')
var Promise = require('es6-promise')

var styles = require('./styles')
var groupIt = require('./groupit')
var popupparser = require('./popupparser')

proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")
proj4.defs("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs")

ol.proj.setProj4(proj4)

function getPixelFeatures(px, py) {
    return new Promise(function(resolve, reject) {
        var agg = {};
        map.forEachFeatureAtPixel([px, py], function(f) {
            var prop = f.getProperties()
                //console.log('feature', prop)
            var propnames = Object.getOwnPropertyNames(prop)
                // var newdata = {}
            delete(prop.geometry)
            propnames.forEach(function(k) {
                agg[k] = prop[k]
            })
        })
        setTimeout(function(k) {
            //console.log('agg', agg)
            resolve(agg)
        }, 300)
    })
}

function clearLayers() {
    //console.log('map', map)
    var layers = map.getLayers()
        //console.log('layers', layers)
    var num = layers.getLength()
        //console.log('number of layers', num)
    for (var i = num - 1; i >= 1; i--) {
        map.removeLayer(layers.item(i))
    }
}

function updateFilters() {
    var el = document.getElementById('menu');
    var sels = [];
    el.querySelectorAll('input').forEach(function(el2) {
        //console.log('el2', el2);
        if (el2.checked) {
            sels.push(el2.dataset.key)
        }
    });
    //console.log('selections', sels)
    // sels = 
    g_fields = sels;
    overlay3.dispatchEvent(eventHide); //Hide fake news
    clearLayers();
    if (g_fields.length > 0) {
        loadRelatedLayer('/api/related/?fields=' + g_fields.join(','), { featureProjection: 'EPSG:3857' })
    }
}

window.updateFilters = updateFilters;

var g_fields = [];
var g_metadata = {};

fetch('/api/properties').then(function(response) {
    //console.log('response', response);
    response.json().then(function(json) {
        //console.log('json', json)
        g_metadata = json;

        var ht = '';

        Object.keys(json).forEach(function(key) {
            var md = json[key];
            ht += '<p><label><input type="checkbox" id="filter-' + md.key + '" data-key="' + md.key + '" onClick="updateFilters()" /> ' + (md.title || md.key) + '</label></p>';
        });

        document.getElementById('menu').innerHTML = ht;
    })
})



var handler1 = new ol.interaction.Pointer({
    handleDownEvent: function(e) {
        var t = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
            //console.log('click on', e.pixel, e.coordinate, t)
        clearLayers();
        loadRelatedLayer('/api/related/?lat=' + t[0] + '&lng=' + t[1] + '&fields=' + g_fields.join(','), { featureProjection: 'EPSG:3857' })
        loadPointsLayer('/api/point/?lat=' + t[0] + '&lng=' + t[1], { featureProjection: 'EPSG:3857' }, null, false, function(clean) {

            var grouped = groupIt(clean, g_metadata);
            g_fields = [grouped.sorted[0].key, grouped.sorted[grouped.sorted.length - 1].key];
            popupparser({ elm: document.getElementById('overlay'), data: grouped })
                //document.getElementById('overlay').innerText = JSON.stringify(grouped, null, 2)
            overlay3.dispatchEvent(eventShow); //Show fake news
            var filteredData = grouped.sorted;
            /*var filteredData = grouped.sorted.filter(function(o) {
                return (o.name !== "lanid" && o.name !== "admin_level");
            });
*/
            if (filteredData[0] && filteredData[1]) {
                
                var par1 = filteredData[0].key;
                var par2 = filteredData[1].key;
                var val1 = filteredData[0].value;
                var val2 = filteredData[1].value;
                var geo = grouped.name;
                var p95_1 = filteredData[0].p95;
                var p50_1 = filteredData[0].p50;
                var p95_2 = filteredData[1].p95;
                var p50_2 = filteredData[1].p50;
                var sent1 = generateSentence(par1, par2, val1, val2, geo, p95_1, p50_1, p95_2, p50_2)
                populateFakeNews(sent1 + ".")
                getFlickerImage(geo, t[0], t[1])
                overlay3.dispatchEvent(eventShow) //Show fake news
            }
        }).then(function(x) {

            //getPixelFeatures(e.pixel[0], e.pixel[1]).then(function(clean) {

            //})
        })
    }
})

var styleFunction = function(override, feature) {
    var pr = feature.getProperties()

    var amount = 0;

    g_fields.forEach(function(k) {
        var k2 = k + '_normalized';
        if (!pr[k2]) {
            k2 = k;
        }
        if (pr[k2]) {
            amount += pr[k2] * pr[k2]
        }
    });

    if (g_fields.length > 0) {
        amount /= g_fields.length;
    }

    amount *= 2.0;

    // console.log('styleFunction', pr, g_fields, amount);

    amount -= 0.6;

    if (amount > 0.66) { amount = 0.66; }
    if (amount < 0.0)  { amount = 0.0; }

    return new ol.style.Style({
        // stroke: new ol.style.Stroke({
        //   color: 'rgba(0, 0, 0, 0)',
        //   width: 0
        // }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, ' + amount + ')'
        })
    })

    // 'Polygon': new ol.style.Style({
    //   stroke: new ol.style.Stroke({
    //     color: 'blue',
    //     lineDash: [4],
    //     width: 3
    //   }),
    //   fill: new ol.style.Fill({
    //     color: 'rgba(0, 0, 255, 0.1)'
    //   })
    // }),
    // return styles[override || feature.getGeometry().getType()];
};

var map = new ol.Map({
    // renderer: 'webgl',
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
    fetch(url).then(function(response) {
        //console.log('response', response);
        response.json().then(function(json) {
            //console.log('json', json)
            var gj2 = new ol.format.GeoJSON()
            var features2 = gj2.readFeatures(json, proj)
                //console.log('features2', features2)
            var vectorSource2 = new ol.source.Vector({ features: features2 })
            var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
                // vectorLayer2.setVisible(!(hidden || false))
            map.addLayer(vectorLayer2)
        });
    });
}

function loadPointsLayer(url, proj, style, hidden, cb) {
    return new Promise(function(resolve, reject) {
        fetch(url).then(function(response) {
            //console.log('response', response);
            response.json().then(function(json) {
                //console.log('json', json)

                var fcollection = {
                    type: 'FeatureCollection',
                    features: json
                };
                //console.log('got jsondata', json);
                if (cb)
                    cb(json);
                var gj2 = new ol.format.GeoJSON()
                var features2 = gj2.readFeatures(fcollection, proj)
                    //console.log('features2', features2)
                var vectorSource2 = new ol.source.Vector({ features: features2 })
                var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
                    // vectorLayer2.setVisible(!(hidden || false))
                    //console.log(fcollection);
                map.addLayer(vectorLayer2)
                resolve();
            });
        });
    });
}

function getFlickerImage(query, lat, lng) {
    let url = "";
    fetch("/api/newsimage?q=" + query + "&lat=" + lat + "&lng=" + lng).then(function(response) {
        //console.log('response', response);
        response.json().then(function(json) {
            document.getElementById("newsImage").src = json.url;
            url.url = json.url;
        });
        // response.json().then(function(json) {
        //   console.log('json', json)

        //   var fcollection = {
        //     type: 'FeatureCollection',
        //     features: json 
        //   };

        //   var gj2 = new ol.format.GeoJSON()
        //   var features2 = gj2.readFeatures(fcollection, proj)
        //   console.log('features2', features2)
        //   var vectorSource2 = new ol.source.Vector({ features: features2 })
        //   var vectorLayer2 = new ol.layer.Vector({ source: vectorSource2, style: styleFunction.bind(this, style) })
        //   // vectorLayer2.setVisible(!(hidden || false))
        //   map.addLayer(vectorLayer2)
        //   data.layer = vectorLayer2;

        // });
    });
    return url;
}

function loadRelatedLayer(url, proj, style, hidden) {
    var data = {};
    fetch(url).then(function(response) {
        //console.log('response', response);
        response.json().then(function(json) {
            //console.log('json', json)

            var fcollection = {
                type: 'FeatureCollection',
                features: json.related
            };

            var gj2 = new ol.format.GeoJSON()
            var features2 = gj2.readFeatures(fcollection, proj)
                //console.log('features2', features2)
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

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className);
    else
        el.className += ' ' + className;
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className);
    else
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

var overlay3 = document.getElementById("overlay3");

var eventHide = new CustomEvent('fake-news-hide', { bubbles: true, cancelable: true });
var eventShow = new CustomEvent('fake-news-show', { bubbles: true, cancelable: true });

overlay3.addEventListener("fake-news-hide", function() {
    //console.log("Fake news hide!!",this);
    removeClass(this, "raise");
    addClass(this, "lower");

});

overlay3.addEventListener("fake-news-show", function() {
    //console.log("Fake news show!!",this);
    removeClass(this, "lower");
    addClass(this, "raise");
});

function populateFakeNews(title) {
    document.getElementById("fake-news-title").innerHTML = title;
}

// setTimeout(function(){
//   overlay3.dispatchEvent(eventShow);
//   setTimeout(function(){
//     overlay3.dispatchEvent(eventHide);
//   },4000);
// },4000);