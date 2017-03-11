//Main entry point
function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

//Main function
ready(function () {
    var map = new ol.Map({
        controls: ol.control.defaults(),
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([12.41, 57.4]),
            zoom: 4
        })
    });

    document.getElementById("map").dataset.map = map;
    // $("#map").data('map',map);

    console.log("Map loaded");

    getJSON("./data/kommuner/kommuner-kustlinjer.geo.json", function (data) {
        if (data) {
            console.log("Collections added.");
            addFeatureCollection(map, data);
        }
    })
});

//Get JSON file from url
function getJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            if (callback !== undefined) {
                callback(data);
            }
            else {
                return data;
            }
        } else {
            // We reached our target server, but it returned an error
            if (callback !== undefined) {
                callback(null);
            }
            else {
                return null;
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        if (callback !== undefined) {
            callback(null);
        }
        else {
            return null;
        }
    };

    request.send();
}

//Add feature collection to map
function addFeatureCollection(map, features) {
    //GeoJSON srouce
    var layerSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(features, { featureProjection: 'EPSG:3857' })
    });

    //Layer
    var layer = new ol.layer.Vector({
        source: layerSource,
        style: function (feature, resolution) {
            var name = feature.get('name');
            let styleObj = {
                fill: new ol.style.Fill({
                    color: 'rgba(0, 255, 0, 0.1)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 255, 0, 0.6)',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 255, 0, 0.9)'
                    })
                })
            }

            let _name = name;
            if (resolution > 1000) {
                _name = "";
            }

            styleObj["text"] = new ol.style.Text({
                text: _name
            })
            return new ol.style.Style(styleObj);
        }
    });
    map.addLayer(layer);
}


// var featureCollection = {
//         type: "FeatureCollection",
//         features: []
//     }