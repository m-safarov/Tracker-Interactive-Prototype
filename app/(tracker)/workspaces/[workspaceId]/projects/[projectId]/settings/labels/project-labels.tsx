"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewLabelDialog from "./dialogs/new-label-dialog";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

export default function ProjectLabelsPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const t = translations.en;

  const row = "flex h-[48px] items-center justify-between border-b border-border";
  const label = "rounded-[4px] px-[6px] py-[1px] text-[12px]";
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

  const { data: getLabels = [], isPending, error } = useQuery({
    queryKey: ["labels", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Label[]>(`${p}/labels/`);
      return data;
    },
  });

  const deleteLabel = useMutation({
    mutationFn: (id: string) => api.delete(`${p}/labels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", workspaceId, projectId] });
    },
  });

  const isEmpty = !isPending && !error && getLabels.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.settings]} title={t.title} />

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
              {editingLabel && <NewLabelDialog label={editingLabel} onClose={() => setEditingLabel(null)} />}
            </CardHeader>

            {/* Рӯйхати нишонаҳо. Ранг аз API меояд, барои ҳамин style. "1A" охири ранг = заминаи шаффоф. */}
            <div className="flex flex-col px-[16px]">
              {isPending && <p className={`py-[12px] ${muted}`}>Loading...</p>}
              {error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}
              {deleteLabel.error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(deleteLabel.error)}
                </p>
              )}
              {isEmpty && <p className={`py-[12px] ${muted}`}>No labels yet</p>}

              {getLabels.map((el) => (
                <div key={el.id} className={row}>
                  <span className={label} style={{ color: el.color, backgroundColor: `${el.color}1A` }}>
                    {el.name}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Label menu">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setEditingLabel(el)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        destructive
                        onSelect={() => {
                          if (window.confirm("Delete label?")) deleteLabel.mutate(el.id);
                        }}
                      >
                        Delete
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
