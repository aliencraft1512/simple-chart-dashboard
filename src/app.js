if (!window.fetch) {
  alert("Your browser is not compatible with this app. : (")
}

//https://services9.arcgis.com/6Hv9AANartyT7fJW/ArcGIS/rest/services/USCounties_cases_V1/FeatureServer/0

window.addEventListener('online', () => console.log('came online'));
window.addEventListener('offline', () => console.log('came offline'));

const Chart = require('chart.js');
const chartTrendline = require("chartjs-plugin-trendline");
Chart.plugins.register(chartTrendline);
const Trendline = require('trendline');
const config = new URLSearchParams(window.location.search);

async function getData() {
  const keys = ["OBJECTID","Countyname","ST_Name","ST_Abbr","ST_ID","FIPS","FatalityRa","Confirmedb","DeathsbyPo","PCTPOVALL_","Unemployme","Med_HH_Inc","State_Fata","DateChecke","Confirmed","Deaths","Day_1","Day_2","Day_3","Day_4","Day_5","Day_6","Day_7","Day_8","Day_9","Day_10","Day_11","Day_12","Day_13","Day_14","NewCasebyP","TotalPop","url"];
  const res = await fetch(`https://services9.arcgis.com/6Hv9AANartyT7fJW/ArcGIS/rest/services/USCounties_cases_V1/FeatureServer/0/query?where=OBJECTID%3E0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=${keys.join(",")}&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=`)
  const data = await res.json();
  return data
}

function filterData(data, state, county) {
  if (county && state) {
    return data.filter(f => {
      return county.toLowerCase().includes(f.properties.Countyname.toLowerCase()) && state.toLowerCase().includes(f.properties.ST_Abbr.toLowerCase()) 
    })
  }
  if (county && !state) {
    return data.filter(f => {
      return county.toLowerCase().includes(f.properties.Countyname.toLowerCase())
    })
  }
  return data.filter(f => {
    return state.toLowerCase().includes(f.properties.ST_Abbr.toLowerCase()) 
  })
}

init();

