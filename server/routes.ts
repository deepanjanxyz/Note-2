import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured. Please add it in Secrets." });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Summarize the following text concisely, capturing the key points in a clear and organized manner. Return only the summary, no extra commentary.\n\nText:\n${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.text();
        console.error("Gemini API error:", errData);
        return res.status(500).json({ error: "AI service error. Check your API key." });
      }

      const data = await response.json();
      const result =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate summary.";
      return res.json({ result });
    } catch (err) {
      console.error("Summarize error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ai/grammar", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY is not configured. Please add it in Secrets." });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Correct the grammar, spelling, and punctuation of the following text. Return ONLY the corrected text, preserving the original meaning and style. Do not add any explanations.\n\nText:\n${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000,
            },
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.text();
        console.error("Gemini API error:", errData);
        return res.status(500).json({ error: "AI service error. Check your API key." });
      }

      const data = await response.json();
      const result =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not correct grammar.";
      return res.json({ result });
    } catch (err) {
      console.error("Grammar error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
