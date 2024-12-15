const axios = require('axios')

const zlib = require('node:zlib');
const fs = require('fs');
const { getFilename, obsIsValid, outputResults } =  require('./utils');
const h3 = require("h3-js");

base = "https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=csv&startTime=STARTTIME&endTime=ENDTIME"

// now = Math.floor(Date.now() / 1000).toString()
// then = (now - (5*3600)).toString()

// url = base.replace(/STARTTIME/g, then).replace(/ENDTIME/g,now)
url = 'https://aviationweather.gov/data/cache/metars.cache.csv.gz'

function rowToDictionary(fields, row){
    if(row[0] == '"'){
        
        remainder = row.split('",')[1]
        
        first = row.split('",')[0].replace(/,/g, "").replace(/"/g, "")
        r = first + ',' + remainder
    }else{
        r = row
    }
    rowComponents = r.split(',')
    
    dict = {}
    for(i=0 ; i < fields.length; i++){
        dict[fields[i]] = rowComponents[i]
    }
   
    return dict
}

function dictionaryToObs(data, row){

    lat = parseFloat(data.latitude)
    lon = parseFloat(data.longitude)
    elevation = data.elevation == '' ? null: parseFloat(data.elevation)
    time = data.observation_time
    t = data.temp_c == '' ? null: parseFloat(data.temp_c)
    station = data.station_id
    wind_speed = data.wind_speed_kt== '' ? null: parseFloat(data.wind_speed_kt)/1.944
    wind_direction = data.wind_dir_degrees== '' ? null: parseFloat(data.wind_dir_degrees)
    wind_gust_speed = data.wind_gust_kt == '' ? null: parseFloat(data.wind_gust_kt)/1.944
    wind_gust_direction = -1
    pcptotl = data.precip_in == '' ? null: parseFloat(data.precip_in)
   
    // observation_time: '2024-12-06T10:36:00Z',
    // latitude: '34.047',
    // longitude: '131.052',
    // temp_c: '12',
    // dewpoint_c: '1',
    // wind_dir_degrees: '300',
    // wind_speed_kt: '15',
    // wind_gust_kt: '25',
    // visibility_statute_mi: '6+',
    // altim_in_hg: '30.06',
    // sea_level_pressure_mb: '',
    // corrected: '',
    // auto: '',
    // auto_station: '',
    // maintenance_indicator_on: '',
    // no_signal: '',
    // lightning_sensor_off: '',
    // freezing_rain_sensor_off: '',
    // present_weather_sensor_off: '',
    // wx_string: '',
    // sky_cover: '',
    // cloud_base_ft_agl: '',
    // flight_category: 'VFR',
    // three_hr_pressure_tendency_mb: '',
    // maxT_c: '',
    // minT_c: '',
    // maxT24hr_c: '',
    // minT24hr_c: '',
    // precip_in: '',
    // pcp3hr_in: '',
    // pcp6hr_in: '',
    // pcp24hr_in: '',
    // snow_in: '',
    // vert_vis_ft: '',
    // metar_type: 'SPECI',
    // elevation_m: '4'

    var obs = {
        'latitude':parseFloat(lat),
        'longitude':parseFloat(lon),
        'elevation_m':elevation,
        'observation_time':time,
        'station_id':station,
        'temperature_c': t,
        'wind_speed_ms': wind_speed,
        'wind_direction': wind_direction,
        'wind_gust':wind_gust_speed,
        'precipitation': pcptotl,
        'source': 'metar', 
        'raw': row
    }
   
    if(obsIsValid(obs)){
        return obs
    }
}
const access_t = new Date();

axios.get(url, { responseType: 'arraybuffer' }).then(function (response) {
        
        const buffer = Buffer.from(response.data, 'binary'); // Your zipped buffer here

        zlib.gunzip(buffer, (err, unzippedBuffer) => {
        if (err) {
            console.error('An error occurred:', err);
            process.exitCode = 1;
        } else {
            // console.log(unzippedBuffer.toString()); // Output the unzipped data
            data = unzippedBuffer.toString().split('\n')
            errors = data[0]
            warnings = data[1]
            time = data[2]
            numResults = parseInt(data[4].split('results')[0])
            fields = data[5].split(',')

            dataPoints = []
            for(j=6; j < numResults+6; j++){
                d = rowToDictionary(fields, data[j])
                o = dictionaryToObs(d, data[j])
                
                if(o != null){
                    dataPoints.push(o)
                }
                // console.log(rowToDictionary(fields, data[j]))
                // dataPoints.push(rowToDictionary(fields, data[j]))
            }

            filename = 'output/' + getFilename('noaametars')
            
            outputResults(filename, access_t, dataPoints)
            
        }
    });
  })
  .catch(function (error) {
    // handle error
    // console.log(error);
  })

//   {
//     raw_text: 'SAZM 051200Z 28010KT CAVOK 19/14 Q1006',
//     station_id: 'SAZM',
//     observation_time: '2024-12-05T12:00:00Z',
//     latitude: '-37.932',
//     longitude: '-57.581',
//     temp_c: '19',
//     dewpoint_c: '14',
//     wind_dir_degrees: '280',
//     wind_speed_kt: '10',
//     wind_gust_kt: '',
//     visibility_statute_mi: '6+',
//     altim_in_hg: '29.70',
//     sea_level_pressure_mb: '',
//     corrected: '',
//     auto: '',
//     auto_station: '',
//     maintenance_indicator_on: '',
//     no_signal: '',
//     lightning_sensor_off: '',
//     freezing_rain_sensor_off: '',
//     present_weather_sensor_off: '',
//     wx_string: '',
//     sky_cover: '',
//     cloud_base_ft_agl: '',
//     flight_category: 'VFR',
//     three_hr_pressure_tendency_mb: '',
//     maxT_c: '',
//     minT_c: '',
//     maxT24hr_c: '',
//     minT24hr_c: '',
//     precip_in: '',
//     pcp3hr_in: '',
//     pcp6hr_in: '',
//     pcp24hr_in: '',
//     snow_in: '',
//     vert_vis_ft: '',
//     metar_type: 'METAR',
//     elevation_m: '17'
//   }