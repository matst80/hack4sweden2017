var gju = require('geojson-utils');
var geodata = require('./parsed_diff.json');

function findData(lat, lng) {
    var ret = [];
    ret = geodata.features.filter(function(v) {
        return gju.pointInPolygon({ "type": "Point", "coordinates": [lat, 55.39] },
            v.geometry
        );
    });
    return ret;
}

console.log(findData(13.034, 55.39));