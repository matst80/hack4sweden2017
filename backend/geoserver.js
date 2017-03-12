var gju = require('geojson-utils');
var fs = require('fs');
var proj4 = require('proj4');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var Flickr = require('flickrapi');
var flickr;
Flickr.tokenOnly({
    api_key: '7a3b4ec69a99a80ce9c3ddd12444b825',
    secret: 'd0e9f45cb26dad9c'
}, function(err, flickrObj) {
    console.log(err, flickrObj);
    flickr = flickrObj;
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))

var baseGeoResponse = { "type": "FeatureCollection", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3006" } }, "features": [] };

var router = express.Router();

proj4.defs("EPSG:3006", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs")
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs")
proj4.defs("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs")

var targetProj = "EPSG:4326";

function convert(data, file) {
    data.features.forEach(function(v) {
        if (v.geometry.type == "Point") {
            var g = v.geometry;
            if (file.customProp)
                v.properties[file.customProp] = 1;
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
        } else {
            v.geometry.coordinates.forEach(function(coordArr) {
                coordArr.forEach(function(coordPart) {
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
        customProp: 'Bolag',
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/butiker.json',
        makeRadius: 0.004,
        customProp: 'BUTIKSNAMN',
        from: 'EPSG:3006'
    },
    {
        file: '/testapp-po/src/data/industri.json',
        makeRadius: 0.004,
        customProp: 'chemical',
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


//var METADATA = JSON.parse(fs.readFileSync('./featuredata.json', 'utf-8'));


var excludedProperties = ['ID', 'Id', 'CELL_ID', 'admin_level', 'lanid'];
var allProperties = require('./propertytitlelist.json');

var keys = {};

for (i in allProperties) {
    keys[i] = {
        key: i,
        title: i,
        min: 999999999999999999999999999,
        max: 0,
        count: 0,
        mid: 0,
        total: 0,
        values: []
    };
}

function findPercentile(array, percentile) {
    // http://stackoverflow.com/questions/24048879/how-can-i-calculate-the-nth-percentile-from-an-array-of-doubles-in-php
    var index = Math.floor(percentile * array.length / 100.0);
    var result = array[index];
    return result;
}

files.forEach(function(file) {

    fs.readFile(__dirname + '/../' + file.file, 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        readFiles.push(file.file);
        console.log('parse:', file.file);
        if (file.from) {
            file.data = convert(obj, file);
        } else {
            file.data = obj;
        }



        file.data.features.forEach(function(f) {
            for (var prp in f.properties) {
                var foundProperty = allProperties[prp];
                if (foundProperty) {
                    var obj = keys[prp];
                    var val = f.properties[prp] - 0;
                    if (typeof(val) == 'number') {
                        obj.min = Math.min(obj.min, val);
                        obj.max = Math.max(obj.max, val);
                        obj.total += val;
                        obj.count++;
                        obj.values.push(val);
                    }

                }
                if (!allProperties[prp] && excludedProperties.indexOf(prp) == -1 && prp.indexOf(':') == -1 && prp.indexOf('_diff') == -1) {
                    var val = f.properties[prp];
                    if (val && val - 0 == val) {
                        if (!allProperties[prp]) {
                            allProperties[prp] = {
                                title: '',
                                key: prp
                            };
                        }
                    }
                }
            }
        });
        if (readFiles.length == files.length) {
            //var found = findData(18.034, 59.09);
            console.log('laddat alla filer');
            for (var prp in keys) {
                var o = keys[prp];
                o.values.sort(function(a, b) {
                    return a - b;
                });
                o.mid = o.total / o.count;
                o.p50 = findPercentile(o.values, 50.0);
                o.p75 = findPercentile(o.values, 75.0);
                o.p90 = findPercentile(o.values, 90.0);
                o.p95 = findPercentile(o.values, 95.0);
                o.p99 = findPercentile(o.values, 99.0);
                var field = allProperties[prp];
                field.avg = o.mid
                field.min = o.min
                field.max = o.max
                field.p50 = o.p50
                field.p75 = o.p75
                field.p90 = o.p90
                field.p95 = o.p95
                field.p99 = o.p99
            }
            files.forEach(function(loadeddata) {
                loadeddata.data.features.forEach(function(f) {
                    for (var prp in f.properties) {
                        var val = f.properties[prp];
                        var foundProperty = keys[prp];
                        if (foundProperty && val) {
                            var diff = Math.abs(foundProperty.p90 - val);
                            f.properties[i + '_diff'] = diff;
                        }
                    }
                });
            });
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
    //var completeResult = baseGeoResponse
    return ret;
}

router.route('/properties').get(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    /*var ret = {};

    var keys = Object.keys(allProperties);
    keys.forEach(function(key) {
        // console.log('key', key);
        var field = allProperties[key];
        var field2 = null;
        METADATA.forEach(function(md) {
            if (md.key == key) {
                field2 = md;
                field.avg = md.mid
                field.min = md.min
                field.max = md.max
                field.p50 = md.p50
                field.p75 = md.p75
                field.p90 = md.p90
                field.p95 = md.p95
                field.p99 = md.p99
            }
        });
        ret[key] = field;
    });
*/
    res.json(allProperties);
});

router.route('/point').get(function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(findData(lat, lng));
});

router.route('/ball').get(function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    res.setHeader('Access-Control-Allow-Origin', '*');
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
                var found = false;
                for (var prp in prps) {
                    var val = f.properties[prp];
                    var filterVal = prps[prp];
                    var prps3 = allProperties[prp]
                    if (val) {
                        found = true;
                        // if (val > filterVal) {
                        // console.log('found');
                        // } else {
                        // found = false;
                        // }
                    }
                }
                if (found) {
                    ret.push(f);
                }
            });
        }
    });
    var mins = {};
    var maxs = {};
    ret.forEach(function(f) {
        for (var prp in prps) { 
            var val = f.properties[prp] || 0;
            mins[prp] = Math.min(mins[prp] || 999999999999999, val)
            maxs[prp] = Math.max(maxs[prp] || 0, val)
        }
    })
    console.log(mins, maxs)
    ret.forEach(function(f) {
        for (var prp in prps) {
            var val = f.properties[prp];
            if (val) {
                val = (val - mins[prp]) / (maxs[prp] - mins[prp])
                f.properties[prp + '_normalized'] = val
            }
        }
    })

    return ret;
}

router.route('/newsimage').get(function(req, res) {
    var q = req.query.q;
    var lat = req.query.lat;
    var lng = req.query.lng;

    flickr.photos.search({
        text: q,
        page: 1,
        //accuracy: 6,
        per_page: 50,
        content_type: 1,
        radius: 10,
        lat: lat,
        lng: lng
    }, function(err, result) {
        // result is Flickr's response
        if (err)
            res.json(err);
        else {
            //console.log(result.photos);
            var fotodata = result.photos.photo[Math.floor(Math.random() * result.photos.photo.length - 1) + 1];
            //console.log(fotodata);
            if(fotodata.farm && fotodata.server && fotodata.id && fotodata.secret){
                var url = "https://farm" + fotodata.farm + ".staticflickr.com/" + fotodata.server + "/" + fotodata.id + "_" + fotodata.secret + ".jpg";
                res.json({ url: url, data: fotodata });
            }
            else{
                res.cancel();
            }
        }
    });
});

router.route('/related').get(function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var fields = req.query.fields.toString().split(',');
    var prps = {};
    console.log(req.params);

    if (lat && lng) {
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
    } else {
        for (var prpidx in fields) {
            var prp = fields[prpidx];
            var val = 0;
            // if (val)
            var prp2 = allProperties[prp]
            if (prp2) {
                val = prp2.p95;
            }
            prps[prp] = val;
            console.log(prp, val);
        }
    }


    console.log('matchar på', prps);
    var ret = {
        found: prps,
        related: findRelated(prps)
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(ret);

});

app.use('/api', router);
app.listen(8080);