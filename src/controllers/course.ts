import { and, asc, eq, gt, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { courses } from "../db/schema/course";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";

export const createCourse = controllerWrapper(async (req, res) => {
  const inserted = await db.insert(courses).values(req.body).returning();

  return res
    .status(201)
    .json(ApiResponse.success(inserted[0], "Course created", 201));
});

export const listCourses = controllerWrapper(async (req, res) => {
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, college_id, course_code } = req.query;

  const whereClauses = [] as any[];

  if (search) {
    whereClauses.push(
      or(
        ilike(courses.name, `%${search}%`),
        ilike(courses.desc, `%${search}%`),
      ),
    );
  }

  if (college_id) {
    whereClauses.push(eq(courses.college_id, college_id as string));
  }

  if (course_code) {
    whereClauses.push(eq(courses.course_code, course_code as string));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(courses.course_id, cursorValue));
  }

  const data = await db
    .select()
    .from(courses)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(courses.course_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "course_id");

  return res.status(200).json(ApiResponse.success(result, "Courses fetched"));
});

export const getCourseById = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.course_id, id))
    .limit(1);

  if (!rows.length) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(ApiResponse.success(rows[0], "Course fetched"));
});

export const updateCourse = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const updated = await db
    .update(courses)
    .set(req.body)
    .where(eq(courses.course_id, id))
    .returning();

  if (!updated.length) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(updated[0], "Course updated"));
});

export const deleteCourse = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  const deleted = await db
    .delete(courses)
    .where(eq(courses.course_id, id))
    .returning({ course_id: courses.course_id });

  if (!deleted.length) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(ApiResponse.success(null, "Course deleted"));
});
