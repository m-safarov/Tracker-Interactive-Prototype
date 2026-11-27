"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "cn";
import { Globe } from "lucide-react";
import Link from "next/link";
import { Label } from "radix-ui";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";

import { Button } from "@/components/ui/button";
import { formSchemas, type AuthFormValues, type LoginBody, type RegisterBody } from "./schema";

type AuthResponse = { destination: string };

// Ду дархости API барои воридшавӣ ва сабти ном.
const authApi = {
  login(body: LoginBody) {
    return axios.post<AuthResponse>("/api/auth/login", body);
  },

  register(body: RegisterBody) {
    return axios.post<AuthResponse>("/api/auth/register", body);
  },
};

type ApiError = { error?: { message?: string; field?: "email" } };

const useDraftEmail = create<{ email: string; saveEmail: (email: string) => void }>((set) => ({
  email: "",
  saveEmail: (email) => set({ email }),
}));

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const title = isRegister ? "Create account" : "Sign in";
  const { email, saveEmail } = useDraftEmail();

  // 1. Zod майдонҳои формаро месанҷад.
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(formSchemas[mode]),
    defaultValues: { display_name: "", email, password: "" },
  });
  const { errors, isSubmitting } = formState;

  // 2. TanStack Query маълумоти санҷидашударо ба API мефиристад.
  const [queryClient] = useState(() => new QueryClient());
  const auth = useMutation({
    gcTime: 0,
    networkMode: "always",
    mutationFn: (values: AuthFormValues) => {
      const query = new URLSearchParams(window.location.search);
      const credentials = { email: values.email, password: values.password };

      if (isRegister) {
        return authApi.register({
          ...credentials,
          display_name: values.display_name,
          invite_token: query.get("invite")?.trim() || undefined,
        });
      }

      return authApi.login({ ...credentials, next: query.get("next") ?? undefined });
    },
  }, queryClient);

  // 3. Дар ҳолати муваффақият ба саҳифаи лозимӣ мегузарем.
  async function submitForm(values: AuthFormValues) {
    saveEmail(values.email);

    try {
      const response = await auth.mutateAsync(values);
      window.location.replace(response.data.destination);
    } catch (error) {
      const apiError = axios.isAxiosError<ApiError>(error) ? error.response?.data?.error : undefined;
      const message = apiError?.message ?? "Could not connect to Tracker. Please try again.";

      if (apiError?.field === "email") {
        setError("email", { message }, { shouldFocus: true });
      } else {
        setError("root.server", { message });
      }
    } finally {
      auth.reset();
    }
  }

  return (
    <main
      className={cn(
        "relative flex min-h-dvh items-center justify-center bg-background px-6 pb-[124px] font-[family-name:Inter,Arial,sans-serif] tracking-[0.15px] text-foreground",
        "[--border:#e6e6e9] [--foreground:#1c1d21] [--input:#e6e6e9] [--primary:#3b5bdb] [--primary-foreground:#fff] [--radius:6px] [--ring:#3b5bdb]",
        isRegister ? "pt-[100px]" : "pt-20",
      )}
    >
      <LanguageSelect />
      <section aria-labelledby="auth-heading" className="flex w-full max-w-[360px] flex-col">
        <p className="text-xl leading-6 font-semibold">Tracker</p>
        <h1 id="auth-heading" className="mt-5 text-base leading-5 font-semibold">{title}</h1>

        <form method="post" onSubmit={handleSubmit(submitForm)} className="mt-4" noValidate>
          <div className="grid gap-3">
            {isRegister && (
              <FormField
                {...register("display_name")}
                id="auth-name"
                label="Name"
                autoComplete="name"
                autoFocus
                required
                error={errors.display_name?.message}
              />
            )}
            <FormField
              {...register("email")}
              id="auth-email"
              label="Email"
              type="email"
              autoComplete="username"
              autoFocus={!isRegister}
              placeholder={isRegister ? undefined : "farrukh@example.com"}
              required
              error={errors.email?.message}
            />
            <FormField
              {...register("password")}
              id="auth-password"
              label="Password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={isRegister ? undefined : "••••••••"}
              className="placeholder:tracking-[2px]"
              required
              error={errors.password?.message}
            />
          </div>

          {errors.root?.server?.message && (
            <p role="alert" className="mt-3 text-sm text-destructive">{errors.root.server.message}</p>
          )}
          <Button type="submit" disabled={isSubmitting} className="mt-4 w-full border-0 text-[13.5px]">
            {isSubmitting ? (isRegister ? "Creating account…" : "Signing in…") : title}
          </Button>
        </form>

        <Button asChild variant="link" className="mt-5 h-auto self-start border-0 p-0 text-[13.5px] leading-4 font-normal">
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </Button>
      </section>
    </main>
  );
}

// Майдони shadcn/ui бо ном ва паёми хато.
type FormFieldProps = ComponentProps<"input"> & { id: string; label: string; error?: string };

function FormField({ id, label, error, className, ...props }: FormFieldProps) {
  const errorId = id + "-error";
  return (
    <div className="grid gap-2">
      <Label.Root htmlFor={id} data-slot="label" className="text-[13.5px] leading-4 font-medium">
        {label}
      </Label.Root>
      <input
        {...props}
        id={id}
        data-slot="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-[11px] text-base leading-4 outline-none transition-colors placeholder:text-foreground focus-visible:border-ring aria-invalid:border-destructive md:text-[13.5px]",
          className,
        )}
      />
      {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function LanguageSelect() {
  return (
    <div data-slot="native-select-wrapper" className="absolute top-6 right-6 w-[152px]">
      <select
        aria-label="Language"
        defaultValue="en"
        data-slot="native-select"
        className="h-8 w-full appearance-none rounded-lg border border-input bg-transparent text-center text-[13.5px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="en">English</option>
      </select>
      <Globe
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-[#69717d]"
      />
    </div>
  );
}
