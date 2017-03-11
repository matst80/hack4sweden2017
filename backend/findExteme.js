var outputFile = "./parsed.json";
var inputData = require(outputFile);
var fs = require('fs');
var keys = [];

function findPercentile(array, percentile) {
    // http://stackoverflow.com/questions/24048879/how-can-i-calculate-the-nth-percentile-from-an-array-of-doubles-in-php
    var index = Math.floor(percentile * array.length / 100.0);
    var result = array[index];
    console.log(percentile, index, array.length, result)
    return result;
}

var kommun = inputData.features[0];
for (i in kommun.properties) {
    if (i.indexOf(':') == -1) {
        var v = kommun.properties[i];
        if (v - 0 == v) {
            var obj = {
                key: i,
                title: i,
                //minObj: {},
                min: 999999999999999999999999999,
                max: 0,
                //maxObj: {},
                count: 0,
                mid: 0,
                total: 0
            };
            keys.push(obj);
            console.log(i);
            var values = [];
            inputData.features.forEach(function(curr) {
                var val = curr.properties[i] - 0;
                if (typeof(val) == 'number') {
                    if (val < obj.min) {
                        //obj.minOBj = curr;
                        obj.min = val;
                        //obj.minName = curr.properties.short_name;
                    }
                    if (val > obj.max) {
                        //obj.maxObj = curr;
                        obj.max = val;
                        //obj.maxName = curr.properties.short_name;
                    }
                    obj.total += val;
                    obj.count++;
                    values.push(val)
                }
            });
            values.sort(function(a, b) {
                return a - b;
            });
            // console.log(values.length, values);
            obj.mid = obj.total / obj.count;
            obj.p50 = findPercentile(values, 50.0);
            obj.p75 = findPercentile(values, 75.0);
            obj.p90 = findPercentile(values, 90.0);
            obj.p95 = findPercentile(values, 95.0);
            obj.p99 = findPercentile(values, 99.0);
            inputData.features.forEach(function(curr) {
                var val = curr.properties[i] - 0;
                if (val - 0 == val) {
                    var diff = Math.abs(obj.mid - val);
                    curr.properties[i + '_diff'] = diff;
                }
            });
        }
    }
}

fs.writeFile('./featuredata.json', JSON.stringify(keys), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

fs.writeFile(outputFile.replace('.json', '_diff.json'), JSON.stringify(inputData), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

console.log(keys);