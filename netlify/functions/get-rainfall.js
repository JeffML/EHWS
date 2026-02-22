const https = require("https");

exports.handler = async (event, context) => {
  // Get environment variables
  const API_KEY = process.env.API_KEY;
  const DEVICE_ID = process.env.DEVICE_ID;
  const TZ = process.env.TZ || "America/New_York";

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

  const now = new Date();
  const dateInTZ = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const baseDate = new Date(dateInTZ);
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: TZ,
  });

  if (dateInTZ.getHours() < 7) {
    baseDate.setDate(baseDate.getDate() - 1);
  }

  const getRainfallForRange = (startDate, endDate, cycleLabel) => {
    return new Promise((resolve, reject) => {
      const timeStart = Math.floor(startDate.getTime() / 1000);
      const timeEnd = Math.floor(endDate.getTime() / 1000);

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
                  cycleLabel,
                  date: endDate.toLocaleDateString(),
                  startTime: startDate.toLocaleString(),
                  endTime: endDate.toLocaleString(),
                  rainfallInches: 0,
                  rainfallMM: 0,
                });
                return;
              }

              let totalRainMM = 0;
              json.obs.forEach((obs) => {
                totalRainMM += obs[12];
              });

              const totalRainInches = totalRainMM / 25.4;

              resolve({
                cycleLabel,
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

  // Function to fetch rainfall for a specific day
  const getRainfallForDay = (daysAgo) => {
    // Calculate 7am dates
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() - daysAgo);
    endDate.setHours(7, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);

    const startWeekday = weekdayFormatter.format(startDate);
    const endWeekday = weekdayFormatter.format(endDate);

    return getRainfallForRange(
      startDate,
      endDate,
      `${startWeekday}-${endWeekday}`,
    );
  };

  try {
    // Fetch rainfall for all requested days
    const promises = [];
    for (let i = 0; i < days; i++) {
      promises.push(getRainfallForDay(i));
    }

    const results = await Promise.all(promises);

    if (dateInTZ.getHours() >= 7) {
      const currentStart = new Date(dateInTZ);
      currentStart.setHours(7, 0, 0, 0);

      const currentEnd = new Date(dateInTZ);

      const currentCycle = await getRainfallForRange(
        currentStart,
        currentEnd,
        "Current Cycle",
      );

      results.unshift(currentCycle);
    }

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
