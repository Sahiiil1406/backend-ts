import { and, asc, desc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import { notes } from "../db/schema/note";
import { flashcards } from "../db/schema/flashcard";
import { mindmaps } from "../db/schema/mindmap";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";
import {
  getGeminiResponseStream,
  getGeminiResponse,
} from "../utils/langchainGemini";

const generateFlashCardWithAI = controllerWrapper(async (req, res) => {
  const { question } = req.body;
  const requester = getRequester(req);

  const systemPrompt = `You are an assistant that generates flashcards
   based on a question. Provide a concise question and answer pair.Give response in 
   JSON format with "question" and "answer" fields.There should be exactly 6 flashcards in the response.`;

  const aiResponse = await getGeminiResponse(systemPrompt, question);
  // Validate AI response format
  let flashcardsData: Array<{ question: string; answer: string }>;
  try {
    //remove ````json` and ``` from response if present
    const cleanedResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    flashcardsData = JSON.parse(cleanedResponse);
  } catch (error) {
    throw new ApiError(500, "Invalid AI response format");
  }
  //save flashcards to db
  const flashcardInserts = flashcardsData.map((item) => {
    return {
      flashcard_id: crypto.randomUUID(),
      user_id: requester.user_id,
      question: item.question,
      answer: item.answer,
    };
  });

  await db.insert(flashcards).values(flashcardInserts);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Flashcards generated successfully",
        flashcardInserts,
      ),
    );
});
const generateMindMapWithAI = controllerWrapper(async (req, res) => {});
const generateNotesWithAI = controllerWrapper(async (req, res) => {});
const generateDetailedFromCoursePlandocs = controllerWrapper(
  async (req, res) => {},
);

export const aiControllers = {
  generateFlashCardWithAI,
  generateMindMapWithAI,
  generateNotesWithAI,
  generateDetailedFromCoursePlandocs,
};
