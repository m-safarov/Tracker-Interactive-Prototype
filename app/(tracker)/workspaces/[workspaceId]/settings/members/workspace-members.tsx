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
import InviteMemberDialog from "./dialogs/invite-member-dialog";
import translations from "./page-translations.json";

// Dev 2 — Аъзо ва нақшҳои workspace. Figma: фрейми "Workspace members".
export default function WorkspaceMembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфи як сатри аъзо — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[8px] border-b border-border text-[13px]";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", t.settings]} title={t.title} />

        {/* Табҳо: General / Members */}
        <Tabs value="members">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${w}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${w}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="p-[24px]">
          <Card className="max-w-[920px] gap-0 p-0 pb-[32px]">
            <CardHeader className="items-center border-b border-border px-[16px] py-[8px]">
              <CardTitle className="text-[14px]">{t.members}</CardTitle>
              <InviteMemberDialog />
            </CardHeader>

            {/* Рӯйхати аъзо. Намуна: баъд ба .map() бо API иваз мешавад. */}
            <div className="flex flex-col px-[16px]">
              <div className={row}>
                <Avatar name="Farrukh Karimov" className="bg-violet-100 text-violet-700" />
                <span className="flex-1 font-semibold">Farrukh Karimov</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Owner</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

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
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
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
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
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
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className={row}>
                <Avatar name="Anna Petrova" className="bg-orange-100 text-orange-700" />
                <span className="flex-1 font-semibold">Anna Petrova</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Member</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
                    <DropdownMenuItem destructive>{t.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className={row}>
                <Avatar name="John Miller" className="bg-slate-200 text-slate-700" />
                <span className="flex-1 font-semibold">John Miller</span>
                <span className="w-[100px] text-[12px] text-muted-foreground">Guest</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t.changeRole}</DropdownMenuItem>
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
