"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Табҳо бо хати поён: Tabs > TabsList > TabsTrigger, ва TabsContent.
export const Tabs = TabsPrimitive.Root;

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsItemProps {
  value: string;
  children: React.ReactNode;
  asChild?: boolean; // барои <Link> дар дохили таб
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <TabsPrimitive.List className={cn("flex gap-[16px] border-b border-border", className)}>{children}</TabsPrimitive.List>;
}

export function TabsTrigger({ value, children, asChild, className }: TabsItemProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      asChild={asChild}
      className={cn(
        "-mb-px border-b-2 border-transparent pb-[8px] text-[14px] text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
        className
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children, className }: TabsItemProps) {
  return (
    <TabsPrimitive.Content value={value} className={cn("pt-[16px]", className)}>
      {children}
    </TabsPrimitive.Content>
  );
}
