import * as React from "react";
import { cn } from "@/lib/utils";

// Майдони матн. Ҳамаи props-и <input> кор мекунанд (value, onChange, placeholder ...).
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-[36px] w-full rounded-[6px] border border-border bg-background px-[12px] text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary",
        className
      )}
      {...props}
    />
  );
}
