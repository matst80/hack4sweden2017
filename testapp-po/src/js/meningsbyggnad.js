//param1 param2 geo1 geo2

var params = {
    "admin_level": "administratörsnivå",
    "population": "befolkmingsmängd",
    "lanid": "län-ID",
    "availJobs": "lediga jobb",
    "jobAds": "jobbannonser",
    "smahus": "småhus",
    "flerbostadshus": "flerbostadshus",
    "ovriga hus": "övriga hus",
    "specialbostader": "specialbostäder",
    "disponibelInkomst": "inkomst",
    "rape": "våldtäkt",
    "fysiskvaldkvinnor": "våld mot kvinnor",
    "fysiskvaldman": "våld mot män",
    "enskildForskolaArbetare": "privata förskollärare",
    "enskildForskolaArbetarePerBarn": "antal barn per privat förskollärare",
    "kommunForskolaArbetare": "kommunala förskollärare",
    "kommunForskolaArbetarePerBarn": "antal barn per kommunal förskollärare",
    "psyk_psykosomatiska": "psykiska problem",
    "psyk_nedstamdhet": "depression",
    "psyk_koncentration": "koncentrationssvårigheter",
    "suicidewomen": "självmord bland kvinnor",
    "suicidemen": "självmord bland män",
    "suicidetotal": "antal självmord",
    "utb_pre_gymnasium_women": "förgymnasial utbildning bland kvinnor",
    "utb_pre_gymnasium_men": "förgymnasial utbildning bland män",
    "utb_pre_gymnasium_total": "förgymnasial utbildning",
    "utb_gymnasium_women": "gymnasieutbildning bland kvinnor",
    "utb_gymnasium_men": "gymnasieutbildning bland män",
    "utb_gymnasium_total": "gymnasieutbildning",
    "utb_post_gymnasium_women": "eftergymnasial utbildning bland kvinnor",
    "utb_post_gymnasium_men": "eftergymnasial utbildning bland män",
    "utb_post_gymnasium_total": "eftergymnasial utbildning",
    "income_18_mid": "medelinkomst upp till 18 år",
    "income_18_med": "medianinkomst upp till 18 år",
    "income_1829_mid": "medelinkomst för 18-29-åringar",
    "income_1829_med": "medianinkomst för 18-29-åringar",
    "income_3049_mid": "medelinkomst för 30-49-åringar",
    "income_3049_med": "medianinkomst för 30-49-åringar",
    "income_5064_mid": "medelinkomst för 50-64-åringar",
    "income_5064_med": "medianinkomst för 50-64-åringar",
    "income_65_mid": "medelinkomst för 65+are",
    "income_65_med": "medianinkomst för 65+are",
    "income_6579_mid": "medelinkomst för pensionärer",
    "income_6579_med": "medianinkomst för pensionärer",
    "income_80_mid": "medelinkomst för äldre",
    "income_80_med": "medianinkomst för äldre",
    "crime": "antal brott",
    "tax_hyreshus_bostader": "taxeringsvärde för hyreshus",
    "tax_hyreshus_bostader_lokaler": "taxexirsvärde för lokaler",
    "tax_hotell_restaurang": "taxeringsvärde för hotell och restaurang",
    "hyreshusenhet_lokaler": "trump",
    "tax_other": "skatt",
    "ozone": "marknära ozon",
    "sulfur": "svavelutsläpp"
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Hög, stor, massiv
function getDirWord1(up) {
    if (up) {
        var words = ["stor", "massiv"];
        var index = Math.floor(Math.random() * words.length);
        return words[index];
    }
    else {
        var words = ["låg", "minimal"];
        var index = Math.floor(Math.random() * words.length);
        return words[index];
    }
}

//Stiger, ökar, sjunker, minskar 
function getDirWord2(up) {
    if (up) {
        var words = ["stiger", "ökar", "rekordhögt"];
        var index = Math.floor(Math.random() * words.length);
        return words[index];
    }
    else {
        var words = ["sjunker", "minskar", "på bottennivå"];
        var index = Math.floor(Math.random() * words.length);
        return words[index];
    }
}

//De två högsta värdena för denna kommun kommer in här.
function generateSentence(param1, param2, val1, val2, geo, p95_1, p50_1, p95_2, p50_2) {
    var par1 = params[param1];
    var par2 = params[param2];

    var sentences = [];

    var up1 = p95_1 > p50_1;
    var up2 = p95_2 > p50_2;

    var f1 = "";
    var f2 = "";
    var f3 = "";
    var f4 = "";
    var f5 = "";

    if ((up1 && up2) || (!up1 && !up2)) {
        f1 = capitalizeFirstLetter(par1) + " och  " + par2 + " " + getDirWord2(up1) + " i " + geo;
    }
    else if (up1 && !up2) {
        f1 = capitalizeFirstLetter(par1) + " " + getDirWord2(up1) + " medan " + par2 + " " + getDirWord2(up2) + " i " + geo;
    }
    else if (up2 && !up1) {
        f1 = capitalizeFirstLetter(par1) + " " + getDirWord2(up1) + " medan " + par2 + " " + getDirWord2(up2) + " i " + geo;
    }

    // f2 = capitalizeFirstLetter(param2)+"  "+getDirWord(up)
    // f3 = capitalizeFirstLetter(param3)+"  "+getDirWord(up)
    // f4 = capitalizeFirstLetter(param4)+"  "+getDirWord(up)
    // f5 = capitalizeFirstLetter(param5)+"  "+getDirWord(up)

    // if(up){

    // }
    // else{

    // }

    sentences.push(f1);
    // sentences.push(f2);
    // sentences.push(f3);
    // sentences.push(f4);
    // sentences.push(f5);
    return sentences;
}

function main() {
    var param1 = "crime";
    var param2 = "fysiskvaldkvinnor";
    var val1 = 34;
    var val2 = 5;
    var geo = "Skara kommun";
    var p95_1 = 23;
    var p50_1 = 14;
    var p95_2 = 10;
    var p50_2 = 2;

    var index1 = Math.floor(Math.random() * Object.keys(params).length);
    var randParam1 = Object.keys(params)[index1];
    var index2 = Math.floor(Math.random() * Object.keys(params).length);
    if(index1 == index2){
        index2 += 1;
    }
    var randParam2 = Object.keys(params)[index2];

    randVal1 = Math.floor(Math.random() * 100);
    randVal2 = Math.floor(Math.random() * 100);

    var res = generateSentence(randParam1, randParam2, randVal1, randVal2, geo, p95_1, p50_1, p95_2, p50_2);
    console.log(res);
}

main();