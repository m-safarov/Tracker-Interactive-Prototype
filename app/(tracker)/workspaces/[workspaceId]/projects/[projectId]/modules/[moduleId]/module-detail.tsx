"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeading from "@/components/page-heading";
import ProgressCard from "@/components/progress-card";
import TaskTable from "@/components/task-table";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import { useModuleDetailStore } from "../../../../../store/module-detail-store";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
  identifier: string;
}

interface Module {
  name: string;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  progress: {
    backlog: number;
    unstarted: number;
    started: number;
    completed: number;
    cancelled: number;
    completion_percentage: number;
  };
}

interface ProjectMember {
  user_id: string;
  user: { display_name: string };
}

interface State {
  id: string;
  name: string;
  group: string;
}

interface Issue {
  id: string;
  sequence_id: number;
  title: string;
  state_id: string;
  priority: string;
  due_date: string | null;
}

// Dev 2 — Як модул ва вазифаҳояш. Figma: фрейми "Module detail".
export default function ModuleDetailPage() {
  const { workspaceId, projectId, moduleId } = useParams<{ workspaceId: string; projectId: string; moduleId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { selectedIds, setSelectedIds } = useModuleDetailStore();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

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

  const { data: getModule, isPending, error } = useQuery({
    queryKey: ["module", workspaceId, projectId, moduleId],
    queryFn: async () => {
      const { data } = await api.get<Module>(`${p}/modules/${moduleId}`);
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

  const { data: getStates = [] } = useQuery({
    queryKey: ["states", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<State[]>(`${p}/states/`);
      return data;
    },
  });

  const { data: getModuleIssues = [] } = useQuery({
    queryKey: ["issues", workspaceId, projectId, "module", moduleId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Issue[] }>(`${p}/issues/?module=${moduleId}`);
      return data.data;
    },
  });

  const { data: getProjectIssues = [] } = useQuery({
    queryKey: ["issues", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Issue[] }>(`${p}/issues/`);
      return data.data;
    },
  });

  const postModuleIssues = useMutation({
    mutationFn: () => api.post(`${p}/modules/${moduleId}/issues`, { issue_ids: selectedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["module", workspaceId, projectId, moduleId] });
      setSelectedIds([]);
      setOpen(false);
    },
  });

  const deleteModuleIssue = useMutation({
    mutationFn: (issueId: string) => api.delete(`${p}/modules/${moduleId}/issues/${issueId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["module", workspaceId, projectId, moduleId] });
    },
  });

  const moduleIssueIds = getModuleIssues.map((el) => el.id);
  const otherIssues = getProjectIssues.filter((issue) => !moduleIssueIds.includes(issue.id));

  function toggleIssue(id: string) {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
    else setSelectedIds([...selectedIds, id]);
  }

  const leadName = getProjectMembers.find((member) => member.user_id === getModule?.lead_id)?.user.display_name;
  const start = getModule?.start_date ? new Date(getModule.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  const end = getModule?.target_date ? new Date(getModule.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  const dates = start && `${start} – ${end}`;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="modules" />

      <main className="flex flex-1 flex-col">
        <PageHeading
          crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.modules, getModule?.name ?? ""]}
          title={getModule?.name ?? ""}
        >
          {/* Диалоги Add tasks: вазифаҳои проект, ки дар ин модул нестанд */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                <Plus /> {t.addTasks}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addTasks}</DialogTitle>
                <DialogDescription>Choose tasks to add to this module.</DialogDescription>
              </DialogHeader>

              <div className="flex max-h-[320px] flex-col overflow-y-auto">
                {otherIssues.length === 0 && <p className="text-[12px] text-muted-foreground">All tasks are already in this module</p>}
                {otherIssues.map((el) => (
                  <label key={el.id} className="flex h-[36px] items-center gap-[8px] text-[13px]">
                    <Checkbox
                      checked={selectedIds.includes(el.id)}
                      onCheckedChange={() => toggleIssue(el.id)}
                    />
                    <span className="w-[60px] text-[12px] text-muted-foreground">
                      {getProject?.identifier}-{el.sequence_id}
                    </span>
                    {el.title}
                  </label>
                ))}
              </div>

              {postModuleIssues.error && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errorText(postModuleIssues.error)}
                </p>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  disabled={selectedIds.length === 0 || postModuleIssues.isPending}
                  onClick={() => postModuleIssues.mutate()}
                >
                  {postModuleIssues.isPending ? "Adding..." : t.addTasks}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeading>

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || deleteModuleIssue.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || deleteModuleIssue.error)}
          </p>
        )}

        {getModule && (
          <ProgressCard
            subtitle={leadName ? `${leadName} · ${dates}` : dates}
            percent={getModule.progress.completion_percentage}
            progress={getModule.progress}
          />
        )}
        <TaskTable
          issues={getModuleIssues}
          states={getStates}
          identifier={getProject?.identifier}
          onRemove={(id) => deleteModuleIssue.mutate(id)}
        />
      </main>
    </div>
  );
}
