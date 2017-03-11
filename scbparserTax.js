var fs = require('fs');
var parse = require('csv-parse');
var fs = require('fs');
var parsedJSON = require('./area_work_house.json');

function updateNode(id, key, val) {
    var updateIdx = 0;
    parsedJSON.features.forEach(function(v, i) {
        if (v.properties["ref:se:kommun:kod"] == id)
            updateIdx = i;
    });

    parsedJSON.features[updateIdx].properties[key] = val;


    console.log(parsedJSON.features[updateIdx]);
}


var parser = parse({ delimiter: ';' }, function(err, data) {
    data.forEach(function(d) {
        //console.log('row', d);
        var id = d[0].toString().split(' ')[0];
        var typ = d[1];
        //console.log(id, typ, d[2]);
        var saveTyp = "taxHouse";
        if (typ.indexOf('och lokale') != -1)
            saveTyp = "taxHouseSpace";
        else if (typ.indexOf('lokaler') != -1)
            saveTyp = "taxSpace";
        else if (typ.indexOf('restaurang') != -1)
            saveTyp = "taxRestaurant";
        else if (typ.indexOf('vriga hyres') != -1)
            saveTyp = "taxOther";
        var val = d[2] - 0;
        if (val == 0)
            val = d[3] - 0;
        //console.log(id, saveTyp, val);
        updateNode(id, saveTyp, val);
    });
    fs.writeFile("./area_work_house_tax.json", JSON.stringify(parsedJSON), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
});



fs.createReadStream(__dirname + '/data/taxering.csv').pipe(parser);