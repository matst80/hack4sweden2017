var gju = require('geojson-utils');
var fs = require('fs');
//var geodata = require('./parsed_diff.json');
var proj4 = require('proj4');

//var ozon = require('./testapp-po/src/data/ozon.json');
/*
var EPSG_3006 = "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
var EPSG_31467 = "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs";
var EPSG_2400 = "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs";
*/
proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")
proj4.defs("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs")

var targetProj = "EPSG:4326";
//console.log(ozon.features[0]);

function convert(data, file) {
    data.features.forEach(function(v) {
        //console.log(v.geometry.coordinates[0]);
        if (v.geometry.type == "Point") {
            var g = v.geometry;
            var newcoord = proj4(file.from, targetProj, g.coordinates);
            g.type = "Polygon";
            g.coordinates = [
                [newcoord[0] - file.makeRadius, newcoord[1] - file.makeRadius],
                [newcoord[0] - file.makeRadius, newcoord[1] + file.makeRadius],
                [newcoord[0] + file.makeRadius, newcoord[1] - file.makeRadius],
                [newcoord[0] + file.makeRadius, newcoord[1] + file.makeRadius]
            ];
            //console.log(g);
        } else {
            v.geometry.coordinates.forEach(function(coordArr) {
                coordArr.forEach(function(coordPart) {
                    //console.log(v.geometry.type);

                    if (v.geometry.type == "Polygon") {
                        var newcoordPart = proj4(file.from, targetProj, coordPart);
                        coordPart[0] = newcoordPart[0];
                        coordPart[1] = newcoordPart[1];
                    } else if (v.geometry.type == "MultiPolygon") {
                        coordPart.forEach(function(coord) {
                            var newcoord = proj4(file.from, targetProj, coord);
                            coord[0] = newcoord[0];
                            coord[1] = newcoord[1];
                        });
                    }
                    /*else if (v.geometry.type == "Point") {
                                       var realCoord = coor
                                   }*/
                });
            });
        }
    });
    return data;
}

var files = [{
        file: '/testapp-po/src/data/ozon.json',
        from: 'EPSG:2400'
    },
    {
        file: '/parsed_diff.json'
            //from: 'EPSG:3857'
    },
    {
        file: '/testapp-po/src/data/drivmedel.json',
        makeRadius: 10.0004,
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/butiker.json',
        makeRadius: 10.0004,
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/smhi.json',
        from: 'EPSG:3006'
    }, {
        file: '/testapp-po/src/data/svavel.json',
        from: 'EPSG:2400'
    }
];

/*

loadGeoJsonLayer('data/drivmedel.json', { dataProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/butiker.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/smhi.json', { dataProjection: 'EPSG:3006', featureProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/svavel.json', { dataProjection: 'EPSG:2400', featureProjection: 'EPSG:3857' })
loadGeoJsonLayer('data/ozon.json', { dataProjection: 'EPSG:2400', featureProjection: 'EPSG:3857' })
*/

var readFiles = [];

files.forEach(function(file) {

    fs.readFile(__dirname + file.file, 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        readFiles.push(file.file);
        console.log('parse:', file.file);
        if (file.from)
            file.data = convert(obj, file);
        else
            file.data = obj;

        if (readFiles.length == files.length) {
            var found = findData(18.034, 59.09);
            console.log('hittade', found);
        }
    });
});


//convert(ozon, 'EPSG:2400');


function findData(lat, lng) {
    var ret = [];
    files.forEach(function(fil) {
        if (!fil.data) {
            console.log('fel i fil', fil);
        } else {
            var foundData = fil.data.features.filter(function(v) {
                var part = gju.pointInPolygon({ "type": "Point", "coordinates": [lat, lng] },
                    v.geometry
                );
                return part;
            });
            if (foundData.length) {
                ret = ret.concat(foundData);
                console.log('hittat lite data', foundData.length);
            }
        }
    });
    /*ret = geodata.features.filter(function(v) {
        return gju.pointInPolygon({ "type": "Point", "coordinates": [lat, 55.39] },
            v.geometry
        );
    });*/
    return ret;
}