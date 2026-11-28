import * as React from "react";
import { cn } from "@/lib/utils";

// Нишонаи хурд (нақш, статус, шумора).
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  let color = "bg-primary text-primary-foreground";
  if (variant === "outline") color = "border border-border text-foreground";
  if (variant === "secondary") color = "bg-muted text-muted-foreground";

  return (
    <span className={cn("inline-flex h-[20px] items-center rounded-full px-[8px] text-[12px] font-medium", color, className)}>
      {children}
    </span>
  );
}
