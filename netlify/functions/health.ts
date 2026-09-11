export const handler = async (event: any) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "ok",
      platform: "netlify-functions",
      hasKey: !!process.env.GEMINI_API_KEY,
      hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
      timestamp: new Date().toISOString(),
    }),
  };
};
