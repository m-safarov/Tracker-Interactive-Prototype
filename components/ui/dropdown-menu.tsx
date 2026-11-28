"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Менюи "...": DropdownMenu > DropdownMenuTrigger, ва DropdownMenuContent > DropdownMenuItem.
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

interface MenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface MenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean; // true — матни сурх (масалан "Нест кардан")
  className?: string;
}

export function DropdownMenuContent({ children, className }: MenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align="end"
        sideOffset={4}
        className={cn("z-50 min-w-[160px] rounded-[6px] border border-border bg-background p-[4px] text-foreground shadow-md", className)}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ children, onSelect, destructive, className }: MenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      className={cn(
        `flex h-[32px] cursor-pointer items-center gap-[8px] rounded-[4px] px-[8px] text-[14px] outline-none data-highlighted:bg-muted [&_svg]:size-[16px] ${destructive ? "text-destructive" : ""}`,
        className
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator() {
  return <DropdownMenuPrimitive.Separator className="my-[4px] h-px bg-border" />;
}
