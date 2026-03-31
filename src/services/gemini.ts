import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const ECONOMIC_GROWTH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief executive summary of the economic outlook.",
    },
    gdpGrowth: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          value: { type: Type.NUMBER, description: "Percentage growth rate" },
        },
        required: ["year", "value"],
      },
    },
    inflation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          value: { type: Type.NUMBER, description: "Percentage inflation rate" },
        },
        required: ["year", "value"],
      },
    },
    sectoralGrowth: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sector: { type: Type.STRING },
          contribution: { type: Type.NUMBER, description: "Percentage of total GDP" },
        },
        required: ["sector", "contribution"],
      },
    },
    keyDrivers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          factor: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          description: { type: Type.STRING },
        },
        required: ["factor", "impact", "description"],
      },
    },
  },
  required: ["summary", "gdpGrowth", "inflation", "sectoralGrowth", "keyDrivers"],
};

export async function predictGrowth(prompt: string) {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: ECONOMIC_GROWTH_SCHEMA,
      systemInstruction: "You are an expert economist specializing in emerging markets, specifically India. Provide realistic, data-backed predictions for the near future (next 5 years). Ensure the output is strictly valid JSON matching the provided schema.",
    },
  });

  return JSON.parse(response.text);
}
