"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Қисмҳое, ки дизайн надоранд, аз Radix бе тағйир гирифта мешаванд.
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogPartProps {
  children: React.ReactNode;
  className?: string;
}

// lang ва translate — барои Profile-и Dev 1; showCloseButton={false} тугмаи X-ро пинҳон мекунад.
interface DialogContentProps extends DialogPartProps {
  lang?: string;
  translate?: "yes" | "no";
  showCloseButton?: boolean;
}

// Қуттии диалог: заминаи торик + тиреза дар марказ + тугмаи X.
export function DialogContent({ children, className, lang, translate, showCloseButton = true }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        lang={lang}
        translate={translate}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[16px] rounded-[12px] border border-border bg-background p-[24px] text-foreground shadow-lg",
          className
        )}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-[16px] right-[16px] rounded-[6px] p-[4px] text-muted-foreground hover:bg-muted">
            <X className="size-[16px]" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children, className }: DialogPartProps) {
  return <div className={cn("flex flex-col gap-[4px]", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: DialogPartProps) {
  return <div className={cn("flex justify-end gap-[8px]", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: DialogPartProps) {
  return <DialogPrimitive.Title className={cn("text-[18px] font-semibold", className)}>{children}</DialogPrimitive.Title>;
}

export function DialogDescription({ children, className }: DialogPartProps) {
  return (
    <DialogPrimitive.Description className={cn("text-[14px] text-muted-foreground", className)}>
      {children}
    </DialogPrimitive.Description>
  );
}
