import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const apiKey = process.env.GEMINI_API_KEY || "";

const promptSchema = z.object({
  stack: z.array(z.string()).default([]),
  experienceLevel: z.string().nullable().default(null),
  companyType: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  role: z.string().nullable().default(null)
});

const jobSchema = z.object({
  stack: z.array(z.string()).default([]),
  experienceLevel: z.string().nullable().default(null),
  role: z.string().nullable().default(null)
});

const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function parsePromptWithGemini(prompt) {
  if (!aiClient) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const response = await aiClient.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(promptSchema)
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = promptSchema.parse(JSON.parse(text));
  return parsed;
}

export async function classifyJobWithGemini(text) {
  if (!aiClient) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const response = await aiClient.models.generateContent({
    model: modelName,
    contents: text,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(jobSchema)
    }
  });

  const parsed = jobSchema.parse(JSON.parse(response.text || "{}"));
  return parsed;
}
