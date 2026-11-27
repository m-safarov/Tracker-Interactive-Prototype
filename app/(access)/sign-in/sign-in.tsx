"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { getAuthError, useLoginMutation } from "@/features/auth/auth-api";
import { AuthLayout, AuthProvider, FormField, useDraftEmail } from "@/features/auth/auth-screen";
import { loginSchema } from "@/features/auth/schema";

function SignInForm() {
  const [login, { reset }] = useLoginMutation();
  const { email, saveEmail } = useDraftEmail();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email, password: "" },
  });

  const submit = handleSubmit(async (body) => {
    saveEmail(body.email);
    const next = new URLSearchParams(window.location.search).get("next") ?? undefined;

    try {
      await login({ ...body, next }).unwrap();
    } catch (error) {
      setError("root.server", { message: getAuthError(error).message });
    } finally {
      reset();
    }
  });

  return (
    <AuthLayout title="Sign in" className="pt-20" linkHref="/register" linkText="Create account">
      <form method="post" onSubmit={submit} className="mt-4" noValidate>
        <div className="grid gap-3">
          <FormField
            {...register("email")}
            id="auth-email"
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="farrukh@example.com"
            autoFocus
            required
            error={errors.email?.message}
          />
          <FormField
            {...register("password")}
            id="auth-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="placeholder:tracking-[2px]"
            required
            error={errors.password?.message}
          />
        </div>

        {errors.root?.server?.message && (
          <p role="alert" className="mt-3 text-sm text-destructive">{errors.root.server.message}</p>
        )}
        <Button type="submit" disabled={isSubmitting} className="mt-4 w-full border-0 text-[13.5px]">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <AuthProvider>
      <SignInForm />
    </AuthProvider>
  );
}
