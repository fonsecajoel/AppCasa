import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeNumber(input: unknown): string {
  if (typeof input === "number") return String(input);
  if (typeof input !== "string") return "0";
  return input.replace(/[^\d.,]/g, "").slice(0, 20);
}

function sanitizeArray(input: unknown, maxItems = 50): unknown[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, maxItems);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text || "";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP disabled: Vite dev server injects inline scripts
    })
  );

  app.use(
    cors({
      origin: process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    })
  );

  app.use(express.json({ limit: "1mb" }));

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados pedidos. Tente novamente em breve." },
  });
  app.use("/api/", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-ad", async (req, res) => {
    try {
      const { property } = req.body;
      if (!property || typeof property !== "object") {
        return res.status(400).json({ error: "Dados do imóvel em falta." });
      }

      const name = sanitizeText(property.name, 200);
      const type = sanitizeText(property.type, 100);
      const address = sanitizeText(property.address, 300);
      const area = sanitizeNumber(property.area);
      const rentAmount = sanitizeNumber(property.rentAmount);

      const prompt = `Gera um anúncio de arrendamento atrativo para o seguinte imóvel:
Nome: ${name}
Tipo: ${type}
Localização: ${address}
Área: ${area}m2
Renda: ${rentAmount}€

Foca na tipologia, área e localização. O tom deve ser profissional e apelativo.`;

      const text = await callGemini(prompt);
      res.json({ text });
    } catch (error) {
      console.error("generate-ad error:", error);
      res.status(500).json({ error: "Erro ao gerar anúncio." });
    }
  });

  app.post("/api/generate-report", async (req, res) => {
    try {
      const { properties, payments, expenses } = req.body;

      const safeProps = sanitizeArray(properties, 50).map((p: any) => ({
        name: sanitizeText(p?.name, 200),
        type: sanitizeText(p?.type, 100),
        rentAmount: sanitizeNumber(p?.rentAmount),
      }));
      const safePays = sanitizeArray(payments, 200).map((p: any) => ({
        amount: sanitizeNumber(p?.amount),
        date: sanitizeText(p?.date, 20),
        status: sanitizeText(p?.status, 50),
      }));
      const safeExps = sanitizeArray(expenses, 200).map((e: any) => ({
        description: sanitizeText(e?.description, 200),
        amount: sanitizeNumber(e?.amount),
        date: sanitizeText(e?.date, 20),
      }));

      const prompt = `Gera um relatório mensal para o proprietário com base nos seguintes dados:
Imóveis: ${JSON.stringify(safeProps)}
Pagamentos: ${JSON.stringify(safePays)}
Despesas: ${JSON.stringify(safeExps)}

O relatório deve incluir um resumo de rendimentos, despesas liquidadas e alertas de incumprimento.
Usa o Euro (€) como moeda e o formato de data DD/MM/AAAA.`;

      const text = await callGemini(prompt);
      res.json({ text });
    } catch (error) {
      console.error("generate-report error:", error);
      res.status(500).json({ error: "Erro ao gerar relatório." });
    }
  });

  app.post("/api/generate-notice", async (req, res) => {
    try {
      const { tenant, payment } = req.body;
      if (!tenant || !payment) {
        return res.status(400).json({ error: "Dados em falta." });
      }

      const tenantName = sanitizeText(tenant.name, 200);
      const amount = sanitizeNumber(payment.amount);
      const date = sanitizeText(payment.date, 20);

      const prompt = `Gera uma notificação de cobrança profissional e cordial para o inquilino ${tenantName} com a renda de ${amount}€ em atraso desde ${date}.`;

      const text = await callGemini(prompt);
      res.json({ text });
    } catch (error) {
      console.error("generate-notice error:", error);
      res.status(500).json({ error: "Erro ao gerar notificação." });
    }
  });

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
