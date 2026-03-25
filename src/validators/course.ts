import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    desc: z.string().max(500).optional(),
    course_code: z.string().max(50).optional(),
    college_id: z.string().uuid().optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    desc: z.string().max(500).optional(),
    course_code: z.string().max(50).optional(),
    college_id: z.string().uuid().optional(),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listCoursesSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    college_id: z.string().uuid().optional(),
    course_code: z.string().max(50).optional(),
  }),
});
