"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import AddProjectMemberDialog from "./dialogs/add-project-member-dialog";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
}

interface ProjectMember {
  user_id: string;
  role: "admin" | "member" | "viewer";
  user: { display_name: string };
}

// Ранги аватар: ҳар аъзо ранги худро мегирад, баъд аз 6 такрор мешавад.
const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-slate-200 text-slate-700",
];

// Dev 2 — Аъзои проект. Figma: фрейми "Project members".
export default function ProjectMembersPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфи як сатри аъзо — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[8px] border-b border-border text-[13px]";
  const muted = "text-[12px] text-muted-foreground";

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(`/workspaces/${workspaceId}`);
      return data;
    },
  });

  const { data: getProject } = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Project>(p);
      return data;
    },
  });

  const { data: getProjectMembers = [], isPending, error } = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectMember[]>(`${p}/members`);
      return data;
    },
  });

  const deleteProjectMember = useMutation({
    mutationFn: (userId: string) => api.delete(`${p}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", workspaceId, projectId] });
    },
  });

  const isEmpty = !isPending && !error && getProjectMembers.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.settings]} title={t.title} />

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

            {/* Рӯйхати аъзо */}
            <div className="flex flex-col px-[16px]">
              {isPending && <p className={`py-[12px] ${muted}`}>Loading...</p>}
              {error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}
              {deleteProjectMember.error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(deleteProjectMember.error)}
                </p>
              )}
              {isEmpty && <p className={`py-[12px] ${muted}`}>No members yet</p>}

              {getProjectMembers.map((el, index) => (
                <div key={el.user_id} className={row}>
                  <Avatar name={el.user.display_name} className={avatarColors[index % avatarColors.length]} />
                  <span className="flex-1 font-semibold">{el.user.display_name}</span>
                  <span className="w-[100px] text-[12px] text-muted-foreground capitalize">{el.role}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        destructive
                        onSelect={() => {
                          if (window.confirm("Remove member?")) deleteProjectMember.mutate(el.user_id);
                        }}
                      >
                        {t.remove}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
