import OpenAI from "openai";

let client: OpenAI | null = null;
let attempted = false;

/**
 * Returns null when OPENAI_API_KEY is unset so every AI feature has a
 * deterministic demo-mode fallback instead of crashing without a key.
 */
export function getOpenAIClient(): OpenAI | null {
  if (attempted) return client;
  attempted = true;
  if (!process.env.OPENAI_API_KEY) return null;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
