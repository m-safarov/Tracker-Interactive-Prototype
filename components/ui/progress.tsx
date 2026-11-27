"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Хати пешрафт. value — аз 0 то 100.
interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <ProgressPrimitive.Root value={value} className={cn("h-[6px] w-full overflow-hidden rounded-full bg-muted", className)}>
      <ProgressPrimitive.Indicator className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </ProgressPrimitive.Root>
  );
}
