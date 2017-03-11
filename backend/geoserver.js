var gju = require('geojson-utils');
var fs = require('fs');
var proj4 = require('proj4');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))

var router = express.Router();

proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")
proj4.defs("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs")

var targetProj = "EPSG:4326";

function convert(data, file) {
    data.features.forEach(function(v) {
        //console.log(v.geometry.coordinates[0]);
        if (v.geometry.type == "Point") {
            var g = v.geometry;
            var newcoord = proj4(file.from, targetProj, g.coordinates);
            g.type = "Polygon";
            g.coordinates = [
                [
                    [newcoord[0] - file.makeRadius, newcoord[1] + file.makeRadius],
                    [newcoord[0] + file.makeRadius, newcoord[1] + file.makeRadius],
                    [newcoord[0] + file.makeRadius, newcoord[1] - file.makeRadius],
                    [newcoord[0] - file.makeRadius, newcoord[1] - file.makeRadius],
                    [newcoord[0] - file.makeRadius, newcoord[1] + file.makeRadius]
                ]
            ];
            //console.log(v);
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
        makeRadius: 0.004,
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/butiker.json',
        makeRadius: 0.004,
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/rain.json',
        from: 'EPSG:3006'
    }, {
        file: '/testapp-po/src/data/svavel.json',
        from: 'EPSG:2400'
    }, {
        file: '/testapp-po/src/data/ammonium.json',
        from: 'EPSG:2400'
    }
];

var readFiles = [];

files.forEach(function(file) {

    fs.readFile(__dirname + '/../' + file.file, 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        readFiles.push(file.file);
        console.log('parse:', file.file);
        if (file.from)
            file.data = convert(obj, file);
        else
            file.data = obj;

        if (readFiles.length == files.length) {
            //var found = findData(18.034, 59.09);
            console.log('laddat alla filer');
        }
    });
});


//convert(ozon, 'EPSG:2400');


function findData(lat, lng, radius) {
    var ret = [];
    files.forEach(function(fil) {
        if (!fil.data) {
            console.log('fel i fil', fil);
        } else {
            var foundData = fil.data.features.filter(function(v) {
                if (radius) {
                    var center = gju.rectangleCentroid({
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [lat, lng],
                                [lat, lng]
                            ]
                        ]
                    });
                    return gju.geometryWithinRadius(v.geometry, center, radius);
                } else {
                    return gju.pointInPolygon({ "type": "Point", "coordinates": [lat, lng] },
                        v.geometry
                    );
                }
            });
            if (foundData.length) {
                ret = ret.concat(foundData);
                //console.log('hittat lite data', foundData.length);
            }
        }
    });
    return ret;
}

router.route('/point/:lat/:lng').get(function(req, res) {
    var lat = req.params.lat;
    var lng = req.params.lng;
    res.json(findData(lat, lng));
});

router.route('/ball/:lat/:lng').get(function(req, res) {
    var lat = req.params.lat;
    var lng = req.params.lng;
    res.json(findData(lat, lng, 2));
});

function findRelated(prps) {
    var ret = [];
    files.forEach(function(fil) {
        if (!fil.data) {
            console.log('fel i fil', fil);
        } else {
            console.log('söker i', fil.file);
            fil.data.features.forEach(function(f) {
                //var foundData = [];
                var found = true;
                for (var prp in prps) {
                    var val = f.properties[prp];
                    var filterVal = prps[prp];
                    if (filterVal) {
                        if (filterVal * 0.7 < val && filterVal * 1.3 > val) {
                            console.log('found');
                        } else
                            found = false;
                    } else
                        found = false;
                    //console.log(prp, val, prps);
                }
                if (found)
                    ret.push(f);
                //if (foundData.length) {
                //  ret = ret.concat(foundData);
                //console.log('hittat lite data', foundData.length);
                //}
            });
        }
    });
    return ret;
}

router.route('/related').get(function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var fields = req.query.fields.toString().split(',');
    var prps = {};
    console.log(req.params);
    findData(lat, lng).forEach(function(itm) {
        console.log(itm);


        for (var prpidx in fields) {
            var prp = fields[prpidx];
            var val = itm.properties[prp];
            if (val)
                prps[prp] = val;
            console.log(prp, val);
        }


    });
    console.log('matchar på', prps);
    var ret = {
        found: prps,
        related: findRelated(prps)
    };
    res.json(ret);

});

app.use('/api', router);
app.listen(8080);