"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { getAuthError, useRegisterMutation } from "@/features/auth/auth-api";
import { AuthLayout, AuthProvider, FormField, useDraftEmail } from "@/features/auth/auth-screen";
import { registerSchema } from "@/features/auth/schema";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

function SignUpForm() {
  const { language } = usePreferencesStore();
  const t = translations[language];
  const [registerAccount, { reset }] = useRegisterMutation();
  const { email, saveEmail } = useDraftEmail();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { display_name: "", email, password: "" },
  });

  const submit = handleSubmit(async (body) => {
    saveEmail(body.email);
    const invite = new URLSearchParams(window.location.search).get("invite")?.trim();

    try {
      const { destination } = await registerAccount({ ...body, invite_token: invite || undefined }).unwrap();
      window.location.replace(destination);
    } catch (error) {
      const { message, field } = getAuthError(error);
      if (field === "email") {
        setError("email", { message }, { shouldFocus: true });
      } else {
        setError("root.server", { message });
      }
    } finally {
      reset();
    }
  });

  return (
    <AuthLayout title={t.createAccount} className="pt-[100px]" linkHref="/login" linkText={t.signIn}>
      <form method="post" onSubmit={submit} className="mt-4" noValidate>
        <div className="grid gap-3">
          <FormField
            {...register("display_name")}
            id="auth-name"
            label={t.name}
            autoComplete="name"
            autoFocus
            required
            error={errors.display_name?.message}
          />
          <FormField
            {...register("email")}
            id="auth-email"
            label={t.email}
            type="email"
            autoComplete="username"
            required
            error={errors.email?.message}
          />
          <FormField
            {...register("password")}
            id="auth-password"
            label={t.password}
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
          />
        </div>

        {errors.root?.server?.message && (
          <p role="alert" className="mt-3 text-sm text-destructive">{errors.root.server.message}</p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-4 w-full border-0 text-[13.5px]">
          {isSubmitting ? t.creatingAccount : t.createAccount}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <AuthProvider>
      <SignUpForm />
    </AuthProvider>
  );
}
