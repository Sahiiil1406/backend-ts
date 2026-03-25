import { and, asc, eq, gt, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { colleges } from "../db/schema/college";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

export const createCollege = controllerWrapper(async (req, res) => {
  const inserted = await db.insert(colleges).values(req.body).returning();

  return res
    .status(201)
    .json(ApiResponse.success(inserted[0], "College created", 201));
});

export const listColleges = controllerWrapper(async (req, res) => {
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, category } = req.query;

  const whereClauses = [] as any[];

  if (search) {
    whereClauses.push(
      or(
        ilike(colleges.name, `%${search}%`),
        ilike(colleges.address, `%${search}%`),
      ),
    );
  }

  if (category) {
    whereClauses.push(eq(colleges.category, category as string));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(colleges.college_id, cursorValue));
  }

  const data = await db
    .select()
    .from(colleges)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(colleges.college_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "college_id");

  return res.status(200).json(ApiResponse.success(result, "Colleges fetched"));
});

export const getCollegeById = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const rows = await db
    .select()
    .from(colleges)
    .where(eq(colleges.college_id, id))
    .limit(1);

  if (!rows.length) {
    throw new ApiError(404, "College not found");
  }

  return res.status(200).json(ApiResponse.success(rows[0], "College fetched"));
});

export const updateCollege = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const updated = await db
    .update(colleges)
    .set(req.body)
    .where(eq(colleges.college_id, id))
    .returning();

  if (!updated.length) {
    throw new ApiError(404, "College not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(updated[0], "College updated"));
});

export const deleteCollege = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const deleted = await db
    .delete(colleges)
    .where(eq(colleges.college_id, id))
    .returning({ college_id: colleges.college_id });

  if (!deleted.length) {
    throw new ApiError(404, "College not found");
  }

  return res.status(200).json(ApiResponse.success(null, "College deleted"));
});
