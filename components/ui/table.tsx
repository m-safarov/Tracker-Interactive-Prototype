import * as React from "react";
import { cn } from "@/lib/utils";

// Ҷадвал: Table > TableHeader / TableBody > TableRow > TableHead / TableCell.
interface TablePartProps {
  children?: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TablePartProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-[13px]", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: TablePartProps) {
  return <thead className="bg-muted text-[12px] text-muted-foreground">{children}</thead>;
}

export function TableBody({ children }: TablePartProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className }: TablePartProps) {
  return <tr className={cn("border-b border-border", className)}>{children}</tr>;
}

export function TableHead({ children, className }: TablePartProps) {
  return <th className={cn("h-[34px] px-[12px] text-left font-normal", className)}>{children}</th>;
}

export function TableCell({ children, className }: TablePartProps) {
  return <td className={cn("h-[56px] px-[12px]", className)}>{children}</td>;
}
