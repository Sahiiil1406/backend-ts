import { z } from "zod";

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    email: z.string().email(),
    password: z.string().min(8).max(255).optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    college_id: z.string().uuid().optional(),
    year: z.number().int().min(1).max(10).optional(),
    course: z.string().max(150).optional(),
  }),
});

export const completeVerificationSchema = z.object({
  query: z.object({
    token: z.string().min(10),
  }),
  body: z.object({
    password: z.string().min(8).max(255),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(255),
  }),
});

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(10).optional(),
    })
    .optional(),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    password: z.string().min(8).max(255).optional(),
    college_id: z.string().uuid().optional(),
    year: z.number().int().min(1).max(10).optional(),
    course: z.string().max(150).optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    college_id: z.string().uuid().optional(),
    search: z.string().optional(),
    sort: z.enum(["created_at", "name", "email", "year"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    email: z.string().email(),
    password: z.string().min(8).max(255),
    college_id: z.string().uuid().optional(),
    year: z.number().int().min(1).max(10).optional(),
    course: z.string().max(150).optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  query: z.object({
    token: z.string().min(10),
  }),
  body: z.object({
    password: z.string().min(8).max(255),
  }),
});
