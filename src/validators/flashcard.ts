import { z } from "zod";

export const createFlashcardSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
  }),
});

export const updateFlashcardSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
  }),
});

export const flashcardIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listFlashcardsSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    user_id: z.string().uuid().optional(),
  }),
});
