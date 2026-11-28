"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewProjectDialog from "../dialogs/new-project-dialog";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  description: string | null;
  lead_id: string | null;
  is_archived: boolean;
  created_at: string;
}

interface Member {
  user_id: string;
  user: { display_name: string };
}

// Dev 2 — Рӯйхати проектҳои архившуда. Figma: фрейми "Archived projects".
export default function ArchivedProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(w);
      return data;
    },
  });

  const { data: getProjects = [], isPending, error } = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Project[]>(`${w}/projects/`);
      return data;
    },
  });

  const { data: getMembers = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>(`${w}/members`);
      return data;
    },
  });

  const editRestoreProject = useMutation({
    mutationFn: (id: string) => api.patch(`${w}/projects/${id}`, { is_archived: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
    },
  });

  const archivedProjects = getProjects.filter((project) => project.is_archived);

  const isEmpty = !isPending && !error && archivedProjects.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="projects" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", t.projects]} title={t.projects}>
          <NewProjectDialog />
        </PageHeading>

        {/* Табҳо: Active / Archived */}
        <Tabs value="archived">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="active" asChild>
              <Link href={`${w}/projects`}>{t.active}</Link>
            </TabsTrigger>
            <TabsTrigger value="archived" asChild>
              <Link href={`${w}/projects/archived`}>{t.archived}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || editRestoreProject.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || editRestoreProject.error)}
          </p>
        )}
        {isEmpty && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">No archived projects</p>}

        {/* Ҷадвали проектҳои архивӣ */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-[24px]">{t.project}</TableHead>
              <TableHead className="w-[170px]">{t.lead}</TableHead>
              <TableHead className="w-[90px]">{t.created}</TableHead>
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedProjects.map((el) => {
              const lead = getMembers.find((member) => member.user_id === el.lead_id);
              return (
                <TableRow key={el.id}>
                  <TableCell className="pl-[24px]">
                    <div className="flex items-center gap-[14px]">
                      <span className="rounded-[4px] border border-border bg-muted px-[6px] py-[2px] text-[12px] text-muted-foreground">
                        {el.identifier}
                      </span>
                      <div>
                        <p className="font-semibold">{el.name}</p>
                        <p className="text-[12px] text-muted-foreground">{el.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead && (
                      <div className="flex items-center gap-[8px] text-muted-foreground">
                        <Avatar name={lead.user.display_name} className="bg-violet-100 text-violet-700" /> {lead.user.display_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(el.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Project menu">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => editRestoreProject.mutate(el.id)}>{t.restore}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
