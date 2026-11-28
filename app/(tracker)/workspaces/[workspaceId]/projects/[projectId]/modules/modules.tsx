"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewModuleDialog from "./dialogs/new-module-dialog";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
}

interface Module {
  id: string;
  name: string;
  status: "backlog" | "in_progress" | "paused" | "completed" | "cancelled";
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
}

interface ProjectMember {
  user_id: string;
  user: { display_name: string };
}

// Dev 2 — Модулҳои проект ва статусашон. Figma: фрейми "Modules".
export default function ModulesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  // Синфи як сатр — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[56px] items-center gap-[16px] border-b border-border px-[24px] hover:bg-muted/50";

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

  const { data: getModules = [], isPending, error } = useQuery({
    queryKey: ["modules", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Module[]>(`${p}/modules/`);
      return data;
    },
  });

  const { data: getProjectMembers = [] } = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectMember[]>(`${p}/members`);
      return data;
    },
  });

  const deleteModule = useMutation({
    mutationFn: (id: string) => api.delete(`${p}/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", workspaceId, projectId] });
    },
  });

  const isEmpty = !isPending && !error && getModules.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="modules" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.modules]} title={t.modules}>
          <NewModuleDialog />
        </PageHeading>
        {editingModule && <NewModuleDialog module={editingModule} onClose={() => setEditingModule(null)} />}

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || deleteModule.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || deleteModule.error)}
          </p>
        )}
        {isEmpty && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">No modules yet</p>}

        {/* Link танҳо дар гирди ном аст, то тугмаи "..." ссылкаро накушояд. */}
        {getModules.map((el) => {
          const leadName = getProjectMembers.find((member) => member.user_id === el.lead_id)?.user.display_name;
          const start = el.start_date ? new Date(el.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          const end = el.target_date ? new Date(el.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          return (
            <div key={el.id} className={row}>
              <Link href={`${p}/modules/${el.id}`} className="flex-1">
                <p className="text-[13px] font-semibold">{el.name}</p>
                <p className="text-[12px] text-muted-foreground">{start && `${start} – ${end}`}</p>
              </Link>
              <div className="flex w-[160px] items-center gap-[8px] text-[13px] text-muted-foreground">
                {leadName && (
                  <>
                    <Avatar name={leadName} className="bg-pink-100 text-pink-700" />
                    {leadName}
                  </>
                )}
              </div>
              <span className="w-[80px] text-[12px] text-muted-foreground first-letter:uppercase">{el.status.replace("_", " ")}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Module menu">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setEditingModule(el)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      if (window.confirm("Delete module?")) deleteModule.mutate(el.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </main>
    </div>
  );
}
