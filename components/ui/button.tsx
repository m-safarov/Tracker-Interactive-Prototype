import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

// Тугма. variant — ранг, size — андоза.
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "icon" | "icon-sm";
  asChild?: boolean; // true бошад, <Link>-ро ҳамчун тугма нишон медиҳад
}

export function Button({ variant = "default", size = "default", asChild = false, className, ...props }: ButtonProps) {
  let color = "bg-primary text-primary-foreground hover:bg-primary/90";
  if (variant === "outline") color = "border border-border bg-background hover:bg-muted";
  if (variant === "ghost") color = "hover:bg-muted";
  if (variant === "destructive") color = "bg-destructive text-white hover:bg-destructive/90";
  if (variant === "link") color = "text-primary hover:underline";

  let sizeClass = "h-[36px] px-[12px]";
  if (size === "sm") sizeClass = "h-[32px] px-[10px] text-[13px]";
  if (size === "icon") sizeClass = "size-[36px]";
  if (size === "icon-sm") sizeClass = "size-[28px]";

  const Tag = asChild ? Slot.Root : "button";

  return (
    <Tag
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-[6px] rounded-[6px] text-[14px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[16px]",
        color,
        sizeClass,
        className
      )}
      {...props}
    />
  );
}
