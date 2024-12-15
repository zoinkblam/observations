// const axios = require('axios')

// base = "https://sdf.ndbc.noaa.gov/sos/server.php?request=GetObservation&service=SOS&version=1.0.0&offering=urn:ioos:network:noaa.nws.ndbc:all&observedproperty=PROPERTY&responseformat=text/csv&eventtime=2022-11-20T00:00Z/2022-11-20T12:00Z"

// properties = [
//     "air_pressure_at_sea_level",
//     "air_temperature",
//     "currents",
//     "sea_floor_depth_below_sea_surface",
//     "sea_water_electrical_conductivity",
//     "sea_water_salinity",
//     "sea_water_temperature",
//     "Waves",
//     "Winds"];


// function rowToDictionary(fields, row){
//     rowComponents = row.split(',')
//     dict = {}
//     for(i = 0 ; i < fields.length; i++){
        
//         dict['' + fields[i]] = rowComponents[i]
//     }
//     return dict
// }

// properties.forEach(property => {
//     url = base.replace(/PROPERTY/g, property)
    
//     axios.get(url).then(function (response) {    
//         data = response.data.split('\n')

//         fields = data[0].replace(/"/g, '').split(',')
//         for(i = 1; i < fields.length; i++){
//             console.log(rowToDictionary(fields, data[i]))
//         }
        
        
//       })
//       .catch(function (error) {
//         // handle error
//         // console.log(error);
//       })
// })
