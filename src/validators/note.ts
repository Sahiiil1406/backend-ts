import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    notes_url: z.string().url().optional(),
    course_id: z.string().uuid().optional(),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    notes_url: z.string().url().optional(),
    course_id: z.string().uuid().optional(),
  }),
});

export const noteIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listNotesSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    course_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
  }),
});
