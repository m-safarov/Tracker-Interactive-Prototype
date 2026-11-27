"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Circle, CircleCheck, CircleDashed, CircleX, Contrast, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewStatusDialog from "./dialogs/new-status-dialog";
import translations from "./page-translations.json";

// Dev 2 — Статусҳои проект. Figma: фрейми "Project statuses".
export default function ProjectStatusesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфҳои як сатр — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[10px] border-b border-border text-[13px]";
  const muted = "text-[12px] text-muted-foreground";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.settings]} title={t.title} />

        {/* Табҳо: General / Members / Statuses / Labels */}
        <Tabs value="statuses">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${p}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${p}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
            <TabsTrigger value="statuses" asChild>
              <Link href={`${p}/settings/statuses`}>{t.statuses}</Link>
            </TabsTrigger>
            <TabsTrigger value="labels" asChild>
              <Link href={`${p}/settings/labels`}>{t.labels}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="p-[24px]">
          <Card className="max-w-[920px] gap-0 p-0 pb-[24px]">
            <CardHeader className="items-center border-b border-border px-[16px] py-[8px]">
              <CardTitle className="text-[14px]">{t.statuses}</CardTitle>
              <NewStatusDialog />
            </CardHeader>

            {/* Рӯйхати статусҳо: икона, ном, ранг, тартиб. Ранг аз API меояд, барои ҳамин style. */}
            <div className="flex flex-col px-[16px]">
              <div className={row}>
                <CircleDashed className="size-[14px]" style={{ color: "#6B7280" }} />
                <span className="flex-1">Backlog</span>
                <span className={`w-[128px] ${muted}`}>#6B7280</span>
                <span className={`w-[48px] ${muted}`}>0</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <Circle className="size-[14px]" style={{ color: "#374151" }} />
                <span className="flex-1">Todo</span>
                <span className={`w-[128px] ${muted}`}>#374151</span>
                <span className={`w-[48px] ${muted}`}>1</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <Contrast className="size-[14px]" style={{ color: "#3B82F6" }} />
                <span className="flex-1">In Progress</span>
                <span className={`w-[128px] ${muted}`}>#3B82F6</span>
                <span className={`w-[48px] ${muted}`}>2</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <Contrast className="size-[14px]" style={{ color: "#7048E8" }} />
                <span className="flex-1">In Review</span>
                <span className={`w-[128px] ${muted}`}>#7048E8</span>
                <span className={`w-[48px] ${muted}`}>3</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <CircleCheck className="size-[14px]" style={{ color: "#10B981" }} />
                <span className="flex-1">Done</span>
                <span className={`w-[128px] ${muted}`}>#10B981</span>
                <span className={`w-[48px] ${muted}`}>4</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <CircleX className="size-[14px]" style={{ color: "#EF4444" }} />
                <span className="flex-1">Cancelled</span>
                <span className={`w-[128px] ${muted}`}>#EF4444</span>
                <span className={`w-[48px] ${muted}`}>5</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                  <MoreHorizontal />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
