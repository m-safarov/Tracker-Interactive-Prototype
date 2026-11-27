"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Рӯйхати интихоб: Select > SelectTrigger > SelectValue, ва SelectContent > SelectItem.
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

interface SelectPartProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectPartProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-[36px] w-full items-center justify-between gap-[8px] rounded-[6px] border border-border bg-background px-[12px] text-[14px] outline-none focus:border-primary",
        className
      )}
    >
      {children}
      <ChevronDown className="size-[16px] text-muted-foreground" />
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children, className }: SelectPartProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 min-w-(--radix-select-trigger-width) rounded-[6px] border border-border bg-background p-[4px] text-foreground shadow-md",
          className
        )}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "flex h-[32px] cursor-pointer items-center justify-between gap-[8px] rounded-[4px] px-[8px] text-[14px] outline-none data-highlighted:bg-muted",
        className
      )}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check className="size-[14px]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
