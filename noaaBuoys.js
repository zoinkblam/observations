const axios = require('axios')
const { getFilename, obsIsValid,  toGeoJson, toKML, toCSV, outputResults} =  require('./utils');
const fs = require('fs')

url = "https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt"


function dictionaryToObs(data, row){

    keys = ['LAT', 'LON', 'YYYY', 'MM', 'DD', 'hh', 'mm', ]
    // ATMP, WDIR, WSPD, GST, STN

    hasRequired = true
    for(i in keys){
        key = keys[i]
        if (!(key in data)){
            hasRequired = false
            console.log(key)
        }else{
            if(data[key]['value'] == undefined){
                hasRequired = false
            }
        }
    }

    if(hasRequired){
        year = data['YYYY']['value']
        month = data['MM']['value']
        day = data['DD']['value']
        hour = data['hh']['value']
        minute = data['mm']['value']
        date = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + '00Z'

        values_keys = [ 'ATMP', 'WDIR','WSPD', 'GST', 'STN']
        
        obs = {
            'latitude':parseFloat(data['LAT']['value']),
            'longitude':parseFloat(data['LON']['value']),
            'elevation_m':0,
            'observation_time':date,
            'station_id':data['STN']['value'],
            'temperature_c': null,
            'wind_speed_ms': null,
            'wind_direction': null,
            'wind_gust': null,
            'precipitation_mm': null,
            'precipitation_3hr_mm': null,
            'precipitation_6hr_mm': null,
            'precipitation_24hr_mm': null,
            'source':'buoys',
            'raw': row,
            'h3_index':null,
            'md5_hash': null
        }
        
        if('ATMP' in data){
            
            obs['temperature_c'] = parseFloat(data['ATMP']['value'])
            
        }
        if('WDIR' in data){
            obs['wind_direction'] = parseFloat(data['WDIR']['value'])
        }
        if('WSPD' in data){
            obs['wind_speed_ms'] = parseFloat(data['WSPD']['value'])
        }
        if('GST' in data){
            obs['wind_gust'] = parseFloat(data['GST']['value'])
        }

        if(obsIsValid(obs)){
            return obs
        }
    }
    return null
}

function rowToDictionary(fields, units, rowComponents){
  
    dict = {}
    for(i = 0 ; i < fields.length; i++){
        dict[fields[i]] = {value:rowComponents[i], units:units[i]}
    }
    return dict
}
function parseRowToArray(row){
    return row.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
}
const access_t = new Date();
axios.get(url).then(function (response) {    
    data = response.data.split('\n')
    fields = parseRowToArray(data[0].replace('#', ''))
    units = parseRowToArray(data[1].replace('#', ''))
    
    observations = []
    for(j=2; j < data.length; j++){
        d = rowToDictionary(fields, units, parseRowToArray(data[j]))
        o = dictionaryToObs(d, data[j])
        if(o != null){
            observations.push(o)
        }
    }
    
    filename = 'output/' + getFilename('noaabuoys')
    outputResults(filename, access_t, observations)    
    
  })
  .catch(function (error) {
    // handle error
    // console.log(error);
  })

//   STN: { value: 'YRSV2', units: 'text' },
//   LAT: { value: '37.414', units: 'deg' },
//   LON: { value: '-76.712', units: 'deg' },
//   YYYY: { value: '2024', units: 'yr' },
//   MM: { value: '12', units: 'mo' },
//   DD: { value: '05', units: 'day' },
//   hh: { value: '11', units: 'hr' },
//   mm: { value: '30', units: 'mn' },
//   WDIR: { value: '190', units: 'degT' },
//   WSPD: { value: '1.5', units: 'm/s' },
//   GST: { value: 'MM', units: 'm/s' },
//   WVHT: { value: 'MM', units: 'm' },
//   DPD: { value: 'MM', units: 'sec' },
//   APD: { value: 'MM', units: 'sec' },
//   MWD: { value: 'MM', units: 'degT' },
//   PRES: { value: '1006.0', units: 'hPa' },
//   PTDY: { value: 'MM', units: 'hPa' },
//   ATMP: { value: '5.4', units: 'degC' },
//   WTMP: { value: 'MM', units: 'degC' },
//   DEWP: { value: '-3.6', units: 'degC' },
//   VIS: { value: 'MM', units: 'nmi' },
//   TIDE: { value: 'MM', units: 'ft' }