const axios = require('axios')
const puppeteer = require('puppeteer');

const siteListUrl = 'https://datahub.tahmo.org/custom/stations/geo.json'

const parameters = {
    'rh':'Relative Humidity',
    'te': 'Air Temperature',
    'ap':'Air Pressure',
    'ra':'Shortwave Radiation',
    'wg':'Wind Gust',
    'wd':'Wind Direction',
    'ws':'Wind Speed',
    'pr':'Precipitation'
};



(async () => {

    const browser = await puppeteer.launch({headless: true, args:['--no-sandbox']})
    const page = await browser.newPage()

    const result = await axios.get(siteListUrl)
    const stations = [];
    result.data.features.forEach(feature => {
        //console.log(feature)
        const tahmoId = feature.properties.name.split(' ')[0]
        const name = feature.properties.name.replace(tahmoId + ' ', '')
        const lat = feature.geometry.coordinates[0]
        const lon = feature.geometry.coordinates[1]
        stations.push({'id':tahmoId, 'name':name, 'lat':lat, 'lon':lon})
    })
    
    for(i=0; i < stations.length; i++){
        for(j=0; j < Object.keys(parameters).length; j++){
            
            const url = 'https://tahmo.org/?station=' + stations[i]['id'] + '&variable=' + Object.keys(parameters)[j]
            console.log(url)
            await page.goto(url, {waitUntil: 'load', timeout:480000})
            const content = await page.evaluate(() => {
                if(document.querySelector('#csv') != null){
                    return document.querySelector('#csv').textContent
                }
                
              });
            
            console.log(content)

        }
    }
   
    await browser.close()



})()


