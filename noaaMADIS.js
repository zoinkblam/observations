const axios = require('axios')
const puppeteer = require('puppeteer');
const fs = require('fs');
const { getFilename, obsIsValid,  toGeoJson, toKML, toCSV, outputResults } =  require('./utils');

// See variable list here: https://madis.ncep.noaa.gov/sfc_mesonet_variable_list.shtml
base = "https://madis-data.ncep.noaa.gov/madisPublic1/cgi-bin/madisXmlPublicDir?rdr=&time=0&minbck=-59&minfwd=0&recwin=3&dfltrsel=0&stanam=&stasel=0&pvdrsel=0&varsel=1&qctype=0&qcsel=99&xml=5&csvmiss=1&nvars=DD&nvars=FF&nvars=U&nvars=V&nvars=T&nvars=LAT&nvars=LON&nvars=PCPTOTL&nvars=PCP5M&nvars=PCP15M&nvars=PCP1H&nvars=PCP3H&nvars=PCP6H&nvars=PCP12H&nvars=PCP18H&nvars=PCP24H&nvars=PCPRATE&nvars=PCPINT&nvars=PCPTYPE&nvars=DDGUST&nvars=FFGUST&nvars=ELEV"
// nvars=TD&nvars=TD15M&nvars=TD1H&nvars=TD1HCHG&nvars=RH&nvars=RH15M&nvars=RH1H&nvars=RH1HCHG&nvars=WVMR&nvars=WVMR15M&nvars=WVMR1HC&nvars=Q&nvars=Q15M&nvars=Q1H&nvars=Q1HCHG&nvars=DPD&nvars=DPD15M
// &nvars=DPD1H&nvars=DPD1HC&nvars=AH&nvars=AH15M&nvars=AH1H&nvars=AH1HCHG&nvars=ALTSE&nvars=ALTS15M&nvars=AL1HCHG&nvars=PT3&nvars=PT3CHR&nvars=SLP&nvars=P&nvars=P15M&nvars=T&nvars=T15M&nvars=T1H&
// nvars=T1HCHG&nvars=TV&nvars=TV15M&nvars=TV1H&nvars=TV1HCHG&nvars=DD&nvars=DD15M&nvars=DD1H&nvars=DD24H&nvars=DDM15M&nvars=DDSD15M&nvars=DDU15M&nvars=FF&nvars=FF15M&nvars=FF1H&nvars=FF24H&nvars=FFSD15M&
// nvars=U&nvars=U1H&nvars=U24H&nvars=U15M&nvars=USD15M&nvars=V&nvars=V1H&nvars=V24H&nvars=V15M&nvars=VSD15M&nvars=VIS&nvars=VERTVIS&nvars=WMOID&nvars=ELEV&nvars=LAT&nvars=LON&nvars=PLATTYP&nvars=PLATDIR&
// nvars=PLATSPD&nvars=CORR&nvars=PCPTOTL&nvars=PCP5M&nvars=PCP15M&nvars=PCP1H&nvars=PCP3H&nvars=PCP6H&nvars=PCP12H&nvars=PCP18H&nvars=PCP24H&nvars=PCPMNTH&nvars=PCPLM&nvars=PCPUTCM&nvars=PCPCDAY&
// nvars=PCPUDAY&nvars=UDSTART&nvars=PCPRATE&nvars=PCPINT&nvars=PCPTYPE&nvars=SKYCVLB&nvars=LCLHT&nvars=LLCTYPE&nvars=MLCTYPE&nvars=HLCTYPE&nvars=CLDFRAC&nvars=T24MIN&nvars=T24MAX&nvars=FUELM&
// nvars=FUELT&nvars=SOILM&nvars=SOILMP&nvars=SOILM2&nvars=SOILM4&nvars=SOILM8&nvars=SOILM20&nvars=SOILM40&nvars=SOILT&nvars=SOILT2&nvars=SOILT4&nvars=SOILT8&nvars=SOILT20&nvars=SOILT40&
// nvars=DDGUST&nvars=FFGUST&nvars=DDMAX&nvars=DDMAX1H&nvars=FFMAX&nvars=FFMAX1H&nvars=FF24MAX&nvars=PSWDIR&nvars=PSWHT&nvars=PSWPER&nvars=SSWDIR&nvars=SSWHT&nvars=SSWPER&nvars=SST&
// nvars=TIDEDEP&nvars=TIDEIND&nvars=WAVEHT&nvars=WAVEPER&nvars=WAVESTP&nvars=WWVEPER&nvars=WWVEHT&nvars=HRWVEHT&nvars=EQFF10M&nvars=EQFF20M&nvars=SNOWC&nvars=SNOW6H&nvars=SNOW24H&nvars=FSRDINS&
// nvars=FSRD5M&nvars=FSRD15M&nvars=FSRD1H&nvars=FSRD24H&nvars=DSRDINS&nvars=DSRD5M&nvars=DSRD15M&nvars=DSRD1H&nvars=DSRD24H&nvars=GSRDINS&nvars=GSRD5M&nvars=GSRD15M&nvars=GSRD1H&nvars=GSRD24H&
// nvars=PAR&nvars=SOLRAD&nvars=TD10C&nvars=T10C&nvars=TWB&nvars=PWV&nvars=GPSTSD&nvars=GPSDSD&nvars=GPSWSD&nvars=GPSMWT&nvars=GPSFE&nvars=GPSWDMF&nvars=RDT1&nvars=RDT2&nvars=RDT3&nvars=RDT4&
// nvars=RDLFT1&nvars=RDLFT2&nvars=RDLFT3&nvars=RDLFT4&nvars=RDLCF1&nvars=RDLCF2&nvars=RDLCF3&nvars=RDLCF4&nvars=RDLCP1&nvars=RDLCP2&nvars=RDLCP3&nvars=RDLCP4&nvars=RDLIP1&nvars=RDLIP2&
// nvars=RDLIP3&nvars=RDLIP4&nvars=RDLDP1&nvars=RDLDP2&nvars=RDLDP3&nvars=RDLDP4&nvars=RDSTA1&nvars=RDSTA2&nvars=RDSTA3&nvars=RDSTA4&nvars=RDSUBT1&nvars=RDSUBT2&nvars=RDSUBT3&nvars=RDSUBT4&nvars=BATVLT&
// nvars=BATVLT2&nvars=RIVSTG&nvars=STNSPC1&nvars=STNSPC2&nvars=COMSTAT&nvars=STAQUAL&nvars=DOORIND&nvars=HEATIND&nvars=BUCKLEV&nvars=RIMT&nvars=MLLW&nvars=NOBS15M&nvars=ASBO15M&nvars=NOBSSC&
// nvars=AUTOTYP&nvars=REPTYPE&nvars=PRESWEA&nvars=SKYCOV&nvars=STALOC&nvars=SUBPVDR&nvars=T24MINT&nvars=T24MAXT&nvars=FOT15M&nvars=LOT15M&nvars=RAWMTR"

