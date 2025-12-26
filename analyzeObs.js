const fs = require("fs");

// Read the JSON file
const data = JSON.parse(
  fs.readFileSync("deviceTimeRangeResponse.json", "utf8")
);

console.log("=== OBSERVATION SUMMARY ===\n");
console.log(`Total observations: ${data.obs.length}`);
console.log(`Reporting interval: ${data.bucket_step_minutes} minute(s)\n`);

// Time range
const first = data.obs[0][0];
const last = data.obs[data.obs.length - 1][0];
console.log(`Time Range:`);
console.log(`  Start: ${new Date(first * 1000).toISOString()} (${first})`);
console.log(`  End:   ${new Date(last * 1000).toISOString()} (${last})`);
console.log(`  Duration: ${((last - first) / 3600).toFixed(2)} hours\n`);

// Calculate statistics
let temps = [],
  pressures = [],
  humidities = [],
  winds = [],
  rain = 0;
let maxTemp = -Infinity,
  minTemp = Infinity;
let maxWind = 0;

data.obs.forEach((obs) => {
  const temp = obs[7];
  const pressure = obs[6];
  const humidity = obs[8];
  const windAvg = obs[2];
  const windGust = obs[3];
  const rainAccum = obs[12];

  temps.push(temp);
  pressures.push(pressure);
  humidities.push(humidity);
  winds.push(windAvg);

  if (temp > maxTemp) maxTemp = temp;
  if (temp < minTemp) minTemp = temp;
  if (windGust > maxWind) maxWind = windGust;
  rain += rainAccum;
});

const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

console.log("=== WEATHER CONDITIONS ===\n");
console.log(`Temperature (°C):`);
console.log(`  Min: ${minTemp.toFixed(1)}`);
console.log(`  Max: ${maxTemp.toFixed(1)}`);
console.log(`  Avg: ${avg(temps).toFixed(1)}\n`);

console.log(`Pressure (mb):`);
console.log(`  Min: ${Math.min(...pressures).toFixed(1)}`);
console.log(`  Max: ${Math.max(...pressures).toFixed(1)}`);
console.log(`  Avg: ${avg(pressures).toFixed(1)}\n`);

console.log(`Humidity (%):`);
console.log(`  Min: ${Math.min(...humidities)}`);
console.log(`  Max: ${Math.max(...humidities)}`);
console.log(`  Avg: ${avg(humidities).toFixed(1)}\n`);

console.log(`Wind:`);
console.log(`  Max gust: ${maxWind.toFixed(1)} m/s`);
console.log(`  Avg speed: ${avg(winds).toFixed(1)} m/s\n`);

console.log(`Rain accumulation: ${rain.toFixed(2)} mm\n`);

// Show a few sample observations
console.log("=== SAMPLE OBSERVATIONS (first 3) ===\n");
for (let i = 0; i < Math.min(3, data.obs.length); i++) {
  const obs = data.obs[i];
  console.log(`[${i + 1}] ${new Date(obs[0] * 1000).toISOString()}`);
  console.log(
    `    Temp: ${obs[7]}°C, Humidity: ${obs[8]}%, Pressure: ${obs[6]}mb`
  );
  console.log(`    Wind: ${obs[2]} m/s (avg), ${obs[3]} m/s (gust)`);
  console.log(`    Illuminance: ${obs[9]} lux, Rain: ${obs[12]} mm`);
  console.log();
}
