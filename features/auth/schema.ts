import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Суроғаи дурусти почтаи электрониро нависед.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Паролро нависед."),
});

export const registerSchema = loginSchema.extend({
  display_name: z.string().trim().min(1, "Номатонро нависед.").max(100, "То 100 аломат истифода баред."),
  password: z.string().min(8, "Камаш 8 аломат истифода баред."),
});

export const loginRequestSchema = loginSchema.extend({ next: z.string().optional() });

export const registerRequestSchema = registerSchema.extend({
  invite_token: z.uuid("This invitation link is invalid.").optional(),
});

export type LoginBody = z.infer<typeof loginRequestSchema>;
export type RegisterBody = z.infer<typeof registerRequestSchema>;

const photoUrl = z.url({ protocol: /^https?$/, error: "Пайванди дурусти аксро нависед." });

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
