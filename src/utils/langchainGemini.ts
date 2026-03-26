import { env } from "../config/env";
import { ApiError } from "./ApiError";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// keep single instance (still worth it)
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: env.GEMINI_API_KEY,
});

const normalizeChunkText = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }

        return "";
      })
      .join("");
  }

  if (
    content &&
    typeof content === "object" &&
    "text" in content &&
    typeof (content as { text?: unknown }).text === "string"
  ) {
    return (content as { text: string }).text;
  }

  return "";
};

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

export const getGeminiResponseStream = async function* (
  systemPrompt: string,
  question: string,
): AsyncGenerator<string> {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new ApiError(500, "Missing GEMINI_API_KEY");
    }

    if (!question?.trim()) {
      throw new ApiError(400, "Question cannot be empty");
    }

    const stream = await model.stream([
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ]);

    for await (const chunk of stream) {
      const text = normalizeChunkText(chunk.content);
      if (text) {
        yield text;
      }
    }
  } catch (err: any) {
    throw new ApiError(
      err?.status || 500,
      err?.message || "Gemini streaming request failed",
    );
  }
};
