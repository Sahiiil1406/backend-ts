import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(8000),
    BASE_BACKEND_URL: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
    ACCESS_TOKEN_EXPIRY: z.string().optional().default("1h"),
    NODEMAILER_EMAIL: z.string().optional(),
    NODEMAILER_PASSWORD: z.string().optional(),
    ENABLE_REQUEST_LOG: z.enum(["true", "false"]).optional().default("true"),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "test") {
      if (!value.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "DATABASE_URL is required",
          path: ["DATABASE_URL"],
        });
      }
      if (!value.JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "JWT_SECRET is required",
          path: ["JWT_SECRET"],
        });
      }
      if (!value.JWT_REFRESH_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "JWT_REFRESH_SECRET is required",
          path: ["JWT_REFRESH_SECRET"],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
