const https = require("https");

// Calculate 7am yesterday and 7am today in local time
const now = new Date();
const yesterdayAt7AM = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() - 1,
  7,
  0,
  0,
  0
);

const todayAt7AM = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  7,
  0,
  0,
  0
);

const timeStart = Math.floor(yesterdayAt7AM.getTime() / 1000);
const timeEnd = Math.floor(todayAt7AM.getTime() / 1000);

const url = `https://swd.weatherflow.com/swd/rest/observations/device/470287?time_start=${timeStart}&time_end=${timeEnd}&api_key=1d0f5d0f-4b66-4f8f-b454-99a57ffe0831`;

console.log("Fetching observations...\n");

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
          console.log("No observations found");
          return;
        }

        // Get first and last observation timestamps
        const firstTimestamp = json.obs[0][0];
        const lastTimestamp = json.obs[json.obs.length - 1][0];

        // Convert to Date objects
        const firstDate = new Date(firstTimestamp * 1000);
        const lastDate = new Date(lastTimestamp * 1000);

        console.log("First observation:", firstDate.toLocaleString());
        console.log("Last observation:", lastDate.toLocaleString());
        console.log();

        // Calculate total rainfall (index 12 is rain_accumulation in mm)
        let totalRainMM = 0;
        json.obs.forEach((obs) => {
          totalRainMM += obs[12];
        });

        // Convert mm to inches
        const totalRainInches = totalRainMM / 25.4;

        console.log(
          `Total rainfall: ${totalRainInches.toFixed(
            2
          )} inches (${totalRainMM.toFixed(2)} mm)`
        );
      } catch (error) {
        console.error("Error parsing response:", error.message);
      }
    });
  })
  .on("error", (error) => {
    console.error("Error fetching data:", error.message);
  });
