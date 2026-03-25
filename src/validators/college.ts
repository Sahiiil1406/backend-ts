import { z } from "zod";

export const createCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    address: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
  }),
});

export const updateCollegeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    address: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
  }),
});

export const collegeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listCollegesSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    category: z.string().max(100).optional(),
  }),
});
