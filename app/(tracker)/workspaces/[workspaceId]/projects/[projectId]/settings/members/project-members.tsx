"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import AddProjectMemberDialog from "./dialogs/add-project-member-dialog";
import translations from "./page-translations.json";

// Dev 2 — Аъзои проект. Figma: фрейми "Project members".
export default function ProjectMembersPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфи як сатри аъзо — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[8px] border-b border-border text-[13px]";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.settings]} title={t.title} />

        {/* Табҳо: General / Members / Statuses / Labels */}
        <Tabs value="members">
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
              <CardTitle className="text-[14px]">{t.members}</CardTitle>
              <AddProjectMemberDialog />
            </CardHeader>

            {/* Рӯйхати аъзо. Намуна: баъд ба .map() бо API иваз мешавад. */}
            <div className="flex flex-col px-[16px]">
              <div className={row}>
                <Avatar name="Madina Rahimova" className="bg-pink-100 text-pink-700" />
                <span className="flex-1 font-semibold">Madina Rahimova</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Admin</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className={row}>
                <Avatar name="Daler Saidov" className="bg-sky-100 text-sky-700" />
                <span className="flex-1 font-semibold">Daler Saidov</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Member</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className={row}>
                <Avatar name="Nigina Usmonova" className="bg-emerald-100 text-emerald-700" />
                <span className="flex-1 font-semibold">Nigina Usmonova</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Member</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className={row}>
                <Avatar name="Anna Petrova" className="bg-orange-100 text-orange-700" />
                <span className="flex-1 font-semibold">Anna Petrova</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Viewer</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
