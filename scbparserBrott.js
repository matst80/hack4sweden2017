var fs = require('fs');
var parse = require('csv-parse');
var fs = require('fs');
var parsedJSON = require('./area_work_house_tax.json');

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
        var typ = d[2];
        //console.log(id, typ, d[2]);
        var saveTyp = typ.replace(' �r', '').replace('+', '');
        var val1 = d[3] - 0;

        var val2 = d[4] - 0;
        console.log(id, "income_" + saveTyp + "_med", val1);
        console.log(id, "income_" + saveTyp + "_median", val1);
        updateNode(id, "income_" + saveTyp + "_med", val1);
        updateNode(id, "income_" + saveTyp + "_median", val1);
        
    });
    
    fs.writeFile("./area_work_house_tax_income.json", JSON.stringify(parsedJSON), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    
});



fs.createReadStream(__dirname + '/data/inkomst.csv').pipe(parser);