async function init() {
  const now = new Date();

  //check for cached exipres date or clearCache
  const expireDate = (lsTest() && localStorage.getItem("c19t_expires")) ? JSON.parse(localStorage.getItem("c19t_expires")) : false;
  const expired = (!expireDate) ? true : (config && config.get("clearCache")) ? true : (new Date(expireDate.expires) > now) ? false : true;
  
  if (expireDate) {
    console.log({expired: expired}, new Date(expireDate.expires))
  }

  //set data to api or cache
  const rawCovidData = (expired) ? await getData() : (!localStorage.getItem("c19t_data_cache")) ? await getData() : JSON.parse(localStorage.getItem("c19t_data_cache"))

  //TODO remove this testing only
  if (config.get("debug")) {
    const dataUpdate = await getData();
    console.log(dataUpdate)
    console.log({api_date_check: new Date(dataUpdate.features[0].properties.DateChecke)})
    console.log({cached_expire_date: new Date(expireDate.expires)})
   }

  const db = rawCovidData.features;

  //set new expires and data cache if expired
  if (expired) {
    console.log("cache expired\nsetting new expires date and data cache")
    const expires = new Date(now)
    expires.setHours(expires.getHours() + 1)
    localStorage.setItem("c19t_expires", JSON.stringify({expires:expires}));
    localStorage.setItem("c19t_data_cache", JSON.stringify(rawCovidData));
  }

  //used saved query if there is one and there is no query in the url search parameters
  const savedParams = (window.location.search != "" && !config.get("clearCache")) ? false : (lsTest() && localStorage.getItem("c19t_filter")) ? JSON.parse(localStorage.getItem("c19t_filter")) : false
  const params = (savedParams) ? new URLSearchParams("?" + savedParams.filter) : new URLSearchParams(window.location.search);
  const county = (!params || !params.get("county")) ? false : params.get("county");
  const state = (!params || !params.get("state")) ?   false : params.get("state");

  console.log({filter: [county, state]})

  // //set filter for next reload of app
  // if (county && !state) {
  //   localStorage.setItem("c19t_filter", JSON.stringify({filter: "county=" + county}))
  // }
  // if (!county && state) {
  //   localStorage.setItem("c19t_filter", JSON.stringify({filter: "state=" + state}))
  // }
  // if (county && state) {
  //   localStorage.setItem("c19t_filter", JSON.stringify({filter: "county=" + county + "&state=" + state}))
  // }

  const filtered = (!county && !state) ? filterData(db, "oh") : filterData(db, state, county)

  filtered.map(f => {
    document.body.querySelector("#app").appendChild(createChart(f));
  });

  const select = document.querySelector("select");
  const states = [];
  db.map(f => {
    if (!states.includes(f.properties.ST_Abbr)) {
      states.push(f.properties.ST_Abbr);
      select.innerHTML += `<option value="${f.properties.ST_Abbr}">${f.properties.ST_Abbr}</option>`;
    }
  })

  document.querySelector(".js-filter").addEventListener("click", function() {
    select.size = 20
  });

  select.addEventListener("change", function(e) {
    console.log(this.value);
    if (this.value) {
      let filter = "state=" + this.value
      // if (lsTest()) localStorage.setItem("c19t_filter", JSON.stringify({filter: filter}))
      window.location = window.location.origin + "/?state=" + this.value
    } 
  })

  // const urlBase = "https://services9.arcgis.com/6Hv9AANartyT7fJW/ArcGIS/rest/services/USCounties_cases_V1/FeatureServer/0/query?where=";
  // const url = (!query || !state) ?
  // urlBase + `FIPS+IN+%2839119%2C39045,39093,39155,17031,54039%29${(!state) ? '' : `AND%20ST_Abbr='${state}'`}&outFields=*&&returnExceededLimitFeatures=true&returnGeometry=false&f=pgeojson` : `${urlBase}Countyname='${query.charAt(0).toUpperCase() + query.slice(1)}'AND%20ST_Abbr='${(!state) ? "" : state}'&outFields=*&&returnExceededLimitFeatures=true&returnGeometry=false&f=pgeojson`;
  
  // // console.log(query, state, url)

  // fetch(url)
  //   .then((res) => res.json())
  //   .then((data) => {
  //     data.features.map(f => {
  //       document.body.querySelector("main").appendChild(createChart(f));
  //     });
  //     document.body.querySelector("main").style.opacity = 1;
  //     // localStorage.setItem("covid_data", JSON.stringify(data));
  //   });
  // } else {
  //   console.log("using local storage");
  //   const cached = JSON.parse(localStorage.getItem("covid_data"));
  //   cached.features.map(f => {
  //     document.body.querySelector("main").appendChild(createChart(f));
  //   });
  //   document.body.querySelector("main").style.opacity = 1;
  //   fetch(url)
  //   .then((res) => res.json())
  //   .then((data) => {
  //     if (data.features[0].properties.DateChecke != cached.features[0].properties.DateChecke || data.features.length != cached.features.length || data.features[0].properties.FIPS != cached.features[0].FIPS) {
  //       localStorage.setItem("covid_data", JSON.stringify(data));
  //       console.log('redrawing canvas')
  //       document.querySelector("main").innerHTML = "";
  //       data.features.map(f => {
  //         document.body.querySelector("main").appendChild(createChart(f));
  //       });
  //       document.body.querySelector("main").style.opacity = 1;
  //     }
  //   });
  // }
  
  function createChart(feature) {
    // console.log(feature)
    const template = document.querySelector("template").content.cloneNode(true);
    const props = feature.properties;
    template.querySelector("h2").innerHTML = props.Countyname + " County, " + props.ST_Abbr 
    const details = template.querySelector(".js-details");
      details.innerHTML += `       
        <span>Cases: ${props.Confirmed.toLocaleString()}<br />
        Deaths: ${props.Deaths.toLocaleString()}<br />
        New Cases: ${props.Day_1.toLocaleString()}<br />
        New Case Rate: ${props.NewCasebyP.toFixed(2).toLocaleString()}</span>
        `
  
    const linkDiv = template.querySelector(".js-link");
    const link = document.createElement("a");
    link.href = (county && state && !county.includes(",") && !state.includes(",")) ? window.location.origin + "/?state=" + props.ST_Abbr : window.location.origin + "/?county=" + props.Countyname + "&state=" + props.ST_Abbr;
    link.innerText = (county && state && !county.includes(",") && !state.includes(",")) ? `View All ${props.ST_Abbr} Counties` : "Direct Link";
    linkDiv.appendChild(link)
    
    const link2 = document.createElement("a");
    link2.href = "https://covidactnow.org/us/" + props.ST_Name.toLowerCase() + "-" + props.ST_Abbr.toLowerCase() + "/county/" + props.Countyname.toLowerCase().replace(/ /g,"_") + "_county"
    //https://covidactnow.org/us/ohio-oh/county/tuscarawas_county?s=1368354
    link2.setAttribute("target", "_blank")
    link2.innerText = " | More Details";
    linkDiv.appendChild(link2)
    
  
    const cases = [];
    Object.keys(props).forEach(p => {
      let value = (props[p] < 0) ? 0 : props[p]
      if (p.toLowerCase().includes("day")) {
        cases.push(value);
      }
    })

    //trendline
    const trendlineData = [];
    const counter = {value: 0};
    for (let i = cases.length -1; i > -1; i--) {
      let value = cases[i]
      trendlineData.push({
        x: counter.value,
        y: value
      })
      counter.value = counter.value + 1;
    }

    // console.log(trendlineData)
    
    const trend = Trendline(trendlineData, 'x', 'y');
  
    if (county) {
      console.log({name: props.Countyname, trend: trend});
    }

    if (trend.slope) {
      template.querySelector(".js-trending").style.display = "flex";
      if (trend.slope > 0) {
        template.querySelector(".js-trending").children[0].style.display = "block" 
      } else{
        template.querySelector(".js-trending").children[1].style.display = "block" 
      }
    }
    //&nbsp;${(trend.slope * 100).toFixed(2)}

    template.querySelector(".js-updated").innerText = props.DateChecke

    const sorted = cases
    const today = new Date(props.DateChecke);
    today.setHours(0, 0, 0)
  
    const chartData = [];

    for (let i = 0; i < cases.length; i++) {
      let date = new Date(today);
      chartData.push({
        x: date.setDate(date.getDate() - (i + 1)),
        y: sorted[i]
      })
    }

    const ctx = template.querySelector("canvas").getContext("2d");
  
    const ticks = (window.innerWidth < 768) ? false : true;

    const chartConfig = {
      datasets: [{
        label: "Cases",
        backgroundColor: "rgba(107,185,249, 0.5)",
        borderColor: "#6BB9F9",
        borderWidth: 2,
        // pointRadius: 0,
        pointHitRadius: 4,
        pointBorderColor: 'rgba(107,185,249, 0.8)',
        pointBackgroundColor: 'rgba(107,185,249, 0.5)',
        data: chartData,
        lineTension: 0.2,
        trendlineLinear: {
          style: 'rgba(169,33,43,0.9)',//"rgba(255,105,180, .8)",
          lineStyle: "dotted",
          width: 2
        }
      }]
    };
  
    new Chart(ctx, {
      type: "line",
      data: chartConfig,
      options: {
        aspectRatio: 3,
        legend: false,
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "rgba(107,185,249, 0.3)",
              display: ticks
              // minRotation: 45,
              // maxRotation: 45
            },
            gridLines: {
              color: "rgba(107,185,249, 0.3)",
              display: ticks
            },
            type: "time",
            time: {
              unit: "day"
            }
          }],
          yAxes: [{
            gridLines: {
              color: "rgba(107,185,249, 0.3)",
              display: ticks
            },
            ticks: {
              beginAtZero: true,
              fontColor: "rgba(107,185,249, 0.3)",
              display: ticks
            }
          }]
        }
      }
    });
    return template
  }
}

function lsTest() {
  const test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// document.getElementById("download").addEventListener("click", function() {

//   html2canvas(document.querySelector('#boundary')).then(function(canvas) {

//       console.log(canvas);
//       saveAs(canvas.toDataURL(), 'file-name.png');
//   });
// });

  function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
      link.href = uri;
      link.download = filename;

      //Firefox requires the link to be in the body
      document.body.appendChild(link);

      //simulate click
      link.click();

      //remove the link when done
      document.body.removeChild(link);
    } else {
      window.open(uri);
    }
  }