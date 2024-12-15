// const axios = require('axios')

// baseUrl = "https://donneespubliques.meteofrance.fr/donnees_libres/Txt/Synop/synop.YYYYMMDDRR.csv"
// const d = new Date();

// const cycles = ['00', '03', '06', '09', '12', '15', '18', '21']
// var day = d.getUTCDate() 
// var month = d.getUTCMonth() + 1
// var year = d.getUTCFullYear().toString()
// var hour = d.getUTCHours()
// var formattedMonth = ("0" + month).slice(-2)
// var formattedDay = ("0" + day).slice(-2)
// var formattedHour = ("0" + hour).slice(-2);

// var found = false;
// var nowCycle = cycles[0]
// for(t = 0; t < cycles.length-1; t++){
//     if(!found){
//         if(parseInt(cycles[t+1]) > hour){
//             found = true
//             nowCycle = cycles[t]
//         }
//     }
// }

// const url = baseUrl.replace(/YYYY/, year).replace(/MM/, formattedMonth).replace(/DD/, formattedDay).replace(/RR/, nowCycle)

// function rowToDictionary(fields, rowComponents){
  
//     dict = {}
//     for(i = 0 ; i < fields.length-1; i++){
//         dict[fields[i]] = rowComponents[i]
        
//     }
//     return dict
// }

// // https://donneespubliques.meteofrance.fr/client/document/parametres-inclus-dans-les-fichiers-de-donnees-synop_283.pdf

// axios.get(url).then(function (response) {    
//     data = response.data.split('\n')
    
//     const fields = data[0].split(';')
 

//     for(i = 0 ; i < data.length; i++){
//         console.log(rowToDictionary(fields,data[i].split(';')))
//     }
    
//   })
//   .catch(function (error) {
//     // handle error
//     // console.log(error);
//   })