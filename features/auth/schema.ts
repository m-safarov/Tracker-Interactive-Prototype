import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = loginSchema.extend({
  display_name: z.string().trim().min(1, "Enter your name.").max(100, "Use 100 characters or fewer."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const loginRequestSchema = loginSchema.extend({ next: z.string().optional() });

export const registerRequestSchema = registerSchema.extend({
  invite_token: z.uuid("This invitation link is invalid.").optional(),
});

export const formSchemas = {
  login: loginSchema.extend({ display_name: z.string() }),
  register: registerSchema,
};

export type LoginBody = z.infer<typeof loginRequestSchema>;
export type RegisterBody = z.infer<typeof registerRequestSchema>;
export type AuthFormValues = z.infer<typeof registerSchema>;
