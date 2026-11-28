"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Circle, CircleCheck, CircleDashed, CircleX, Contrast, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewStatusDialog from "./dialogs/new-status-dialog";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
}

interface State {
  id: string;
  name: string;
  color: string;
  group: "backlog" | "unstarted" | "started" | "completed" | "cancelled";
  order: number;
  is_default: boolean;
}

// Иконаи ҳар гурӯҳ — аз дизайн.
const groupIcons = {
  backlog: CircleDashed,
  unstarted: Circle,
  started: Contrast,
  completed: CircleCheck,
  cancelled: CircleX,
};

// Dev 2 — Статусҳои проект. Figma: фрейми "Project statuses".
export default function ProjectStatusesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [editingStatus, setEditingStatus] = useState<State | null>(null);

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  // Синфҳои як сатр — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[10px] border-b border-border text-[13px]";
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

  const { data: getStates = [], isPending, error } = useQuery({
    queryKey: ["states", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<State[]>(`${p}/states/`);
      return data;
    },
  });

  const editDefaultStatus = useMutation({
    mutationFn: async (newId: string) => {
      const oldDefault = getStates.find((state) => state.is_default);

      if (oldDefault) {
        await api.patch(`${p}/states/${oldDefault.id}`, { is_default: false });
      }

      await api.patch(`${p}/states/${newId}`, { is_default: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states", workspaceId, projectId] });
    },
  });

  const deleteStatus = useMutation({
    mutationFn: (id: string) => api.delete(`${p}/states/${id}`, { data: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states", workspaceId, projectId] });
    },
  });

  const sortedStates = [...getStates].sort((a, b) => a.order - b.order);

  const isEmpty = !isPending && !error && sortedStates.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.settings]} title={t.title} />

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
              {editingStatus && <NewStatusDialog status={editingStatus} onClose={() => setEditingStatus(null)} />}
            </CardHeader>

            {/* Рӯйхати статусҳо: икона, ном, ранг, тартиб. Ранг аз API меояд, барои ҳамин style. */}
            <div className="flex flex-col px-[16px]">
              {isPending && <p className={`py-[12px] ${muted}`}>Loading...</p>}
              {error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}
              {(editDefaultStatus.error || deleteStatus.error) && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(editDefaultStatus.error || deleteStatus.error)}
                </p>
              )}
              {isEmpty && <p className={`py-[12px] ${muted}`}>No statuses yet</p>}

              {sortedStates.map((el) => {
                const Icon = groupIcons[el.group];
                return (
                  <div key={el.id} className={row}>
                    <Icon className="size-[14px]" style={{ color: el.color }} />
                    <span className="flex-1">
                      {el.name}
                      {el.is_default && <span className={`ml-[8px] ${muted}`}>Default</span>}
                    </span>
                    <span className={`w-[128px] ${muted}`}>{el.color}</span>
                    <span className={`w-[48px] ${muted}`}>{el.order}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Status menu">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setEditingStatus(el)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => editDefaultStatus.mutate(el.id)}>Make default</DropdownMenuItem>
                        <DropdownMenuItem
                          destructive
                          onSelect={() => {
                            if (window.confirm("Delete status?")) deleteStatus.mutate(el.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
