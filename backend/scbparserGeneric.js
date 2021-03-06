var inputFile = "./input.json";
var outputFile = "./parsed.json";

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
    return val.toLowerCase().replace(/[åä]/gi, 'a').replace(/[ö]/gi, 'o').replace(/[^\w\s]/gi, '').replace(/[^\w\s]/gi, '');
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
            var key = fixChars(row[0]).substring(0, 3);
            var val = row[1] - 0;
            var imap = {
                "ovr": "tax_other",
                "320": "tax_hyreshus_bostader",
                "321": "tax_hyreshus_bostader_lokaler",
                "322": "tax_hotell_restaurang",
                "325": "hyreshusenhet_lokaler"
            };
            if (val == 0)
                val = row[2] - 0;
            area[imap[key]] = val;
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
    {
        file: '/data/pshalsa.csv',
        map: function(row, area, cb) {
            ['psykosomatiska', 'nedstamdhet', 'koncentration'].forEach(function(v, i) {
                area['psyk_' + v.toLocaleLowerCase()] = parseInt(row[i]);
            });
        }
    },
    {
        file: '/data/sjalvmord.csv',
        map: function(row, area, cb) {
            ['suicidewomen', 'suicidemen', 'suicidetotal'].forEach(function(v, i) {
                area[v.toLocaleLowerCase()] = parseInt(row[i]);
            });
        }
    },
    {
        file: '/data/utb.csv',
        map: function(row, area, cb) {
            ['pre_gymnasium_women', 'pre_gymnasium_men', 'pre_gymnasium_total', 'gymnasium_women', 'gymnasium_men', 'gymnasium_total', 'post_gymnasium_women', 'post_gymnasium_men', 'post_gymnasium_total'].forEach(function(v, i) {
                area['utb_' + v.toLocaleLowerCase()] = parseInt(row[i]);
            });
        }
    }
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
        fs.createReadStream(__dirname + '/../' + v.file, 'latin1').pipe(parser).on('end', function() {
            filesDone.push(v);
            if (filesDone.length == scbFiles.length) {
                console.log('filedone');
                setTimeout(saveFile, 500);
                //saveFile();
            }
        });
});

