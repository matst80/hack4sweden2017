var fs = require('fs');
var parse = require('csv-parse');
var fs = require('fs');
var parsedJSON = require('./area_work.json');

function updateNodes(d) {
    var updateIdx = 0;
    parsedJSON.features.forEach(function(v, i) {
        if (v.properties["ref:se:kommun:kod"] == d.id)
            updateIdx = i;
    });
    d.forEach(function(v) {
        parsedJSON.features[updateIdx].properties.availJobs = v.antal_ledigajobb;
        parsedJSON.features[updateIdx].properties.jobAds = v.antal_platsannonser;
    });
    //console.log(parsedJSON.features[updateIdx]);
}


var parser = parse({ delimiter: ';' }, function(err, data) {
    console.log(data);
    var id = data[0].split(' ')[0];

});



fs.createReadStream(__dirname + '/data/hus.csv').pipe(parser);