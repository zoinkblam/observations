// curl 'https://fmiodata-timeseries-convert.fmi.fi/stations?lang=en&params=1%2C37%2C67%2C29%2C44%2C47%2C41&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-13+06%3A59%3A59&group=AWS%2CSYNOP%2CAVI'
// curl 'https://fmiodata-timeseries-convert.fmi.fi/stations?lang=en&params=11%2C12%2C13%2C48%2C49%2C51%2C52%2C61%2C71&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-14+06%3A59%3A59&group=AWS%2CSYNOP%2CAVI'

const axios = require('axios')

const fs = require('fs');
const { getFilename, obsIsValid,  toGeoJson, toKML, toCSV} =  require('./utils');
const h3 = require("h3-js");

let d = new Date(); // Current date and time

var day = d.getUTCDate() 
var month = d.getUTCMonth() + 1
var year = d.getUTCFullYear().toString()
var nowHour = d.getUTCHours()
// Subtract 24 hours in milliseconds
d.setTime(d.getTime() - 24 * 60 * 60 * 1000); 

var day_y= d.getUTCDate() 
var month_y = d.getUTCMonth() + 1
var year_y = d.getUTCFullYear().toString()
var nowHour_y = d.getUTCHours()

url1 = 'https://fmiodata-timeseries-convert.fmi.fi/stations?lang=en&params=1%2C37%2C67%2C29%2C44%2C47%2C41&starttime=' + year + '-' + month + '-' + day+ '+' + nowHour +'%3A00%3A00&endtime=' + year_y + '-' + month_y + '-' + day_y + '+' + nowHour_y + '%3A59%3A59&group=AWS%2CSYNOP%2CAVI&format=json'
url2 = 'https://fmiodata-timeseries-convert.fmi.fi/stations?lang=en&params=11%2C12%2C13%2C48%2C49%2C51%2C52%2C61%2C71&starttime=' + year + '-' + month + '-' + day+ '+' + nowHour +'%3A00%3A00&endtime=' + year_y + '-' + month_y + '-' + day_y + '+' + nowHour_y + '%3A59%3A59&group=AWS%2CSYNOP%2CAVI&format=json'
// for each station
// curl 'https://fmiodata-timeseries-convert.fmi.fi/convert?producer=opendata&fmisid=101537&param=stationname%2Ctime%2CTA_PT1H_AVG+as+Average+temperature+%5B%C2%B0C%5D%2CTA_PT1H_MAX+as+Maximum+temperature+%5B%C2%B0C%5D%2CTA_PT1H_MIN+as+Minimum+temperature+%5B%C2%B0C%5D%2CRH_PT1H_AVG+as+Average+relative+humidity+%5B%25%5D%2CWS_PT1H_AVG+as+Wind+speed+%5Bm%2Fs%5D%2CWS_PT1H_MAX+as+Maximum+wind+speed+%5Bm%2Fs%5D%2CWD_PT1H_AVG+as+Average+wind+direction+%5B%C2%B0%5D%2CWG_PT1H_MAX+as+Maximum+gust+speed+%5Bm%2Fs%5D%2CPRA_PT1H_ACC+as+Precipitation+%5Bmm%5D&timestep=data&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-14+06%3A59%3A59&format=json&lang=en&tz=UTC'
// curl 'https://fmiodata-timeseries-convert.fmi.fi/convert?producer=opendata&fmisid=101537&param=stationname%2Ctime%2CTA_PT1M_AVG+as+Air+temperature+%5B%C2%B0C%5D%2CCLA_PT1M_ACC+as+Cloud+cover+%5B1%2F8%5D%2CPA_PT1M_AVG+as+Air+pressure+%5BhPa%5D%2CPRI_PT10M_AVG+as+Precipitation+amount+%5Bmm%5D%2CWD_PT10M_AVG+as+Wind+direction+%5B%C2%B0%5D%2CWG_PT10M_MAX+as+Gust+speed+%5Bm%2Fs%5D%2CWS_PT10M_AVG+as+Wind+speed+%5Bm%2Fs%5D&timestep=data&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-14+06%3A59%3A59&format=json&lang=en&tz=UTC'
// curl 'https://fmiodata-timeseries-convert.fmi.fi/convert?producer=opendata&fmisid=101537&param=stationname%2Ctime%2CTA_PT1H_AVG+as+Average+temperature+%5B%C2%B0C%5D%2CTA_PT1H_MAX+as+Maximum+temperature+%5B%C2%B0C%5D%2CTA_PT1H_MIN+as+Minimum+temperature+%5B%C2%B0C%5D%2CRH_PT1H_AVG+as+Average+relative+humidity+%5B%25%5D%2CWS_PT1H_AVG+as+Wind+speed+%5Bm%2Fs%5D%2CWS_PT1H_MAX+as+Maximum+wind+speed+%5Bm%2Fs%5D%2CWD_PT1H_AVG+as+Average+wind+direction+%5B%C2%B0%5D%2CWG_PT1H_MAX+as+Maximum+gust+speed+%5Bm%2Fs%5D%2CPRA_PT1H_ACC+as+Precipitation+%5Bmm%5D&timestep=data&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-14+06%3A59%3A59&format=json&lang=en&tz=UTC'
// curl 'https://fmiodata-timeseries-convert.fmi.fi/convert?producer=opendata&fmisid=101537&param=stationname%2Ctime%2CTA_PT1M_AVG+as+Air+temperature+%5B%C2%B0C%5D%2CCLA_PT1M_ACC+as+Cloud+cover+%5B1%2F8%5D%2CPA_PT1M_AVG+as+Air+pressure+%5BhPa%5D%2CPRI_PT10M_AVG+as+Precipitation+amount+%5Bmm%5D%2CWD_PT10M_AVG+as+Wind+direction+%5B%C2%B0%5D%2CWG_PT10M_MAX+as+Gust+speed+%5Bm%2Fs%5D%2CWS_PT10M_AVG+as+Wind+speed+%5Bm%2Fs%5D&timestep=data&starttime=2024-12-13+07%3A00%3A00&endtime=2024-12-14+06%3A59%3A59&format=json&lang=en&tz=UTC''
axios.get(url1, { responseType: 'application/json' }).then(function (response) {
    console.log(url1)
    console.log(response.data)
    id = '101537'
    
    axios.get(url3, { responseType: 'application/json' }).then(function (response) {
        console.log(url3)
        console.log(response.data)
        url4 = 'https://fmiodata-timeseries-convert.fmi.fi/' + String(encodeURIComponent(JSON.parse(response.data)["csv"]))
        console.log(url4)
    
        
    })
    .catch(function (error) {
      // handle error
      // console.log(error);
    })
    

})
.catch(function (error) {
  // handle error
  // console.log(error);
})
