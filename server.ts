import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      app: "SmartCart POS Server",
      timestamp: new Date().toISOString()
    });
  });

  // API Endpoint for Sync diagnostics / proxy test
  app.post("/api/sync/test", (req, res) => {
    const { itemsCount } = req.body;
    res.json({
      success: true,
      message: `Received ${itemsCount || 0} queued sync items`,
      syncedAt: new Date().toISOString()
    });
  });

  // AI-driven Sales & Inventory Forecasting API Endpoint
  app.post("/api/ai/forecast", async (req, res) => {
    try {
      const { timeframeDays = 7, products = [], transactions = [] } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "GEMINI_API_KEY environment variable is not set.",
          message: "Please configure your GEMINI_API_KEY in Settings."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      // Prepare concise prompt payloads
      const productSummary = (products || []).slice(0, 40).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stock_quantity: p.stock_quantity,
        low_stock_threshold: p.low_stock_threshold,
        price: p.price,
        unit_type: p.unit_type
      }));

      const txSummary = (transactions || []).slice(0, 50).map((t: any) => ({
        created_at: t.created_at,
        total: t.total,
        payment_method: t.payment_method,
        items: (t.items || []).map((i: any) => ({ name: i.name, qty: i.quantity, price: i.price }))
      }));

      const prompt = `You are a Senior Retail Inventory Optimization & Sales Forecasting AI for a grocery store / mini-mart.
Analyze the store's historical POS sales transactions and current inventory levels to project future inventory needs and peak sales periods over the next ${timeframeDays} days.

Current Inventory Products (${productSummary.length} items):
${JSON.stringify(productSummary, null, 2)}

Historical Transaction Logs (${txSummary.length} orders):
${JSON.stringify(txSummary, null, 2)}

Requirements:
1. Predict peak sales days and time windows (rush hours, key shopping days) with customer behavior explanations.
2. Identify specific products at risk of running out of stock based on estimated daily velocity, calculate days remaining, and prescribe concrete reorder quantities and urgency level ('high', 'medium', or 'low').
3. Identify category trends (percentage changes and strategic growth insights).
4. Provide a clear, actionable executive summary briefing for the store manager.

Return JSON strictly adhering to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              forecastPeriod: { type: Type.STRING },
              overallForecastSummary: { type: Type.STRING },
              predictedPeakPeriods: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.STRING },
                    expectedVolume: { type: Type.STRING },
                    peakHours: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["period", "expectedVolume", "peakHours", "reason"]
                }
              },
              inventoryReorders: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    currentStock: { type: Type.NUMBER },
                    predictedDailyVelocity: { type: Type.NUMBER },
                    daysRemaining: { type: Type.NUMBER },
                    recommendedReorderQty: { type: Type.NUMBER },
                    urgency: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["productId", "productName", "currentStock", "predictedDailyVelocity", "daysRemaining", "recommendedReorderQty", "urgency", "explanation"]
                }
              },
              categoryTrends: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    trend: { type: Type.STRING },
                    percentageChange: { type: Type.STRING },
                    insight: { type: Type.STRING }
                  },
                  required: ["category", "trend", "percentageChange", "insight"]
                }
              }
            },
            required: ["forecastPeriod", "overallForecastSummary", "predictedPeakPeriods", "inventoryReorders", "categoryTrends"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const forecastData = JSON.parse(jsonText);

      res.json({
        success: true,
        forecast: forecastData,
        generatedAt: new Date().toISOString()
      });

    } catch (err: any) {
      console.error("AI Forecasting Endpoint Error:", err);
      res.status(500).json({
        error: "Failed to generate AI sales forecast",
        details: err?.message || String(err)
      });
    }
  });

  // Vite middleware for dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCart POS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
