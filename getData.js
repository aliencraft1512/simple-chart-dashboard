const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const keys = ["OBJECTID","Countyname","ST_Name","ST_Abbr","ST_ID","FIPS","FatalityRa","Confirmedb","DeathsbyPo","PCTPOVALL_","Unemployme","Med_HH_Inc","State_Fata","DateChecke","Confirmed","Deaths","Day_1","Day_2","Day_3","Day_4","Day_5","Day_6","Day_7","Day_8","Day_9","Day_10","Day_11","Day_12","Day_13","Day_14","NewCasebyP"];


fetch(`https://services9.arcgis.com/6Hv9AANartyT7fJW/ArcGIS/rest/services/USCounties_cases_V1/FeatureServer/0/query?where=OBJECTID%3E0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=${keys.join(",")}&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=`)
.then(res => res.json())
.then(data => {
  console.log(data.features.length);
  fs.writeFileSync(path.join(__dirname, "./src/covid-data.json"), JSON.stringify(data))
})
/*
var props = {
  "OBJECTID": 2,
  "Countyname": "Baldwin",
  "ST_Name": "Alabama",
  "ST_Abbr": "AL",
  "ST_ID": "01",
  "FIPS": "01003",
  "FatalityRa": 1.09147609147609,
  "Confirmedb": 3529.92,
  "DeathsbyPo": 38.5282219225583,
  "PCTPOVALL_": 9.8,
  "Unemployme": 3.6,
  "Med_HH_Inc": 115.4508,
  "State_Fata": 1.48199168004671,
  "DateChecke": "11/17/2020 07:44:17",
  "EM_type": "Govt Ordered Community Quarantine",
  "EM_date": "4/3/2020 10:41:19 PM",
  "EM_notes": "AL Governor issued a Shelter In Place order.",
  "url": "https://bao.arcgis.com/covid-19/jhu/county/01003.html",
  "Thumbnail": "https://coronavirus.jhu.edu/static/media/dashboard_infographic_thumbnail.png",
  "Confirmed": 7696,
  "Deaths": 84,
  "Age_85": 3949,
  "Age_80_84": 4792,
  "Age_75_79": 7373,
  "Age_70_74": 11410,
  "Age_65_69": 13141,
  "Beds_Licen": 386,
  "Beds_Staff": 362,
  "Beds_ICU": 51,
  "Ventilator": 8,
  "POP_ESTIMA": 218022,
  "POVALL_201": 21069,
  "Unemployed": 3393,
  "Median_Hou": 57588,
  "Recovered": 0,
  "Active": 0,
  "State_Conf": 219232,
  "State_Deat": 3249,
  "State_Reco": 0,
  "State_Test": 1501190,
  "AgedPop": 40665,
  "NewCases": 50,
  "NewDeaths": 0,
  "TotalPop": 208107,
  "NonHispWhP": 172768,
  "BlackPop": 19529,
  "AmIndop": 1398,
  "AsianPop": 1668,
  "PacIslPop": 9,
  "OtherPop": 410,
  "TwoMorPop": 2972,
  "HispPop": 9353,
  "Wh_Alone": 179526,
  "Bk_Alone": 19764,
  "AI_Alone": 1522,
  "As_Alone": 1680,
  "NH_Alone": 9,
  "SO_Alone": 2034,
  "Two_More": 3572,
  "Not_Hisp": 198754,
  "Age_Less15": 37621,
  "Age_15_24": 23497,
  "Age_25_34": 23326,
  "Age_Over75": 16114,
  "Agetotal": 208107,
  "NonHisp": 9353,
  "Age_35_64": 82998,
  "Age_65_74": 24551,
  "Day_1": 50,
  "Day_2": 50,
  "Day_3": 73,
  "Day_4": 69,
  "Day_5": 45,
  "Day_6": 61,
  "Day_7": 85,
  "Day_8": 37,
  "Day_9": 38,
  "Day_10": 54,
  "Day_11": 37,
  "Day_12": 36,
  "Day_13": 66,
  "Day_14": 10,
  "NewCasebyP": 22.9334654300942,
}

var fields = {
  "OBJECTID": 2,
  "Countyname": "Baldwin",
  "ST_Name": "Alabama",
  "ST_Abbr": "AL",
  "ST_ID": "01",
  "FIPS": "01003",
  "FatalityRa": 1.09147609147609,
  "Confirmedb": 3529.92,
  "DeathsbyPo": 38.5282219225583,
  "PCTPOVALL_": 9.8,
  "Unemployme": 3.6,
  "Med_HH_Inc": 115.4508,
  "State_Fata": 1.48199168004671,
  "DateChecke": "11/17/2020 07:44:17",
  "Confirmed": 7696,
  "Deaths": 84,
  "Day_1": 50,
  "Day_2": 50,
  "Day_3": 73,
  "Day_4": 69,
  "Day_5": 45,
  "Day_6": 61,
  "Day_7": 85,
  "Day_8": 37,
  "Day_9": 38,
  "Day_10": 54,
  "Day_11": 37,
  "Day_12": 36,
  "Day_13": 66,
  "Day_14": 10,
  "NewCasebyP": 22.9334654300942,
}

const keys = [];

Object.keys(fields).map(k => {
  keys.push(k)
});

fs.writeFileSync("keys.json", JSON.stringify(keys))*/