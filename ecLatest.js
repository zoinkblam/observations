const axios = require('axios');
const puppeteer = require('puppeteer');
const parseString = require('xml2js').parseString;

baseUrl = "https://dd.weather.gc.ca/observations/swob-ml/latest"

sources = []

function rowToDictionary(fields, row){
    rowComponents = row.split(',')
    dict = {}
    for(i = 0 ; i < fields.length; i++){
        
        dict['' + fields[i]] = rowComponents[i]
    }
    return dict
}

function trimFields(fields){
    f = []
    fields.forEach(field => {
        f.push(field.trim())
    })

    return f
}


(async (url) => {
    const browser = await puppeteer.launch({headless: true, args:['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto(url)
    const links = await page.$$eval('a', anchors => { return anchors.map(anchor => anchor.href) })

    const linksToDocs = []
    links.forEach(link => {
        if(link.endsWith('.xml')){
            linksToDocs.push(link)
        }
    })
  
    await browser.close()
    t = true
    linksToDocs.forEach(link => {
        if(t) {
            // t = false
            axios.get(link).then(function (response) {
                data = response.data
                
                parseString(data, function (err, result) {

                    obsList = result['om:ObservationCollection']['om:member'];
                    obsList.forEach(obs => {
                        console.log(JSON.stringify(obs['om:Observation'][0]['om:metadata'][0]))
                    })
                });
    
            })
        }
    })

})(baseUrl)