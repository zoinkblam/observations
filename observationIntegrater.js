const h3 = require("h3-js");
const { Client } = require('pg');

async function writeObservations(observations) {
    const client = new Client({
        database: 'weather_observations',
        host: 'localhost',
        port: 5432,
        user: os.env.DB_USER,
        password: os.env.DB_PASSWORD
    });

        await client.connect();

        const query = `
            INSERT INTO observations (
                access_time,
                latitude,
                longitude, 
                elevation_m,
                observation_time,
                station_id,
                temperature_c,
                wind_speed_ms,
                wind_direction,
                wind_gust,
                precipitation_mm,
                data_source,
                raw_data,
                h3_index,
                md5_hash,
                geom
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography)
        `;
        for(i = 0; i < observations.length; i++){
            obs = observations[i]
            try{
                await client.query(query, [
                    obs.access_time,
                    obs.latitude,
                    obs.longitude,
                    obs.elevation_m,
                    obs.observation_time,
                    obs.station_id,
                    obs.temperature_c,
                    obs.wind_speed_ms, 
                    obs.wind_direction,
                    obs.wind_gust,
                    obs.precipitation_mm,
                    obs.source,
                    obs.raw,
                    obs.h3_index,
                    obs.md5_hash
                ]);
            }catch(err){
                console.log(err)
            }
            
        }
      
        // Wait for the query to complete before closing connection
        
   // Re-throw the error to handle it in the calling function
   
        await client.end(); // Make sure to close the connection even if there's an error
    
}

module.exports = { writeObservations };