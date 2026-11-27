"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewLabelDialog from "./dialogs/new-label-dialog";
import translations from "./page-translations.json";

// Dev 2 — Нишонаҳои проект. Figma: фрейми "Project labels".
export default function ProjectLabelsPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфҳои як сатр ва нишона — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center justify-between border-b border-border";
  const label = "rounded-[4px] px-[6px] py-[1px] text-[12px]";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.settings]} title={t.title} />

        {/* Табҳо: General / Members / Statuses / Labels */}
        <Tabs value="labels">
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
          <Card className="max-w-[920px] gap-0 p-0 pb-[32px]">
            <CardHeader className="items-center border-b border-border px-[16px] py-[8px]">
              <CardTitle className="text-[14px]">{t.labels}</CardTitle>
              <NewLabelDialog />
            </CardHeader>

            {/* Рӯйхати нишонаҳо. Ранг аз API меояд, барои ҳамин style. "1A" охири ранг = заминаи шаффоф. */}
            <div className="flex flex-col px-[16px]">
              <div className={row}>
                <span className={label} style={{ color: "#047857", backgroundColor: "#10B9811A" }}>backend</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <span className={label} style={{ color: "#B91C1C", backgroundColor: "#EF44441A" }}>bug</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <span className={label} style={{ color: "#7E22CE", backgroundColor: "#A855F71A" }}>design</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <span className={label} style={{ color: "#1D4ED8", backgroundColor: "#3B82F61A" }}>feature</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
                  <MoreHorizontal />
                </Button>
              </div>
              <div className={row}>
                <span className={label} style={{ color: "#B45309", backgroundColor: "#F59E0B1A" }}>frontend</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
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
