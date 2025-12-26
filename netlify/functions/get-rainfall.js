const https = require("https");

exports.handler = async (event, context) => {
  // Get environment variables
  const API_KEY = process.env.API_KEY;
  const DEVICE_ID = process.env.DEVICE_ID;
  const TZ = process.env.TZ || 'America/New_York';

  console.log("Environment check:", {
    hasApiKey: !!API_KEY,
    hasDeviceId: !!DEVICE_ID,
    timezone: TZ,
  });

  if (!API_KEY || !DEVICE_ID) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing API_KEY or DEVICE_ID environment variables",
        hasApiKey: !!API_KEY,
        hasDeviceId: !!DEVICE_ID,
      }),
    };
  }

  // Get number of days from query parameter (default 7)
  const days = parseInt(event.queryStringParameters?.days || "7");

  // Function to fetch rainfall for a specific day
  const getRainfallForDay = (daysAgo) => {
    return new Promise((resolve, reject) => {
      const now = new Date();
      
      // Get the current date in the target timezone
      const dateInTZ = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
      
      // Calculate 7am dates
      const endDate = new Date(dateInTZ);
      endDate.setDate(endDate.getDate() - daysAgo);
      endDate.setHours(7, 0, 0, 0);
      
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 1);
      
      const timeStart = Math.floor(startDate.getTime() / 1000);
      const timeEnd = Math.floor(endDate.getTime() / 1000);

      console.log(`Day ${daysAgo}: ${startDate.toISOString()} to ${endDate.toISOString()} (timestamps: ${timeStart} to ${timeEnd})`);

      const url = `https://swd.weatherflow.com/swd/rest/observations/device/${DEVICE_ID}?time_start=${timeStart}&time_end=${timeEnd}&api_key=${API_KEY}`;

      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const json = JSON.parse(data);

              console.log(`Day ${daysAgo} response:`, {
                hasObs: !!json.obs,
                obsCount: json.obs?.length || 0,
                status: json.status
              });

              if (!json.obs || json.obs.length === 0) {
                resolve({
                  date: endDate.toLocaleDateString(),
                  startTime: startDate.toLocaleString(),
                  endTime: endDate.toLocaleString(),
                  rainfallInches: 0,
                  rainfallMM: 0,
                });
                return;
              }

              // Calculate total rainfall (index 12 is rain_accumulation in mm)
              let totalRainMM = 0;
              json.obs.forEach((obs) => {
                totalRainMM += obs[12];
              });

              const totalRainInches = totalRainMM / 25.4;

              console.log(`Day ${daysAgo}: Found ${json.obs.length} observations, total rain: ${totalRainMM}mm (${totalRainInches.toFixed(2)} inches)`);

              resolve({
                date: endDate.toLocaleDateString(),
                startTime: startDate.toLocaleString(),
                endTime: endDate.toLocaleString(),
                rainfallInches: parseFloat(totalRainInches.toFixed(2)),
                rainfallMM: parseFloat(totalRainMM.toFixed(2)),
              });
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  try {
    // Fetch rainfall for all requested days
    const promises = [];
    for (let i = 0; i < days; i++) {
      promises.push(getRainfallForDay(i));
    }

    const results = await Promise.all(promises);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        currentTime: new Date().toLocaleString(),
        days: results,
      }),
    };
  } catch (error) {
    console.error("Error fetching rainfall:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
