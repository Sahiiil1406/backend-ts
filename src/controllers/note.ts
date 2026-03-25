import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { notes } from "../db/schema/note";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

export const createNote = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);

  const inserted = await db
    .insert(notes)
    .values({
      name: req.body.name,
      description: req.body.description,
      notes_url: req.body.notes_url,
      course_id: req.body.course_id,
      user_id: requester.user_id,
    })
    .returning();

  return res
    .status(201)
    .json(ApiResponse.success(inserted[0], "Note created", 201));
});

export const listNotes = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, course_id, user_id } = req.query;

  const whereClauses = [] as any[];

  if (requester.role === "admin") {
    if (user_id) {
      whereClauses.push(eq(notes.user_id, user_id as string));
    }
  } else {
    whereClauses.push(eq(notes.user_id, requester.user_id));
  }

  if (course_id) {
    whereClauses.push(eq(notes.course_id, course_id as string));
  }

  if (search) {
    whereClauses.push(ilike(notes.name, `%${search}%`));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(notes.notes_id, cursorValue));
  }

  const data = await db
    .select()
    .from(notes)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(notes.notes_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "notes_id");

  return res.status(200).json(ApiResponse.success(result, "Notes fetched"));
});

export const getNoteById = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(notes.notes_id, id)
      : and(eq(notes.notes_id, id), eq(notes.user_id, requester.user_id));

  const rows = await db.select().from(notes).where(whereClause).limit(1);

  if (!rows.length) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(ApiResponse.success(rows[0], "Note fetched"));
});

export const updateNote = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(notes.notes_id, id)
      : and(eq(notes.notes_id, id), eq(notes.user_id, requester.user_id));

  const updated = await db
    .update(notes)
    .set({
      name: req.body.name,
      description: req.body.description,
      notes_url: req.body.notes_url,
      course_id: req.body.course_id,
    })
    .where(whereClause)
    .returning();

  if (!updated.length) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(ApiResponse.success(updated[0], "Note updated"));
});

export const deleteNote = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(notes.notes_id, id)
      : and(eq(notes.notes_id, id), eq(notes.user_id, requester.user_id));

  const deleted = await db
    .delete(notes)
    .where(whereClause)
    .returning({ notes_id: notes.notes_id });

  if (!deleted.length) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(ApiResponse.success(null, "Note deleted"));
});
