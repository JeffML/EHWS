const fs = require("fs");

// Read the JSON file
const data = JSON.parse(
  fs.readFileSync("deviceTimeRangeResponse.json", "utf8")
);

// Field definitions for obs_st (Tempest Observation)
const fieldMapping = [
  { name: "timestamp", unit: "Epoch (seconds, UTC)" },
  { name: "wind_lull", unit: "m/s" },
  { name: "wind_average", unit: "m/s" },
  { name: "wind_gust", unit: "m/s" },
  { name: "wind_direction", unit: "degrees" },
  { name: "wind_sample_interval", unit: "seconds" },
  { name: "pressure", unit: "mb" },
  { name: "air_temperature", unit: "°C" },
  { name: "relative_humidity", unit: "%" },
  { name: "illuminance", unit: "lux" },
  { name: "uv", unit: "index" },
  { name: "solar_radiation", unit: "W/m²" },
  { name: "rain_accumulation", unit: "mm" },
  { name: "precipitation_type", unit: "0=none, 1=rain, 2=hail, 3=rain+hail" },
  { name: "lightning_average_distance", unit: "km" },
  { name: "lightning_strike_count", unit: "count" },
  { name: "battery", unit: "volts" },
  { name: "reporting_interval", unit: "minutes" },
  { name: "local_day_rain_accumulation", unit: "mm" },
  { name: "nearcast_rain_accumulation", unit: "mm" },
  { name: "local_day_nearcast_rain_accumulation", unit: "mm" },
  {
    name: "precipitation_analysis_type",
    unit: "0=none, 1=Nearcast on, 2=Nearcast off",
  },
];

// Convert each observation array to an object
const convertedObservations = data.obs.map((obsArray) => {
  const observation = {};
  obsArray.forEach((value, index) => {
    if (fieldMapping[index]) {
      observation[fieldMapping[index].name] = value;
    }
  });
  return observation;
});

// Create output object
const output = {
  status: data.status,
  device_id: data.device_id,
  type: data.type,
  bucket_step_minutes: data.bucket_step_minutes,
  observations: convertedObservations,
};

// Print formatted JSON
console.log(JSON.stringify(output, null, 2));
