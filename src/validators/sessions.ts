import { z } from "zod";

export const askAIWithContextSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid().optional(),
    question: z.string().min(1),
  }),
});

export const sessionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
    user_id: z.string().uuid().optional(),
  }),
});

export const getLastSessionSchema = z.object({
  query: z.object({
    user_id: z.string().uuid().optional(),
  }),
});
