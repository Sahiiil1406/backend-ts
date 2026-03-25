import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { mindmaps } from "../db/schema/mindmap";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

export const createMindmap = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);

  const inserted = await db
    .insert(mindmaps)
    .values({
      name: req.body.name,
      url: req.body.url,
      course_id: req.body.course_id,
      user_id: requester.user_id,
    })
    .returning();

  return res
    .status(201)
    .json(ApiResponse.success(inserted[0], "Mindmap created", 201));
});

export const listMindmaps = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, course_id, user_id } = req.query;

  const whereClauses = [] as any[];

  if (requester.role === "admin") {
    if (user_id) {
      whereClauses.push(eq(mindmaps.user_id, user_id as string));
    }
  } else {
    whereClauses.push(eq(mindmaps.user_id, requester.user_id));
  }

  if (course_id) {
    whereClauses.push(eq(mindmaps.course_id, course_id as string));
  }

  if (search) {
    whereClauses.push(ilike(mindmaps.name, `%${search}%`));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(mindmaps.mindmap_id, cursorValue));
  }

  const data = await db
    .select()
    .from(mindmaps)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(mindmaps.mindmap_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "mindmap_id");

  return res.status(200).json(ApiResponse.success(result, "Mindmaps fetched"));
});

export const getMindmapById = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(mindmaps.mindmap_id, id)
      : and(
          eq(mindmaps.mindmap_id, id),
          eq(mindmaps.user_id, requester.user_id),
        );

  const rows = await db.select().from(mindmaps).where(whereClause).limit(1);

  if (!rows.length) {
    throw new ApiError(404, "Mindmap not found");
  }

  return res.status(200).json(ApiResponse.success(rows[0], "Mindmap fetched"));
});

export const updateMindmap = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(mindmaps.mindmap_id, id)
      : and(
          eq(mindmaps.mindmap_id, id),
          eq(mindmaps.user_id, requester.user_id),
        );

  const updated = await db
    .update(mindmaps)
    .set({
      name: req.body.name,
      url: req.body.url,
      course_id: req.body.course_id,
    })
    .where(whereClause)
    .returning();

  if (!updated.length) {
    throw new ApiError(404, "Mindmap not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(updated[0], "Mindmap updated"));
});

export const deleteMindmap = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const whereClause =
    requester.role === "admin"
      ? eq(mindmaps.mindmap_id, id)
      : and(
          eq(mindmaps.mindmap_id, id),
          eq(mindmaps.user_id, requester.user_id),
        );

  const deleted = await db
    .delete(mindmaps)
    .where(whereClause)
    .returning({ mindmap_id: mindmaps.mindmap_id });

  if (!deleted.length) {
    throw new ApiError(404, "Mindmap not found");
  }

  return res.status(200).json(ApiResponse.success(null, "Mindmap deleted"));
});
