"use client";

import { cn } from "cn";
import { Check, Globe } from "lucide-react";
import Link from "next/link";
import { Label as LabelPrimitive, Select as SelectPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

const signInTypography = "font-[family-name:Inter,Arial,sans-serif] tracking-[0.15px]";

// Page-local variants of the shadcn/ui radix-nova Input and Label.
function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-[11px] text-base leading-4 outline-none transition-colors placeholder:text-foreground focus:border-ring md:text-[13.5px]",
        className,
      )}
    />
  );
}

function Label(props: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      {...props}
      data-slot="label"
      className="flex items-center text-[13.5px] leading-4 font-medium select-none"
    />
  );
}

// Dev 1 — Формаи воридшавӣ.
export default function SignInPage() {
  return (
    <main
      className={cn(
        signInTypography,
        "relative flex min-h-dvh items-center justify-center bg-background px-6 pt-20 pb-[124px] text-foreground",
        "[--border:#e6e6e9] [--foreground:#1c1d21] [--input:#e6e6e9] [--primary:#3b5bdb] [--primary-foreground:#fff] [--radius:6px] [--ring:#3b5bdb]",
      )}
    >
      <SelectPrimitive.Root defaultValue="en">
        <SelectPrimitive.Trigger asChild aria-label="Language">
          <Button
            type="button"
            variant="outline"
            className="absolute top-6 right-6 w-[152px] text-[13.5px]"
          >
            <Globe aria-hidden="true" strokeWidth={1.5} className="absolute left-2 size-4 text-[#69717d]" />
            <SelectPrimitive.Value>English</SelectPrimitive.Value>
          </Button>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            data-slot="select-content"
            position="popper"
            align="end"
            sideOffset={4}
            className={cn(
              signInTypography,
              "z-50 min-w-(--radix-select-trigger-width) rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
            )}
          >
            <SelectPrimitive.Viewport className="p-1">
              <SelectPrimitive.Item
                data-slot="select-item"
                value="en"
                className="relative flex w-full cursor-default items-center rounded-md py-1 pr-8 pl-1.5 text-[13.5px] outline-none select-none focus:bg-accent focus:text-accent-foreground"
              >
                <SelectPrimitive.ItemText>English</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2">
                  <Check aria-hidden="true" className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      <section aria-labelledby="sign-in-heading" className="flex w-full max-w-[360px] flex-col">
        <p className="text-xl leading-6 font-semibold">Tracker</p>
        <h1 id="sign-in-heading" className="mt-5 text-base leading-5 font-semibold">
          Sign in
        </h1>

        <form
          method="post"
          onSubmit={(event) => event.preventDefault()}
          className="mt-4"
        >
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="sign-in-email">Email</Label>
              <Input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="username"
                autoFocus
                placeholder="farrukh@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sign-in-password">Password</Label>
              <Input
                id="sign-in-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="placeholder:tracking-[2px]"
                required
              />
            </div>
          </div>

          <Button type="submit" className="mt-4 w-full border-0 text-[13.5px]">
            Sign in
          </Button>
        </form>

        <Button asChild variant="link" className="mt-5 h-auto self-start border-0 p-0 text-[13.5px] leading-4 font-normal">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </section>
    </main>
  );
}
