import { executeDeepSeekAudit } from "../../src/server/core.ts";

export const handler = async (event: any) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido. Utilize POST." }),
    };
  }

  try {
    let body: any = {};
    if (event.body) {
      const rawText = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      body = JSON.parse(rawText);
    }

    const { registros, documento } = body;

    const report = await executeDeepSeekAudit({ registros, documento });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        report,
      }),
    };
  } catch (error: any) {
    console.error("Error in Netlify Function audit-deepseek:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error?.message || "Falha ao processar auditoria",
      }),
    };
  }
};
