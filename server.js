var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

//router.route('/work/:id')

// get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
//.get(function(req, res) {
//res.json(req.params.id);

var parsedJSON = require('./data/kommuner/kommuner-kustlinjer.geo.json');
//console.log(parsedJSON);

var crap = { "soklista": { "listnamn": "lan", "totalt_antal_platsannonser": 48186, "totalt_antal_ledigajobb": 141273, "sokdata": [{ "id": "10", "namn": "Blekinge län", "antal_platsannonser": 586, "antal_ledigajobb": 2982 }, { "id": "20", "namn": "Dalarnas län", "antal_platsannonser": 1227, "antal_ledigajobb": 4188 }, { "id": "9", "namn": "Gotlands län", "antal_platsannonser": 270, "antal_ledigajobb": 1593 }, { "id": "21", "namn": "Gävleborgs län", "antal_platsannonser": 911, "antal_ledigajobb": 3638 }, { "id": "13", "namn": "Hallands län", "antal_platsannonser": 1196, "antal_ledigajobb": 3261 }, { "id": "23", "namn": "Jämtlands län", "antal_platsannonser": 564, "antal_ledigajobb": 1411 }, { "id": "6", "namn": "Jönköpings län", "antal_platsannonser": 1948, "antal_ledigajobb": 6305 }, { "id": "8", "namn": "Kalmar län", "antal_platsannonser": 1049, "antal_ledigajobb": 4827 }, { "id": "7", "namn": "Kronobergs län", "antal_platsannonser": 1030, "antal_ledigajobb": 3924 }, { "id": "25", "namn": "Norrbottens län", "antal_platsannonser": 1128, "antal_ledigajobb": 5133 }, { "id": "12", "namn": "Skåne län", "antal_platsannonser": 5491, "antal_ledigajobb": 15664 }, { "id": "1", "namn": "Stockholms län", "antal_platsannonser": 13258, "antal_ledigajobb": 27597 }, { "id": "4", "namn": "Södermanlands län", "antal_platsannonser": 1227, "antal_ledigajobb": 3994 }, { "id": "3", "namn": "Uppsala län", "antal_platsannonser": 1716, "antal_ledigajobb": 3658 }, { "id": "17", "namn": "Värmlands län", "antal_platsannonser": 852, "antal_ledigajobb": 3059 }, { "id": "24", "namn": "Västerbottens län", "antal_platsannonser": 1129, "antal_ledigajobb": 3949 }, { "id": "22", "namn": "Västernorrlands län", "antal_platsannonser": 1181, "antal_ledigajobb": 3827 }, { "id": "19", "namn": "Västmanlands län", "antal_platsannonser": 1137, "antal_ledigajobb": 3843 }, { "id": "14", "namn": "Västra Götalands län", "antal_platsannonser": 8652, "antal_ledigajobb": 25760 }, { "id": "18", "namn": "Örebro län", "antal_platsannonser": 1134, "antal_ledigajobb": 3904 }, { "id": "5", "namn": "Östergötlands län", "antal_platsannonser": 2088, "antal_ledigajobb": 7139 }, { "id": "90", "namn": "Ospecificerad arbetsort", "antal_platsannonser": 412, "antal_ledigajobb": 1617 }] } };
var craplist = [];
crap.soklista.sokdata.forEach(function(i, v) {
    //console.log('http://api.arbetsformedlingen.se/af/v0/platsannonser/soklista/kommuner?lanid=' + i.id);
    craplist.push({
        host: 'api.arbetsformedlingen.se',
        baseid: i.id,
        basename: i.namn,
        port: 80,
        path: '/af/v0/platsannonser/soklista/kommuner?lanid=' + i.id,
        json: true,
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'sv',
        }
    });
});

function updateNodes(id, name, d) {

    d.forEach(function(v) {
        var updateIdx = 0;
        parsedJSON.features.forEach(function(fv, i) {
            if (fv.properties["ref:se:kommun:kod"] == v.id)
                updateIdx = i;
        });
        parsedJSON.features[updateIdx].properties.lanid = id;
        parsedJSON.features[updateIdx].properties.lanName = name;
        parsedJSON.features[updateIdx].properties.availJobs = v.antal_ledigajobb;
        parsedJSON.features[updateIdx].properties.jobAds = v.antal_platsannonser;
    });
    //console.log(parsedJSON.features[updateIdx]);
}

function getData() {
    if (craplist.length == 0) {
        console.log('done');
        fs.writeFile("./area_work.json", JSON.stringify(parsedJSON), function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }
    var r = craplist.pop();
    if (r) {
        http.get(r, function(resp) {
            var allData = '';
            resp.on('data', function(chunk) {
                //do something with chunk
                //console.log(i.namn);
                //console.log(r);
                allData += chunk;


            });
            resp.on('end', function() {
                var kd = JSON.parse(allData);
                //console.log(kd.soklista.sokdata);
                updateNodes(r.baseid,r.basename, kd.soklista.sokdata);
                getData();
            });
        }).on("error", function(e) {
            console.log("Got error: " + e.message);
        });
    }
}

getData();


//});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);