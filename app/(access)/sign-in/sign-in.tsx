"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginBody } from "@/features/auth/schema";
import { api, errorText } from "@/lib/api";
import translations from "./page-translations.json";

const loginResponse = z.object({
  destination: z.string().regex(/^\/(?:profile(?:[?#]|$)|workspaces\/|invitations\/)/),
});

export default function SignInPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signIn = useMutation({
    networkMode: "always",
    gcTime: 0,
    mutationFn: async (credentials: LoginBody) => {
      const { data } = await api.post<unknown>("/auth/login", credentials, { baseURL: "/api" });
      const result = loginResponse.safeParse(data);
      if (!result.success) throw new Error();
      return result.data.destination;
    },
    onSuccess: (destination) => router.replace(destination),
  });
  const t = translations.en;
  const field = "flex flex-col gap-[6px]";
  const errorClass = "text-[13px] text-destructive";
  const isBusy = isSubmitting || signIn.isPending || signIn.isSuccess;

  async function submit(credentials: LoginBody) {
    if (signIn.isPending || signIn.isSuccess) return;
    const next = new URLSearchParams(window.location.search).get("next") ?? undefined;
    await signIn.mutateAsync({ ...credentials, next }).catch(() => undefined);
  }

  return (
    <main className="grid min-h-screen place-items-center px-[24px]">
      <section className="w-full max-w-[360px] -translate-y-[20px]">
        <h1 className="mb-[16px] text-[20px] font-semibold">{t.tracker}</h1>
        <h2 className="mb-[12px] text-[16px] font-semibold">{t.signIn}</h2>
        <form
          method="post"
          noValidate
          onSubmit={handleSubmit(submit, () => signIn.reset())}
          aria-busy={isBusy}
          className="flex flex-col gap-[10px]"
        >
          <div className={field}>
            <Label htmlFor="sign-in-email">{t.email}</Label>
            <Input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              readOnly={isBusy}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "sign-in-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && <p id="sign-in-email-error" role="alert" className={errorClass}>{errors.email.message}</p>}
          </div>
          <div className={field}>
            <Label htmlFor="sign-in-password">{t.password}</Label>
            <Input
              id="sign-in-password"
              type="password"
              autoComplete="current-password"
              readOnly={isBusy}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "sign-in-password-error" : undefined}
              {...register("password")}
            />
            {errors.password && <p id="sign-in-password-error" role="alert" className={errorClass}>{errors.password.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={isBusy} className="mt-[6px] w-full">
            {isBusy ? `${t.signIn}…` : t.signIn}
          </Button>
          {signIn.isError && <p role="alert" className={errorClass}>{errorText(signIn.error)}</p>}
        </form>
        <Link href="/sign-up" className="mt-[18px] inline-block text-[13px] text-primary hover:underline">
          {t.createAccount}
        </Link>
      </section>
    </main>
  );
}
