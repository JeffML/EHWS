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
   - `API_KEY`: Your Tempest API key
   - `DEVICE_ID`: Your Tempest device ID

### 3. Deploy

Once environment variables are set, trigger a new deploy or wait for the automatic deployment to complete.

## Local Testing

To test locally with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create a .env file with your variables
echo "API_KEY=your_key_here" > .env
echo "DEVICE_ID=your_device_id" >> .env

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
- `.env.example` - Example environment variables

## API

The serverless function is accessible at:

```
/.netlify/functions/get-rainfall?days=7
```

Returns JSON with current time and precipitation data for each day.
