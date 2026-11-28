import * as React from "react";
import { ChevronRight, Command } from "lucide-react";

// Breadcrumbs + сарлавҳаи саҳифа. Figma: компонентҳои "Breadcrumbs" ва "Page heading".
// crumbs — роҳ (охиринаш ғафс), title — сарлавҳа, children — тугма дар тарафи рост.
interface PageHeadingProps {
  crumbs: string[];
  title: string;
  children?: React.ReactNode;
}

export default function PageHeading({ crumbs, title, children }: PageHeadingProps) {
  return (
    <>
      <div className="flex h-[48px] items-center gap-[6px] border-b border-border px-[24px] text-[13px]">
        {crumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-[6px]">
            {index > 0 && <ChevronRight className="size-[12px] text-muted-foreground" />}
            <span className={index === crumbs.length - 1 ? "font-medium" : "text-muted-foreground"}>{crumb}</span>
          </span>
        ))}
        <Command className="ml-auto size-[16px] text-muted-foreground" />
      </div>

      <div className="flex h-[64px] items-center justify-between border-b border-border px-[24px]">
        <h1 className="text-[16px] font-semibold">{title}</h1>
        {children}
      </div>
    </>
  );
}
