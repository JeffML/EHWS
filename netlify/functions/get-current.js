const https = require("https");

exports.handler = async (event, context) => {
  const API_KEY = process.env.API_KEY;
  const DEVICE_ID = process.env.DEVICE_ID;
  const TZ = process.env.TZ || 'America/New_York';

  if (!API_KEY || !DEVICE_ID) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing API_KEY or DEVICE_ID environment variables",
      }),
    };
  }

  return new Promise((resolve, reject) => {
    // Get current date in target timezone
    const now = new Date();
    const dateInTZ = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
    
    // Calculate 7am today
    let todayAt7AM = new Date(dateInTZ);
    todayAt7AM.setHours(7, 0, 0, 0);
    
    // If current time is before 7am, use yesterday's 7am
    if (dateInTZ.getHours() < 7) {
      todayAt7AM.setDate(todayAt7AM.getDate() - 1);
    }
    
    const timeStart = Math.floor(todayAt7AM.getTime() / 1000);
    const timeEnd = Math.floor(Date.now() / 1000);

    const url = `https://swd.weatherflow.com/swd/rest/observations/device/${DEVICE_ID}?time_start=${timeStart}&time_end=${timeEnd}&api_key=${API_KEY}`;

    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          if (!json.obs || json.obs.length === 0) {
            resolve({
              statusCode: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                error: "No observations found",
              }),
            });
            return;
          }

          // Get the most recent observation
          const latest = json.obs[json.obs.length - 1];
          
          // Calculate rainfall since 7am
          let rainfallSince7AM = 0;
          json.obs.forEach((obs) => {
            rainfallSince7AM += obs[12]; // rain_accumulation
          });

          const response = {
            temperature: latest[7], // air_temperature in °C
            windSpeed: latest[2], // wind_average in m/s
            windDirection: latest[4], // wind_direction in degrees
            rainfallToday: parseFloat((rainfallSince7AM / 25.4).toFixed(2)), // convert mm to inches
            rainfallTodayMM: parseFloat(rainfallSince7AM.toFixed(2)),
            timestamp: latest[0],
          };

          resolve({
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response),
          });
        } catch (error) {
          resolve({
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message }),
          });
        }
      });
    }).on("error", (error) => {
      resolve({
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.message }),
      });
    });
  });
};
