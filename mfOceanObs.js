const axios = require('axios')
const { getFilename, obsIsValid,  toGeoJson, toKML, toCSV, outputResults} =  require('./utils');
const fs = require('fs');

baseUrl = "https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Marine/marine.YYYYMMDD.csv"

const curr_date = new Date();
var day = curr_date.getUTCDate() ;
var month = curr_date.getUTCMonth() + 1;
var year = curr_date.getUTCFullYear().toString();
var hour = curr_date.getUTCHours();
var formattedMonth = ("0" + month).slice(-2);
var formattedDay = ("0" + day).slice(-2);
var formattedHour = ("0" + hour).slice(-2);

const url = baseUrl.replace(/YYYY/, year).replace(/MM/, formattedMonth).replace(/DD/, formattedDay);

function rowToDictionary(fields, rowComponents){
    
    if(rowComponents.length > 1){
        dict = {}
        for(k = 0 ; k < fields.length-1; k++){
            dict[fields[k]] = rowComponents[k]
        }
        return dict
    }
    return null
};

function dictionaryToObs(data, row){
 
    // {
    //     numer_sta: '4100300',
    //     date: '20241209040000',
    //     lat: '15.840000',
    //     lon: '-57.490000',
    //     t: '300.650000',
    //     td: '295.850000',
    //     u: '75.000000',
    //     dd: '70.000000',
    //     ff: '7.100000',
    //     pmer: '101530',
    //     tmer: '301.750000',
    //     HwaHwa: 'mq',
    //     PwaPwa: 'mq',
    //     dwadwa: 'mq',
    //     Hw1Hw1: 'mq',
    //     Pw1Pw1: 'mq',
    //     dw1dw1: 'mq',
    //     Hw2Hw2: 'mq',
    //     Pw2Pw2: 'mq',
    //     dw2dw2: 'mq',
    //     tend: 'mq',
    //     cod_tend: 'mq',
    //     vv: 'mq',
    //     ww: 'mq',
    //     w1: 'mq',
    //     w2: 'mq',
    //     n: 'mq',
    //     nbas: 'mq',
    //     hbas: 'mq',
    //     cl: 'mq',
    //     cm: 'mq',
    //     ch: 'mq',
    //     rafper: '10.500000',
    //     per: '-10',
    //     phenspe1: 'mq',
    //     phenspe2: 'mq'
    //   }
    if('lat' in data && 'lon' in data){
        lat = data['lat']
        lon = data['lon']
        station = data['numer_sta']
        time_raw = data['date']
        dir = parseFloat(data['dd'])
        spd = parseFloat(data['ff'])
        y = time_raw[0] + time_raw[1] + time_raw[2] + time_raw[3]
        m = time_raw[4] + time_raw[5]
        d = time_raw[6] + time_raw[7]
        h = time_raw[8] + time_raw[9]
        min = time_raw[10] + time_raw[11]
        sec = time_raw[12] + time_raw[13]
        // 2024-12-06T10:36:00Z
        time = y + '-'+ m + '-' + d + 'T' + h + ':' + min + ':' + sec +'Z'
    
        t = data.t == '' ? null: parseFloat(data.t) - 273.15
        
        obs = {
            'latitude':parseFloat(lat),
            'longitude':parseFloat(lon),
            'elevation_m':null,
            'observation_time':time,
            'station_id':station,
            'temperature_c': t,
            'wind_speed_ms': spd,
            'wind_direction': dir,
            'wind_gust':null,
            'precipitation_mm': null,
            'precipitation_3hr_mm': null,
            'precipitation_6hr_mm': null,
            'precipitation_24hr_mm': null,
            'source': 'mfocean',
            'raw': row,
            'h3_index':null,
            'md5_hash': null
        }
        if(obsIsValid(obs)){
            return obs
        }
    }
   
};

// https://donneespubliques.meteofrance.fr/client/document/doc_parametres_ship_169.pdf
const access_t = new Date();
axios.get(url).then(function (response) {    
    const rows = response.data.split('\n')
    
    const fields = rows[0].split(';')
    // console.log(data)
    observations = []
    
    for(i = 1 ; i < rows.length; i++){
      
        try{
            current_d = rowToDictionary(fields,rows[i].split(';'))
            if(current_d != null){
                current_o = dictionaryToObs(current_d, rows[i])
                if(current_o != null){
                    observations.push(current_o)
                }
            }
        }catch(err){
            console.log(err)
        }
        
    }
    
    filename = 'output/' + getFilename('mfoceans')
    outputResults(filename, access_t, observations)
    
  })

  .catch(function (error) {
    // handle error
    // console.log(error);
  })