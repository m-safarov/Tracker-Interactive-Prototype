import * as React from "react";
import { cn } from "@/lib/utils";

// Карточка: қуттӣ бо border. Барои проект, давра, модул.
interface CardPartProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardPartProps) {
  return (
    <div className={cn("flex flex-col gap-[12px] rounded-[8px] border border-border bg-background p-[16px]", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardPartProps) {
  return <div className={cn("flex items-start justify-between gap-[8px]", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardPartProps) {
  return <h3 className={cn("text-[16px] font-semibold", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: CardPartProps) {
  return <p className={cn("text-[14px] text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({ children, className }: CardPartProps) {
  return <div className={cn("flex flex-col gap-[8px]", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardPartProps) {
  return <div className={cn("flex items-center gap-[8px]", className)}>{children}</div>;
}
