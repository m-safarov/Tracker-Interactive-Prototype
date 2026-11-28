"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterBody } from "@/features/auth/schema";
import { api, errorText } from "@/lib/api";
import translations from "./page-translations.json";

const registerResponse = z.object({
  destination: z.string().regex(/^\/(?:profile(?:[?#]|$)|workspaces\/)/),
});

export default function SignUpPage() {
  const router = useRouter();
  const {
    register, handleSubmit, setError, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { display_name: "", email: "", password: "" },
  });
  const registerAccount = useMutation({
    networkMode: "always",
    gcTime: 0,
    mutationFn: async (account: RegisterBody) => {
      const { data } = await api.post<unknown>("/auth/register", account);
      const result = registerResponse.safeParse(data);
      if (!result.success) throw new Error();
      return result.data.destination;
    },
    onSuccess: (destination) => router.replace(destination),
    onError: (error) => {
      const field = isAxiosError<{ error?: { field?: string } }>(error)
        ? error.response?.data?.error?.field
        : undefined;
      setError(field === "email" ? "email" : "root.server", {
        type: "server",
        message: errorText(error),
      });
    },
  });
  const t = translations.en;
  const field = "flex flex-col gap-[6px]";
  const errorClass = "text-[13px] text-destructive";
  const isBusy = isSubmitting || registerAccount.isPending || registerAccount.isSuccess;

  async function submit(account: RegisterBody) {
    if (registerAccount.isPending || registerAccount.isSuccess) return;
    const invite = new URLSearchParams(window.location.search).get("invite")?.trim();
    await registerAccount.mutateAsync({ ...account, invite_token: invite || undefined }).catch(() => undefined);
  }

  return (
    <main className="grid min-h-screen place-items-center px-[24px]">
      <section className="w-full max-w-[360px] -translate-y-[8px]">
        <h1 className="mb-[16px] text-[20px] font-semibold">{t.tracker}</h1>
        <h2 className="mb-[12px] text-[16px] font-semibold">{t.createAccount}</h2>
        <form
          method="post"
          noValidate
          onSubmit={handleSubmit(submit)}
          aria-busy={isBusy}
          className="flex flex-col gap-[10px]"
        >
          <div className={field}>
            <Label htmlFor="sign-up-name">{t.name}</Label>
            <Input
              id="sign-up-name"
              autoComplete="name"
              readOnly={isBusy}
              aria-invalid={!!errors.display_name}
              aria-describedby={errors.display_name ? "sign-up-name-error" : undefined}
              {...register("display_name")}
            />
            {errors.display_name && <p id="sign-up-name-error" role="alert" className={errorClass}>{errors.display_name.message}</p>}
          </div>
          <div className={field}>
            <Label htmlFor="sign-up-email">{t.email}</Label>
            <Input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              readOnly={isBusy}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "sign-up-email-error" : undefined}
              {...register("email")}
            />
            {errors.email && <p id="sign-up-email-error" role="alert" className={errorClass}>{errors.email.message}</p>}
          </div>
          <div className={field}>
            <Label htmlFor="sign-up-password">{t.password}</Label>
            <Input
              id="sign-up-password"
              type="password"
              autoComplete="new-password"
              readOnly={isBusy}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "sign-up-password-error" : undefined}
              {...register("password")}
            />
            {errors.password && <p id="sign-up-password-error" role="alert" className={errorClass}>{errors.password.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={isBusy} className="mt-[6px] w-full">
            {isBusy ? `${t.createAccount}…` : t.createAccount}
          </Button>
          {errors.root?.server && <p role="alert" className={errorClass}>{errors.root.server.message}</p>}
        </form>
        <Link href="/sign-in" className="mt-[18px] inline-block text-[13px] text-primary hover:underline">
          {t.signIn}
        </Link>
      </section>
    </main>
  );
}
