import { z } from "zod";

export const generateFlashCardSchema = z.object({
  body: z.object({
    question: z.string().min(1, "Question cannot be empty"),
  }),
});

export const generateMindMapSchema = z.object({
  body: z.object({
    topic: z.string().min(1, "Topic cannot be empty"),
    depth: z.number().int().min(1).max(5).optional().default(3),
  }),
});

export const generateNotesSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    content: z.string().min(1, "Content cannot be empty"),
    course_id: z.string().uuid().optional(),
  }),
});

export const generateCoursePlanDetailsSchema = z.object({
  body: z.object({
    coursePlanData: z.record(z.string(), z.any()),
  }),
});
