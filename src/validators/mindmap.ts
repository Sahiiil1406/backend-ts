import { z } from "zod";

export const createMindmapSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    url: z.string().url().optional(),
    course_id: z.string().uuid().optional(),
  }),
});

export const updateMindmapSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    url: z.string().url().optional(),
    course_id: z.string().uuid().optional(),
  }),
});

export const mindmapIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listMindmapsSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    course_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
  }),
});
