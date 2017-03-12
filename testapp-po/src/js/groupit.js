module.exports = function(allinput, metadata) {
    var grouped = {
        sorted: []
    };

    //delete(input.geometry)
    //delete(input.admin_level)
    //delete(input.lanid)
    allinput.forEach(function(input) {
        //console.log('thisinput', input);
        for (var key in metadata) {
            var md = metadata[key];
            if (input.properties[key]) {
                var v = input.properties[key];
                if (v && v - 0 == v) {
                    var fieldinfo = {
                        key: key,
                        name: md.title,
                        value: v,
                    };
                    console.log("MD", md, v);
                    fieldinfo.diff = v - md.avg
                        //fieldinfo.diffpct = ((v - md.mid) - md.min) / (md.max - md.min)
                    fieldinfo.diffpct = fieldinfo.diff / md.avg;
                    fieldinfo.absdiffpct = Math.abs(fieldinfo.diffpct)
                    fieldinfo.min = md.min
                    fieldinfo.avg = md.avg
                    fieldinfo.max = md.max
                    fieldinfo.p95 = md.p95
                    fieldinfo.p50 = md.p50
                    grouped.sorted.push(fieldinfo)
                }
            }
        }
    });
    /*
    metadata.forEach(function(md) {
        // console.log('md', md)
        
    })
*/
    grouped.sorted.sort(function(a, b) {
        return b.absdiffpct - a.absdiffpct;
    })

    // grouped.x = input;

    return grouped;
}