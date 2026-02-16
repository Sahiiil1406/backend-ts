import { z } from "zod";

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    email: z.string().email(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    phone_no: z.string().max(20).optional(),
    address: z.string().max(255).optional(),
    father_name: z.string().max(150).optional(),
    mother_name: z.string().max(150).optional(),
    current_class: z.string().max(50).optional(),
    aadhar_no: z.string().length(12).optional(),
    date_of_birth: z.string().datetime().optional(),
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
    id: z.string().uuid().optional(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    phone_no: z.string().max(20).optional(),
    father_name: z.string().max(150).optional(),
    mother_name: z.string().max(150).optional(),
    current_class: z.string().max(50).optional(),
    aadhar_no: z.string().length(12).optional(),
    date_of_birth: z.string().datetime().optional(),
    address: z.string().max(255).optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    cursor: z.string().optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
    search: z.string().optional(),
    sort: z.enum(["created_at", "name", "email"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid().optional(),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    email: z.string().email(),
    password: z.string().min(8).max(255),
  }),
});
