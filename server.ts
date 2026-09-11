import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  executeExtraction,
  executeReExtraction,
  executeDeepSeekAudit,
  formatClientErrorMessage,
} from "./src/server/core.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 PDFs and high-res images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    platform: "express-server",
    hasKey: !!process.env.GEMINI_API_KEY,
    hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API Extract Document
app.post("/api/extract", async (req, res) => {
  try {
    const { fileData, mimeType, fileName, customInstructions, mesReferencia, anoReferencia, agentId } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "fileData (base64) é obrigatório" });
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

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error in /api/extract:", error);
    res.status(500).json({
      error: formatClientErrorMessage(error),
    });
  }
});

// API Re-extract / Apply Correction
app.post("/api/re-extract", async (req, res) => {
  try {
    const { fileData, mimeType, fileName, currentData, userCorrection, agentId } = req.body;

    const data = await executeReExtraction({
      fileData,
      mimeType,
      fileName,
      currentData,
      userCorrection,
      agentId,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error in /api/re-extract:", error);
    res.status(500).json({
      error: formatClientErrorMessage(error),
    });
  }
});

// API Fleet & Odômetro Audit (DeepSeek / Reasoning Agent)
app.post("/api/audit-deepseek", async (req, res) => {
  try {
    const { registros, documento } = req.body;

    if (!registros || !Array.isArray(registros)) {
      return res.status(400).json({ error: "registros array is required" });
    }

    const report = await executeDeepSeekAudit({ registros, documento });

    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Error in /api/audit-deepseek:", error);
    res.status(500).json({ error: error.message || "Falha na auditoria de frota" });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Document Extraction Server running on http://localhost:${PORT}`);
  });
}

startServer();
