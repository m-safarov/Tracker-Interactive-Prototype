"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewCycleDialog from "./dialogs/new-cycle-dialog";
import translations from "./page-translations.json";

// Dev 2 — Давраҳо: фаъол, оянда ва тамомшуда. Figma: фрейми "Cycles".
export default function CyclesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфҳо — дар ҳамаи гурӯҳҳо ва сатрҳо як хел.
  const group = "flex h-[36px] items-center border-b border-border bg-muted px-[24px] text-[13px] font-semibold";
  const row = "flex h-[56px] items-center gap-[16px] border-b border-border px-[24px] hover:bg-muted/50";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="cycles" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.cycles]} title={t.cycles}>
          <NewCycleDialog />
        </PageHeading>

        {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
        {/* Link танҳо дар гирди ном аст, то тугмаи "..." ссылкаро накушояд. */}
        <div className={group}>{t.active}</div>
        <div className={row}>
          <Link href={`${p}/cycles/sprint-12`} className="flex-1">
            <p className="text-[13px] font-semibold">Sprint 12</p>
            <p className="text-[12px] text-muted-foreground">19 Nov – 3 Dec</p>
          </Link>
          <span className="w-[80px] text-[12px] text-muted-foreground">{t.active}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
            <MoreHorizontal />
          </Button>
        </div>

        <div className={group}>{t.upcoming}</div>
        <div className={row}>
          <Link href={`${p}/cycles/sprint-13`} className="flex-1">
            <p className="text-[13px] font-semibold">Sprint 13</p>
            <p className="text-[12px] text-muted-foreground">4–17 Dec</p>
          </Link>
          <span className="w-[80px] text-[12px] text-muted-foreground">{t.upcoming}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
            <MoreHorizontal />
          </Button>
        </div>

        <div className={group}>{t.completed}</div>
        <div className={row}>
          <Link href={`${p}/cycles/sprint-11`} className="flex-1">
            <p className="text-[13px] font-semibold">Sprint 11</p>
            <p className="text-[12px] text-muted-foreground">5–18 Nov</p>
          </Link>
          <span className="w-[80px] text-[12px] text-muted-foreground">{t.completed}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
            <MoreHorizontal />
          </Button>
        </div>
      </main>
    </div>
  );
}
