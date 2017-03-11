var fs = require('fs');
var parse = require('csv-parse');
var fs = require('fs');
var parsedJSON = require('./area_work.json');

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
        console.log('row', d);
        var id = d[0].toString().split(' ')[0];
        var typ = d[1];
        console.log(id, typ, d[2]);
        var saveTyp = "smallHouse";
        if (typ.indexOf('special') != -1)
            saveTyp = "specialHouse";
        else if (typ.indexOf('fler') != -1)
            saveTyp = "apartment";
        else if (typ.indexOf('vriga') != -1)
            saveTyp = "otherHouse";
        updateNode(id, saveTyp, d[2]);
    });
    fs.writeFile("./area_work_house.json", JSON.stringify(parsedJSON), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
});



fs.createReadStream(__dirname + '/data/hus.csv').pipe(parser);

