import { env } from "../config/env";
import { ApiError } from "./ApiError";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// keep single instance (still worth it)
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: env.GEMINI_API_KEY,
});

export const getGeminiResponse = async (
  systemPrompt: string,
  question: string,
): Promise<string> => {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new ApiError(500, "Missing GEMINI_API_KEY");
    }

    if (!question?.trim()) {
      throw new ApiError(400, "Question cannot be empty");
    }

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ]);

    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  } catch (err: any) {
    throw new ApiError(
      err?.status || 500,
      err?.message || "Gemini request failed",
    );
  }
};
