"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

interface SheetPartProps {
  children: ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetPartProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/15 dark:bg-black/55" />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-[0px] z-50 flex w-full max-w-[720px] flex-col border-l border-border bg-background text-foreground",
          className
        )}
      >
        {children}
        <SheetClose className="absolute top-[10px] right-[8px] inline-flex size-[28px] items-center justify-center rounded-[6px] text-muted-foreground hover:bg-muted">
          <X className="size-[14px]" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetHeader({ children, className }: SheetPartProps) {
  return <div className={cn("flex min-h-[48px] items-center border-b border-border px-[24px]", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: SheetPartProps) {
  return <SheetPrimitive.Title className={cn("text-[20px] leading-[24px] font-semibold", className)}>{children}</SheetPrimitive.Title>;
}

export function SheetDescription({ children, className }: SheetPartProps) {
  return <SheetPrimitive.Description className={cn("text-[13px] text-muted-foreground", className)}>{children}</SheetPrimitive.Description>;
}
