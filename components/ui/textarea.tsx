import * as React from "react";
import { cn } from "@/lib/utils";

// Майдони матни калон (тавсиф).
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[80px] w-full rounded-[6px] border border-border bg-background px-[12px] py-[8px] text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary",
        className
      )}
      {...props}
    />
  );
}
