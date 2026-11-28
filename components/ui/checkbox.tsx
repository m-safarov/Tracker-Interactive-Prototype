"use client";

import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Чекбокс. checked — ҳолат, onCheckedChange — баъд аз клик кор мекунад.
interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={checked}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
      className={cn(
        "flex size-[16px] items-center justify-center rounded-[4px] border border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-[12px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
