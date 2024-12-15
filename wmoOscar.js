


const axios = require('axios')

const zlib = require('node:zlib');
const fs = require('fs');
const { getFilename, obsIsValid,  toGeoJson, toKML, toCSV} =  require('./utils');
const base = 'https://oscar.wmo.int/surface/rest/api/search/station?&stationClass=agriculturalStation,AWS,climatologicalStation,precipitationStation,windProfiler,SeaProfilingStation,synopLand,synopSea,weatherRadar,GBONsurface&items=10000';
// const base = 'https://oscar.wmo.int/surface/rest/api/search/station?&stationClass=agriculturalStation&items=100';


function rowToDictionary(fields, row){
    rowComponents = row.split(',')
    dict = {}
    for(i = 0 ; i < fields.length; i++){
        dict[fields[i]] = rowComponents[i]
    }
    return dict
}

function dictionaryToObs(data){

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
        'source': 'metar'
    }
   
    if(obsIsValid(obs)){
        return obs
    }
}

function numericFieldOkay(field){
    return field != NaN && field != null && field != undefined && field != ''
}

function stringFieldOkay(field){
    return field != '' && field != null && field != undefined
}

function keepStation(station){
    // id: 129100,
    // name: 'Koichab Pan',
    // region: 'Africa',
    // territory: 'Namibia',
    // declaredStatus: 'Operational',
    // latitude: -26.207611,
    // longitude: 15.863,
    // elevation: 525,
    // stationTypeName: 'Land (fixed)',
    // wigosStationIdentifiers: [
    //   { wigosStationIdentifier: '0-516-1-31215', primary: true },
    //   { wigosStationIdentifier: '0-516-0-31215', primary: false }
    // ],
    // wigosId: '0-516-1-31215',
    // stationTypeId: 1,
    // dateEstablished: '2016-10-18T22:00:00.000+00:00',
    // stationStatusCode: 'operational',
    // stationTypeCode: 'landOceanSurface',
    // stationProgramsDeclaredStatuses: 'GBON:Operational, RBON:Operational',
    // stationDeclaredStatusCode: 'operational',
    // assessedStatus: 'Unknown',
    // stationAssessedStatusCode: 'unknown',
    // stationProgramsAssessedStatuses: 'GBON:Unknown, RBON:Non-reporting',
    // programApprovalStatus: 'GBON:Approved,RBON:Approved'
    locationOkay = numericFieldOkay(station['latitude']) && numericFieldOkay(station['longitude'])
    isOperational = stringFieldOkay(station['stationStatusCode']) && station['stationStatusCode'] == 'operational'

    return locationOkay && isOperational
}

function filterStations(allStations){
    stationsToKeep = []
    allStations.forEach(station => {
        if(keepStation(station)){
            stationsToKeep.push(station)
        }
    })
    return stationsToKeep
}

(async (url) => {
    url_with_page = url + '&page=1'
    console.log('Getting first page of stations...')
    axios.get(url_with_page).then(async function (response) {
        data = response.data
        numPages = data['pageCount']
        numStations = data['totalCount']
        console.log("There are a total of " + String(numStations) + " stations across " + String(numPages) + " pages.")
        const stations = data['stationSearchResults'];

        pageNumber = 2
        //pageNumber = numPages // REMOVE
        while(pageNumber <= numPages){
            console.log("Getting page " + String(pageNumber) + ".")
            url_with_page = url + '&page=' + String(pageNumber)
            current_page = await axios.get(url_with_page)
            stations.concat(current_page.data['stationSearchResults'])
            
            pageNumber += 1
        }
        console.log("All pages retreived.")
      
        
        try{
            const toKeep = filterStations(stations)
            asMap = []
            toKeep.forEach(s => {
                p = {'latitude':s['latitude'], 'longitude':s['longitude'], 'station_id':s['name']}
                asMap.push(p)
            })
            toCSV('wmoStations', asMap)
            fs.writeFileSync('wmoStations' + '.json', JSON.stringify(toKeep), 'utf-8') 
        }catch(err){
            console.log(err)
        }
       
    })
    .catch(function (error) {
        // handle error
        // console.log(error);
    })

})(base)