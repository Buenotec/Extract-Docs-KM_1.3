import { executeReExtraction, formatClientErrorMessage } from "../../src/server/core.ts";

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

    const { fileData, mimeType, fileName, currentData, userCorrection, agentId } = body;

    const data = await executeReExtraction({
      fileData,
      mimeType,
      fileName,
      currentData,
      userCorrection,
      agentId,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data,
      }),
    };
  } catch (error: any) {
    console.error("Error in Netlify Function re-extract:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: formatClientErrorMessage(error),
      }),
    };
  }
};
