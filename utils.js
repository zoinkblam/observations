const fs = require('fs');
const h3 = require("h3-js");
const { writeObservations } = require('./observationIntegrater')
const md5 = require("md5");

function getFilename(obsSource){
    var now = new Date().toLocaleString();
    // 12/7/2023, 10:28:15 PM
    a = now.split(',')[0]
    year = a.split('/')[2].trim()
    month = a.split('/')[0].trim()
    if(month < 10){
        month = '0' + month
    }
    day = a.split('/')[1].trim()
    if(day < 10){
        day = '0' + day
    }
    hour = now.split(',')[1].split(':')[0].trim()
    if(hour < 10){
        hour = '0' + hour
    }
    minute = now.split(',')[1].split(':')[1].trim()
    if(minute < 10){
        minute = '0' + minute
    }

    r = year + '-' + month + '-' + day + 'T' + hour + '' + minute

    filename = obsSource + '-observations-' + r 
    return filename
}

function fieldIsValid(field){
    if(field == null || field == undefined){
        return false
    }
    if(typeof field === 'string' || field instanceof String){
        return (field !== '') && (field != null) && (field !== 'NaN') 
    }
    if(isNaN(field)){
        return false
    }
    return true
}

function isFloat(n) {
    return (parseFloat(n) === n && !Number.isInteger(n)) 
}

function obsIsValid(obs){
    hasNonEmpty = false

    if(obs['latitude'] != null && obs['longitude'] != null && ! isNaN(obs['latitude'])  && !isNaN(obs['longitude']) && obs['latitude'] != 'NaN' && obs['longitude'] != 'NaN'){
        
        if(obs['observation_time'] !== '' && obs['observation_time'] !== null)  {
            
            Object.keys(obs).forEach(key => {
                if(key != 'latitude' && key != 'longitude' && key != 'source' && key != 'station_id' && key != 'elevation_m' && key != 'observation_time'){
                    if(obs[key] != null && obs[key] != undefined && !isNaN(obs[key]) && obs[key] != ''){
                        hasNonEmpty = true
                       
                    }
                }
            })
        }
    }
    return hasNonEmpty
}


function formatObservation(access_time, observation){

    keys = ['latitude', 'longitude', 'elevation_m', 'temperature_c', 'wind_speed_ms', 'wind_direction', 'wind_gust', 'precipitation']
    keys.forEach(k => {
       
        if(fieldIsValid(observation[k]) && isFloat(observation[k])){

            observation[k] =  observation[k].toFixed(5)
        }
    })
    observation['access_time'] = access_time.toISOString()

    var observation_time_original =  new Date(observation['observation_time']);
    var num_minutes_to_round = 1000 * 60 * 5;
    var observation_time_rounded = new Date(Math.round(observation_time_original.getTime() / num_minutes_to_round) * num_minutes_to_round)
    observation['observation_time'] = observation_time_rounded.toISOString()
    // Level 8 has average hexagon area of 0.7 sq km. https://h3geo.org/docs/core-library/restable/#average-area-in-km2
    h3_index = h3.latLngToCell(observation['latitude'], observation['longitude'], 8)
    observation['h3_index'] = h3_index

    hash_str = h3_index + observation['observation_time']
    observation['md5_hash'] = md5(hash_str)
}

function getEmptyObs(){
    var obs = {
        'access_time':'',
        'latitude':null,
        'longitude':null,
        'elevation_m':'',
        'observation_time':'',
        'station_id':'',
        'temperature_c': '',
        'wind_speed_ms': '',
        'wind_direction': '',
        'wind_gust': '',
        'precipitation': '',
        'source': '',
        'raw':'',
        'h3_index':'',
        'md5_hash': ''
    }
    return obs
}


function outputResults(filename, access_time, observationList){
    
    observationList.forEach(o => {
        formatObservation(access_time, o)
    })
    writeObservations(observationList)
    toGeoJson(filename, observationList)
    toKML(filename, observationList)
    toCSV(filename, observationList)
}

function toGeoJson(filename, observationList){
    
    var collection = {
        "type": "FeatureCollection",
        "features": []
    }
    observationList.forEach(o => { 
        var properties = {}
        
        Object.keys(o).forEach(k => {
            if(k!= 'raw' && fieldIsValid(o[k])){
                properties[k] = o[k]
            }
        })
        var p = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [o['longitude'], o['latitude']]
            },
            "properties": properties 
          }
        collection["features"].push(p)
    })
    fs.writeFileSync(filename + '.json', JSON.stringify(collection), 'utf-8') 
}

function obsToString(obs){
    
    s = ''
    Object.keys(obs).forEach(k => {
        if(k != 'raw' && fieldIsValid(obs[k])){
            s = s + k + ' = ' + obs[k] + '\n'
        }
    })
}

function toKML(filename, observationList){
   
    var opening = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <kml xmlns=\"http://earth.google.com/kml/2.2\"> <Document><name>Observations</name><open>1</open> <Folder><name>Observations with time stamps</name><open>1</open>"
    observationList.forEach(datapoint => {
        
        opening = opening + "<Placemark><name>Observation</name><TimeStamp><when>" + datapoint.observation_time + "</when></TimeStamp><Point><coordinates>" + datapoint.longitude + "," + datapoint.latitude + "</coordinates></Point>"
        opening = opening+ "<description>" + obsToString(datapoint) + "</description></Placemark>"
    })
    opening = opening + "</Folder></Document></kml>"
    fs.writeFileSync(filename + '.kml', opening, 'utf-8')     
}

function toCSV(filename, observationList){
  
    csv = ''
    first = true
    Object.keys(getEmptyObs()).forEach(key => {
        if(key != 'raw'){
            if(first){
                csv = csv + key
                first = false
            }else{
                csv = csv + ', ' + key
            }
        }
    })
    csv = csv + '\n'
           
    observationList.forEach(datapoint => {
        first = true
       
        Object.keys(getEmptyObs()).forEach(key => {
            if(key != 'raw'){
               
                var value = datapoint[key]
                
                if(! fieldIsValid(value)){
                    value = ''
                }
               
                if(first){
                    csv = csv + value
                    first = false
                }else{
                    csv = csv + ',' + value
                }
            }
           
        })
        csv = csv + '\n'
    })
    fs.writeFileSync(filename + '.csv', csv, 'utf-8')     
}

module.exports = { getFilename, obsIsValid , toGeoJson, toKML, toCSV, outputResults} ; 