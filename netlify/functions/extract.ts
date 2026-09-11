import { executeExtraction, formatClientErrorMessage } from "../../src/server/core.ts";

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
    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error:
            "A variável GEMINI_API_KEY não foi configurada no Netlify. Para resolver: acesse o painel do seu site no Netlify em 'Site configuration' > 'Environment variables' e adicione a variável GEMINI_API_KEY com sua chave do Google AI Studio.",
        }),
      };
    }

    let body: any = {};
    if (event.body) {
      const rawText = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      body = JSON.parse(rawText);
    }

    const { fileData, mimeType, fileName, customInstructions, mesReferencia, anoReferencia, agentId } = body;

    if (!fileData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "fileData (base64) é obrigatório" }),
      };
    }

    const data = await executeExtraction({
      fileData,
      mimeType,
      fileName,
      customInstructions,
      mesReferencia,
      anoReferencia,
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
    console.error("Error in Netlify Function extract:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: formatClientErrorMessage(error),
      }),
    };
  }
};
