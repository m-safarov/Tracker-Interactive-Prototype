import * as React from "react";
import { cn } from "@/lib/utils";

// Номи майдон. htmlFor ба id-и input пайваст мешавад.
export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-[14px] font-medium", className)} {...props} />;
}
