exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Function is working",
      hasApiKey: !!process.env.API_KEY,
      hasDeviceId: !!process.env.DEVICE_ID,
      envVars: Object.keys(process.env).filter(
        (k) => k.includes("API") || k.includes("DEVICE")
      ),
    }),
  };
};
