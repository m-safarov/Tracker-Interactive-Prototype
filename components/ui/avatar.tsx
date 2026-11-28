"use client";

import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Сурати корбар. Агар сурат набошад, ду ҳарфи аввали ном нишон дода мешавад.
// Ранги заминаро бо className иваз кардан мумкин (масалан "bg-pink-100").
interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  const letters = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AvatarPrimitive.Root
      className={cn("flex size-[24px] shrink-0 overflow-hidden rounded-full bg-muted text-[10px] font-semibold", className)}
    >
      <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center">{letters}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
