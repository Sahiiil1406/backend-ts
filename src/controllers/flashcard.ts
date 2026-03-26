import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { flashcards } from "../db/schema/flashcard";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

export const createFlashcard = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);

  const inserted = await db
    .insert(flashcards)
    .values({
      question: req.body.question,
      answer: req.body.answer,
      user_id: requester.user_id,
    })
    .returning();

  return res
    .status(201)
    .json(ApiResponse.success(inserted[0], "Flashcard created", 201));
});

export const listFlashcards = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, user_id } = req.query;

  const whereClauses = [] as any[];

  if (requester.role === "admin") {
    if (user_id) {
      whereClauses.push(eq(flashcards.user_id, user_id as string));
    }
  } else {
    whereClauses.push(eq(flashcards.user_id, requester.user_id));
  }

  if (search) {
    whereClauses.push(ilike(flashcards.question, `%${search}%`));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(flashcards.flash_id, cursorValue));
  }

  const data = await db
    .select()
    .from(flashcards)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(flashcards.flash_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "flash_id");

  return res
    .status(200)
    .json(ApiResponse.success(result, "Flashcards fetched"));
});

export const getFlashcardById = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(flashcards.flash_id, id)
      : and(
          eq(flashcards.flash_id, id),
          eq(flashcards.user_id, requester.user_id),
        );

  const rows = await db.select().from(flashcards).where(whereClause).limit(1);

  if (!rows.length) {
    throw new ApiError(404, "Flashcard not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(rows[0], "Flashcard fetched"));
});

export const updateFlashcard = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(flashcards.flash_id, id)
      : and(
          eq(flashcards.flash_id, id),
          eq(flashcards.user_id, requester.user_id),
        );

  const updated = await db
    .update(flashcards)
    .set({ question: req.body.question, answer: req.body.answer })
    .where(whereClause)
    .returning();

  if (!updated.length) {
    throw new ApiError(404, "Flashcard not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(updated[0], "Flashcard updated"));
});

export const deleteFlashcard = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(flashcards.flash_id, id)
      : and(
          eq(flashcards.flash_id, id),
          eq(flashcards.user_id, requester.user_id),
        );

  const deleted = await db
    .delete(flashcards)
    .where(whereClause)
    .returning({ flash_id: flashcards.flash_id });

  if (!deleted.length) {
    throw new ApiError(404, "Flashcard not found");
  }

  return res.status(200).json(ApiResponse.success(null, "Flashcard deleted"));
});
