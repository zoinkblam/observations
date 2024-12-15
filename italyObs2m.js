// https://meteohub.mistralportal.it/api/observations?q=reftime:%20%3E=2022-11-20%2000:00,%3C=2022-11-20%2023:59;product:B12101;license:CCBY_COMPLIANT;timerange:254,0,0;level:103,2000,0,0&output_format=JSON&networks=dpcn-basilicata&reliabilityCheck=true
// https://meteohub.mistralportal.it/api/observations?q=reftime:%20%3E=2022-11-20%2000:00,%3C=2022-11-20%2023:59;product:B11001;license:CCBY_COMPLIANT;timerange:254,0,0;level:103,10000,0,0&output_format=JSON&reliabilityCheck=true
// https://meteohub.mistralportal.it/api/observations?q=reftime:%20%3E=2022-11-20%2000:00,%3C=2022-11-20%2023:59;license:CCBY_COMPLIANT;timerange:254,0,0;level:103,2000,0,0&output_format=JSON&reliabilityCheck=true

const axios = require('axios')
// 2m, but could do 10m with level:103,10000,0,0
const baseUrl = "https://meteohub.mistralportal.it/api/observations?q=reftime:%20%3E=YYYY-MM-DD%2000:00,%3C=YYYY-MM-DD%2023:59;license:CCBY_COMPLIANT;timerange:254,0,0;level:103,2000,0,0&output_format=JSON&reliabilityCheck=true"
const d = new Date();
var day = d.getUTCDate() 
var month = d.getUTCMonth() + 1
var year = d.getUTCFullYear().toString()
var nowHour = d.getUTCHours()
var formattedMonth = ("0" + month).slice(-2)
var formattedDay = ("0" + day).slice(-2)
var formattedHour = ("0" + nowHour).slice(-2);
const url = baseUrl.replace(/YYYY/g, year).replace(/MM/g, formattedMonth).replace(/DD/g, formattedDay)


const dailyObservations = {}

axios.get(url).then(function (response) {    
    data = response.data
    console.log(data.descr)
    console.log(data.data[0].prod)
    for(var j = 0 ; j < data.data.length; j++) {
        const stat = data.data[j].stat
        const lat = stat.lat
        const lon = stat.lon
        const net = stat.net
        const val = stat.details[0].val

        const prod = data.data[j].prod[0]
        const param = data.descr[prod.var]
        const paramdesc = param.descr
        const unit = param.unit
        const records = prod.val
       
        records.forEach(r => {
            console.log({lat:lat, lon:lon, net:net, param:paramdesc, unit:unit, value:r.val, time:r.ref})
        })

    }
    
  })
  .catch(function (error) {
    // handle error
    // console.log(error);
  })