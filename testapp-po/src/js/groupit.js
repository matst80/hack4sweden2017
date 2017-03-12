module.exports = function(input, metadata) {
    var grouped = {
        sorted: []
    };

    delete(input.geometry)
    delete(input.admin_level)
    delete(input.lanid)

    METADATA.forEach(function(md) {
        // console.log('md', md)
        if (input[md.key]) {
            var v = input[md.key]
            var fieldinfo = {
                key: md.key,
                name: md.title,
                value: v,
            };
            console.log("MD", md);
            fieldinfo.diff = v - md.mid
                //fieldinfo.diffpct = ((v - md.mid) - md.min) / (md.max - md.min)
            fieldinfo.diffpct = fieldinfo.diff / md.mid;
            fieldinfo.absdiffpct = Math.abs(fieldinfo.diffpct)
            fieldinfo.min = md.min
            fieldinfo.avg = md.mid
            fieldinfo.max = md.max
            fieldinfo.p95 = md.p95
            fieldinfo.p50 = md.p50
            grouped.sorted.push(fieldinfo)
        }
    })

    grouped.sorted.sort(function(a, b) {
        return b.absdiffpct - a.absdiffpct;
    })

    // grouped.x = input;

    return grouped;
}