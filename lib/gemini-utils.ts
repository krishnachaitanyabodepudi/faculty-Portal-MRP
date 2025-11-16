// Gemini API utilities
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "models/gemini-2.0-flash";

// Call Gemini API with a prompt
export async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  stream: boolean = false
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  if (stream) {
    return await model.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }]
        }
      ]
    });
  } else {
    return await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }]
        }
      ]
    });
  }
}

// Get non-streaming response text
export async function getGeminiResponse(
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const result = await callGeminiAPI(apiKey, prompt, systemPrompt, false);
  return result.response.text();
}

