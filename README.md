# Elderly Hillberry Weather Station

A Netlify-hosted website displaying 7-day precipitation data from a Tempest weather station.

## Setup Instructions

### 1. Deploy to Netlify

1. Push this repository to GitHub
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub repository
5. Netlify will auto-detect the configuration from `netlify.toml`

### 2. Configure Environment Variables

In your Netlify site dashboard:

1. Go to **Site settings** > **Environment variables**
2. Add the following variables:
   - `API_KEY`: Your Tempest API key (Personal Access Token)
   - `DEVICE_ID`: Your Tempest device ID (e.g., `470287`)
   - `TZ`: Your timezone (e.g., `America/Los_Angeles`, `America/New_York`, `America/Chicago`)

### 3. Deploy

Once environment variables are set, trigger a new deploy or wait for the automatic deployment to complete.

## Local Testing

To test locally with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create a .env file with your variables
echo "API_KEY=your_api_key_here" > .env
echo "DEVICE_ID=your_device_id" >> .env
echo "TZ=America/Los_Angeles" >> .env

# Run locally
netlify dev
```

## Features

- Displays current local time (updates every second)
- Shows precipitation accumulation for the last 7 days
- Each day shows 7am-7am rainfall totals in inches and mm
- Beautiful gradient design with hover effects
- Mobile responsive

## Files

- `index.html` - Main web page
- `netlify/functions/get-rainfall.js` - Serverless function to fetch weather data
- `netlify.toml` - Netlify configuration
- `copilot-instructions.md` - API reference URLs

## How It Works

The site fetches weather data from the Tempest API using 7am-7am time periods in your local timezone. The serverless function:

1. Converts current time to your timezone (set via `TZ` env var)
2. Calculates 7am yesterday to 7am today for each of the last 7 days
3. Fetches observations from the device API endpoint
4. Sums up rainfall accumulation (index 12 in obs array) for each period
5. Returns formatted data with timestamps and rainfall in both mm and inches

## API

The serverless function is accessible at:

```
/.netlify/functions/get-rainfall?days=7
```

Returns JSON with current time and precipitation data for each day.
