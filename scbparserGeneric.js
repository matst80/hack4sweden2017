var inputFile = "./input.json";
var outputFile = "./parsed.json";

var fs = require('fs');
var parse = require('csv-parse');
var fs = require('fs');
var inputData = require(inputFile);

function getNode(id) {
    //var ret = {};
    if (id.toString().indexOf(' ') !== -1) {
        id = id.split(' ')[0];
    }
    var ret = inputData.features.filter(function(v) {
        return v.properties["ref:se:kommun:kod"] == id;
    });
    if (ret.length) {
        return ret[0].properties;
    } else
        return;
}

function fixChars(val) {
    return val.toLowerCase().replace(/[åä]/gi, 'a').replace(/[ö]/gi, 'ö').replace(/[^\w\s]/gi, '').replace(/[^\w\s]/gi, '');
}

function parseInt(val) {
    if (val - 0 == val)
        return val;
    else
    return 0;
}

var scbFiles = [{
        file: '/data/inkomst.csv',
        map: function(row, area, cb) {
            var key = fixChars(row[1].replace(' år', ''));
            area["income_" + key + "_mid"] = row[2] - 0;
            area["income_" + key + "_med"] = row[3] - 0;
        }
    },
    {
        file: '/data/hus.csv',
        map: function(row, area, cb) {
            var key = fixChars(row[0]);
            var val = row[1] - 0;
            area[key] = val;
        }
    },
    {
        file: '/data/brott.csv',
        map: function(row, area, cb) {
            var key = 'crime';
            var val = row[0] - 0;
            area[key] = val;
        }
    },
    {
        file: '/data/taxering.csv',
        map: function(row, area, cb) {
            var key = fixChars(row[0]);
            var val = row[1] - 0;
            if (val == 0)
                val = row[2] - 0;
            area[key] = val;
            cb();
        }
    },
    {
        file: '/data/ejsex.csv',
        map: function(row, area, cb) {
            var key = 'rape';
            var val = row[0] - 0;
            area[key] = val;
        }
    },
    {
        file: '/data/dispink.csv',
        map: function(row, area, cb) {
            var key = 'disponibelInkomst';
            var val = row[0] - 0;
            area[key] = val;
        }
    },
    {
        file: '/data/anstforskola.csv',
        map: function(row, area, cb) {
            area['enskildForskolaArbetare'] = row[0] - 0;
            area['enskildForskolaArbetarePerBarn'] = row[1] - 0;
            area['kommunForskolaArbetare'] = row[2] - 0;
            area['kommunForskolaArbetarePerBarn'] = row[3] - 0;
        }
    },
    {
        file: '/data/fysvald.csv',
        map: function(row, area, cb) {
            area['fysiskvaldkvinnor'] = parseInt(row[0]);
            area['fysiskvaldman'] = parseInt(row[1]);
        }
    },
    /*,
        {
            file: '/data/brott.csv',
            findKey: 'ref:se:kommun:kod',
            map: function(row, area, cb) {
                var key = fixChars(row[1]);
                var val = row[row.length - 1];
                area[key] = val - 0;

                cb();
            }
        },
        
        {
            file: '/data/taxering.csv',
            findKey: 'ref:se:kommun:kod',
            map: function(row, area, cb) {
                var key = fixChars(row[1]);
                area[key] = row[2] - 0;

                cb();
            }
        }*/
];

function saveFile() {
    fs.writeFile(outputFile, JSON.stringify(inputData), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}
var filesDone = [];
scbFiles.forEach(function(v) {

    var parser = parse({ delimiter: v.delimiter || ';' }, function(err, allrows) {
        if (!allrows)
            console.log('no data', v);
        else
            allrows.forEach(function(row) {
                var idval = row.shift(1);
                var area = getNode(idval);

                if (area) {
                    v.map(row, area, function(ret) {
                        //console.log('update', ret);
                    });
                } else {
                    console.log('no area', idval, area);
                }
            });
    });
    if (v.file)
        fs.createReadStream(__dirname + v.file, 'latin1').pipe(parser).on('end', function() {
            filesDone.push(v);
            if (filesDone.length == scbFiles.length) {
                console.log('filedone');
                setTimeout(saveFile, 500);
                //saveFile();
            }
        });
});