var outputFile = "./industri.json";

var parse = require('csv-parse');
var fs = require('fs');



function fixChars(val) {
    return val.toLowerCase().replace(/[åä]/gi, 'a').replace(/[ö]/gi, 'o').replace(/[^\w\s]/gi, '').replace(/[^\w\s]/gi, '');
}

function parseInt(val) {
    if (val - 0 == val)
        return val;
    else
        return 0;
}


function saveFile() {
    fs.writeFile(outputFile, JSON.stringify(outData), function(err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

var outData = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3006" } },
    "features": [

    ]
};

var parser = parse({ delimiter: ';' }, function(err, allrows) {
    if (!allrows)
        console.log('no data');
    else
        allrows.forEach(function(row) {
            console.log(row);
            var r = { "type": "Feature", "properties": { "name": row[0], "chemical": row[3] }, "geometry": { "type": "Point", "coordinates": [row[1], row[2]] } };
            outData.features.push(r);
        });
});

fs.createReadStream(__dirname + '/../' + '/data/Industriutslapp.csv', 'latin1').pipe(parser).on('end', function() {


    console.log('filedone');
    setTimeout(saveFile, 100);
    //saveFile();

});