// DD        wind direction                       deg          3    5        X       X
// FF        wind speed                           m/s          3    5        X       X
// U         u wind component                     m/s          3    5        X       X
// V         v wind component                     m/s          3    5        X       X
// T         air temperature                      K            3    4        X       X
// LAT       latitude                             deg N        0             X       X
// LON       longitude                            deg E        0             X       X
// PCPTOTL   total precipitation                  m            0    30,6     X       X
// PCP5M     accumulated precip - 5m              m            1    6        X       X
// PCP15M    accumulated precip - 15m             m            1             X       X
// PCP1H     accumulated precip - 1h              m            1    7,6      X       X
// PCP3H     accumulated precip - 3h              m            1             X       X
// PCP6H     accumulated precip - 6h              m            1             X       X
// PCP12H    accumulated precip - 12h             m            1             X       X
// PCP18H    accumulated precip - 18h             m            1             X       X
// PCP24H    accumulated precip - 24h             m            1    6        X       X
// PCPRATE   precipitation rate                   kg/(m**2)/s  1    7        X       X
// PCPINT    precipitation intensity              code         0    8        X       X
// PCPTYPE   precipitation type                   code         0    9        X       X
// DDGUST    wind dir at gust                     deg          1    6        X       X
// FFGUST    wind gust                            m/s          2    6        X       X
// ELEV      elevation                            m            0             X       X
// function rowToDictionary(fields, row){
//     rowComponents = row.split(',')
//     dict = {}
//     for(i = 0 ; i < fields.length; i++){
        
//         dict['' + fields[i]] = rowComponents[i]
//     }
//     return dict
// }

function trimFields(fields){
    f = []
    fields.forEach(field => {
        f.push(field.trim())
    })

    return f
}

