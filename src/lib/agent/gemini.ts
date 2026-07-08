import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export interface GeminiJsonResult<T> {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Run a prompt expecting a JSON response conforming to `responseSchema`
 * (Gemini structured-output schema, not JSON Schema proper).
 */
export async function generateJson<T>(
  prompt: string,
  responseSchema: object,
  options?: { temperature?: number },
): Promise<GeminiJsonResult<T>> {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: options?.temperature ?? 0.4,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned an empty response");

  return {
    data: JSON.parse(text) as T,
    model: GEMINI_MODEL,
    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
  };
}
