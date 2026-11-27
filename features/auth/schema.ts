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

export type LoginBody = z.infer<typeof loginRequestSchema>;
export type RegisterBody = z.infer<typeof registerRequestSchema>;

const photoUrl = z.url({ protocol: /^https?$/, error: "Enter a valid photo URL." });

export const profileFormSchema = z.object({
  display_name: registerSchema.shape.display_name,
  avatar_url: z.string().trim().transform((value) => value || null).pipe(photoUrl.nullable()),
});

export const updateProfileSchema = z.object({
  display_name: registerSchema.shape.display_name.optional(),
  avatar_url: photoUrl.nullable().optional(),
});

export const changePasswordSchema = z.object({
  current_password: loginSchema.shape.password,
  new_password: registerSchema.shape.password,
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;

export type AccountProfile = {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
};