function rowToDictionary(row){
    // STAID     ,OBDATE    ,OBTIME,PVDR     ,SUBPVDR    ,DD           ,D,FF           ,D,U            ,D,V            ,D,T            ,D,LAT          ,D,LON          ,D,PCPTOTL      ,D,PCP5M        ,D,PCP15M       ,D,PCP1H        ,D,PCP3H        ,D,PCP6H        ,D,PCP12H       ,D,PCP18H       ,D,PCP24H       ,D,PCPRATE      ,D,PCPINT_1     ,D,PCPINT_2     ,D,PCPTYPE_1    ,D,PCPTYPE_2    ,D,DDGUST       ,D,FFGUST       ,D,ELEV         ,D,
    
    // SBRB      ,12/05/2024,13:00,OTHER-MTR ,           ,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,   -10.000000,Z,   -67.800003,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,             ,Z,
    parts = row.split(',')
    if(parts.length > 45){
        station = parts[0].trim()
        date = parts[1].trim()
        time = parts[2].trim()
        provider = parts[3].trim()
        subprovider = parts[4].trim()
        wind_direction = parts[5].trim()
        d1 = parts[6]
        wind_speed = parts[7].trim()
        d2 = parts[8]
        u = parts[9].trim()
        d3 = parts[10]
        v = parts[11].trim()
        d4 = parts[12]
        t = parts[13].trim()
        d5 = parts[14]
        lat = parts[15].trim()
        d6 = parts[16]
        lon = parts[17].trim()
        // D,PCPTOTL      ,D,PCP5M        ,D,PCP15M       ,D,PCP1H        ,D,PCP3H        ,D,PCP6H        ,D,PCP12H       ,D,PCP18H       ,D,PCP24H       
        //,D,PCPRATE      ,D,PCPINT_1     ,D,PCPINT_2     ,D,PCPTYPE_1    ,D,PCPTYPE_2    ,D,DDGUST       ,D,FFGUST       ,D,ELEV         ,D,
        pcptotl = parts[19].trim() // Units: m Unknown duration and depends on platform so basically useless. 
        pcp5m = parts[21].trim() // Units: m
        pcp15m = parts[23].trim() // Units: m
        pcp1h = parts[25].trim() // Units: m
        pcp3h = parts[27].trim() // Units: m
        pcp6h = parts[29].trim() // Units: m
        pcp12h = parts[31].trim() // Units: m
        pcp18h = parts[33].trim() // Units: m
        pcp24h = parts[35].trim()
        pcprate = parts[37].trim() // Units: kg/(m**2)/s
        pcpint1 = parts[39].trim() // Units: code
        pcpint2 = parts[41].trim() // Units: code
        pcptype1 = parts[43].trim() // Units: code
        pcptype2 = parts[45].trim() // Units: code
        wind_gust_dirction = parts[47].trim()
        wind_gust_speed = parts[49].trim()
        elevation = parts[51].trim()

        y = date.split('/')[2]
        m = date.split('/')[0]
        d = date.split('/')[1]
        
        obs = {
            'latitude':parseFloat(lat),
            'longitude':parseFloat(lon),
            'elevation_m':elevation == ''? null: parseFloat(elevation),
            'observation_time': y  + '-' + m + '-' + d + 'T' + time + ':00Z',
            'station_id':station,
            'temperature_c': t == ''? null: parseFloat(t)-273.15,
            'wind_speed_ms': wind_speed == ''? null: parseFloat(wind_speed),
            'wind_direction': wind_direction == ''? null:parseFloat(wind_direction),
            'wind_gust': wind_gust_speed == ''? null: parseFloat(wind_gust_speed),
            'precipitation_mm': pcp1h == ''? null: parseFloat(pcp1h)*1000,
            'precipitation_3hr_mm': pcp3h == ''? null: parseFloat(pcp3h)*1000,
            'precipitation_6hr_mm': pcp6h == ''? null: parseFloat(pcp6h)*1000,
            'precipitation_24hr_mm': pcp24h == ''? null: parseFloat(pcp24h)*1000,
            'source': 'MADIS',
            'raw': row,
            'h3_index':null,
            'md5_hash': null
        }
        
        if(obsIsValid(obs)){
            
            return obs
        }
    }
}
const access_t = new Date();

(async (url) => {
    const browser = await puppeteer.launch({headless: true, args:['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto(url, {waitUntil: 'load', timeout:480000})
    const content = await page.$$eval('body > h3 > pre', content => { return content[0].textContent })
    const observation_list = content.split('\n')
    
    await browser.close()
    
    observations = []
    observation_list.forEach(datapoint => {
        o = rowToDictionary(datapoint)

        if( o != null){
            observations.push(o)
        }
    })

    filename = 'output/' + getFilename('noaamadis')
    outputResults(filename, access_t, observations)
     

})(base)
