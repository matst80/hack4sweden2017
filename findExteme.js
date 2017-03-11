var outputFile = "./parsed.json";
var inputData = require(outputFile);
var fs = require('fs');
var keys = [];

var kommun = inputData.features[0];
for (i in kommun.properties) {
    if (i.indexOf(':') == -1) {
        var v = kommun.properties[i];
        if (v - 0 == v) {
            var obj = {
                key: i,
                minObj: {},
                min: 999999999999999999999999999,
                max: 0,
                maxObj: {},
                count: 0,
                mid: 0,
                total: 0
            };
            keys.push(obj);
            console.log(i);
            inputData.features.forEach(function(curr) {
                var val = curr.properties[i] - 0;
                if (val - 0 == val) {
                    if (val < obj.min) {
                        obj.minOBj = curr;
                        obj.min = val;
                        obj.minName = curr.properties.short_name;
                    }
                    if (val > obj.max) {
                        obj.maxObj = curr;
                        obj.max = val;
                        obj.maxName = curr.properties.short_name;
                    }
                    obj.total += val;
                    obj.count++;
                }
            });
            obj.mid = obj.total / obj.count;
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

fs.writeFile(outputFile.replace('.json','_diff.json'), JSON.stringify(inputData), function(err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

console.log(keys);