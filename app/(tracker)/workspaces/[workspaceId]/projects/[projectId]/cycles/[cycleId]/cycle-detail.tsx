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
import { useCycleDetailStore } from "../../../../../store/cycle-detail-store";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
  identifier: string;
}

interface Cycle {
  name: string;
  start_date: string | null;
  end_date: string | null;
  progress: {
    backlog: number;
    unstarted: number;
    started: number;
    completed: number;
    cancelled: number;
    completion_percentage: number;
  };
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

// Dev 2 — Як давра ва вазифаҳояш. Figma: фрейми "Cycle detail".
export default function CycleDetailPage() {
  const { workspaceId, projectId, cycleId } = useParams<{ workspaceId: string; projectId: string; cycleId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { selectedIds, setSelectedIds } = useCycleDetailStore();

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

  const { data: getCycle, isPending, error } = useQuery({
    queryKey: ["cycle", workspaceId, projectId, cycleId],
    queryFn: async () => {
      const { data } = await api.get<Cycle>(`${p}/cycles/${cycleId}`);
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

  const { data: getCycleIssues = [] } = useQuery({
    queryKey: ["issues", workspaceId, projectId, cycleId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Issue[] }>(`${p}/issues/?cycle=${cycleId}`);
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

  const postCycleIssues = useMutation({
    mutationFn: () => api.post(`${p}/cycles/${cycleId}/issues`, { issue_ids: selectedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["cycle", workspaceId, projectId, cycleId] });
      setSelectedIds([]);
      setOpen(false);
    },
  });

  const deleteCycleIssue = useMutation({
    mutationFn: (issueId: string) => api.delete(`${p}/cycles/${cycleId}/issues/${issueId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["cycle", workspaceId, projectId, cycleId] });
    },
  });

  const cycleIssueIds = getCycleIssues.map((el) => el.id);
  const otherIssues = getProjectIssues.filter((issue) => !cycleIssueIds.includes(issue.id));

  function toggleIssue(id: string) {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
    else setSelectedIds([...selectedIds, id]);
  }

  const start = getCycle?.start_date ? new Date(getCycle.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  const end = getCycle?.end_date ? new Date(getCycle.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="cycles" />

      <main className="flex flex-1 flex-col">
        <PageHeading
          crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.cycles, getCycle?.name ?? ""]}
          title={getCycle?.name ?? ""}
        >
          {/* Диалоги Add tasks: вазифаҳои проект, ки дар ин давра нестанд */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                <Plus /> {t.addTasks}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addTasks}</DialogTitle>
                <DialogDescription>Choose tasks to add to this cycle.</DialogDescription>
              </DialogHeader>

              <div className="flex max-h-[320px] flex-col overflow-y-auto">
                {otherIssues.length === 0 && <p className="text-[12px] text-muted-foreground">All tasks are already in this cycle</p>}
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

              {postCycleIssues.error && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errorText(postCycleIssues.error)}
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
                  disabled={selectedIds.length === 0 || postCycleIssues.isPending}
                  onClick={() => postCycleIssues.mutate()}
                >
                  {postCycleIssues.isPending ? "Adding..." : t.addTasks}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeading>

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || deleteCycleIssue.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || deleteCycleIssue.error)}
          </p>
        )}

        {getCycle && (
          <ProgressCard subtitle={start && `${start} – ${end}`} percent={getCycle.progress.completion_percentage} progress={getCycle.progress} />
        )}
        <TaskTable
          issues={getCycleIssues}
          states={getStates}
          identifier={getProject?.identifier}
          onRemove={(id) => deleteCycleIssue.mutate(id)}
        />
      </main>
    </div>
  );
}
