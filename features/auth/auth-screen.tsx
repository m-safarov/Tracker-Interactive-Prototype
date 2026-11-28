"use client";

import { configureStore } from "@reduxjs/toolkit";
import { cn } from "cn";
import Link from "next/link";
import { Label } from "radix-ui";
import { useState, type ComponentProps, type ReactNode } from "react";
import { Provider } from "react-redux";
import { create } from "zustand";

import { Button } from "@/components/ui/button";
import { authApi } from "./auth-api";

export const useDraftEmail = create<{ email: string; saveEmail: (email: string) => void }>((set) => ({
  email: "",
  saveEmail: (email) => set({ email }),
}));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    configureStore({
      reducer: { [authApi.reducerPath]: authApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
      devTools: false,
    }),
  );

  return <Provider store={store}>{children}</Provider>;
}

type AuthLayoutProps = {
  title: string;
  className: string;
  linkHref: string;
  linkText: string;
  children: ReactNode;
};

export function AuthLayout({ title, className, linkHref, linkText, children }: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-dvh items-center justify-center bg-background px-6 pb-[124px] font-[family-name:Inter,Arial,sans-serif] tracking-[0.15px] text-foreground",
        "[--border:#e6e6e9] [--foreground:#1c1d21] [--input:#e6e6e9] [--primary:#3b5bdb] [--primary-foreground:#fff] [--radius:6px] [--ring:#3b5bdb]",
        className,
      )}
    >
      <section aria-labelledby="auth-heading" className="flex w-full max-w-[360px] flex-col">
        <p className="text-xl leading-6 font-semibold">Tracker</p>
        <h1 id="auth-heading" className="mt-5 text-base leading-5 font-semibold">{title}</h1>

        {children}

        <Button asChild variant="link" className="mt-5 h-auto self-start border-0 p-0 text-[13.5px] leading-4 font-normal">
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </section>
    </main>
  );
}


type FormFieldProps = ComponentProps<"input"> & { id: string; label: string; error?: string };

export function FormField({ id, label, error, className, ...props }: FormFieldProps) {
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
