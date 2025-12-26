const https = require("https");

exports.handler = async (event, context) => {
  // Get environment variables
  const API_KEY = process.env.API_KEY;
  const DEVICE_ID = process.env.DEVICE_ID;

  console.log("Environment check:", {
    hasApiKey: !!API_KEY,
    hasDeviceId: !!DEVICE_ID,
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

      // Calculate 7am for the day (daysAgo + 1) to 7am for the day (daysAgo)
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo - 1,
        7,
        0,
        0,
        0
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo,
        7,
        0,
        0,
        0
      );

      const timeStart = Math.floor(startDate.getTime() / 1000);
      const timeEnd = Math.floor(endDate.getTime() / 1000);

      console.log(`Day ${daysAgo}: ${startDate.toISOString()} to ${endDate.toISOString()}`);

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
