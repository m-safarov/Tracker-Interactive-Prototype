"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CalendarDays, Circle, CircleCheck, CircleDashed, CircleX, Columns3, Contrast, List, ListFilter, Minus, MoreHorizontal, OctagonExclamationPoint, Plus, Search, SignalHigh, SignalLow, SignalMedium, SlidersHorizontal, TableProperties, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewTaskDialog from "./dialogs/new-task-dialog";
import TaskDetailSheet from "./dialogs/task-detail-sheet";
import translations from "./page-translations.json";

const stateIcons = {
  backlog: CircleDashed,
  unstarted: Circle,
  started: Contrast,
  completed: CircleCheck,
  cancelled: CircleX,
};

const priorities = {
  urgent: { icon: OctagonExclamationPoint, color: "#DC2626" },
  high: { icon: SignalHigh, color: "#EA580C" },
  medium: { icon: SignalMedium, color: "#D97706" },
  low: { icon: SignalLow, color: "#2563EB" },
  none: { icon: Minus, color: undefined },
};

type Project = { id: string; name: string; identifier: string; is_archived: boolean };
type ProjectState = {
  id: string;
  name: string;
  group: keyof typeof stateIcons;
  color: string;
  order: number;
};
type Issue = {
  id: string;
  sequence_id: number;
  title: string;
  state_id: string;
  priority: keyof typeof priorities;
  due_date: string | null;
  start_date: string | null;
  estimate_points: number | null;
};
type IssuePage = { data: Issue[]; next_cursor: string | null };
type Task = Issue & { taskKey: string };
type IssueChanges = { state_id?: string; due_date?: string | null };
type ViewProps = {
  params?: Promise<{ workspaceId: string; projectId: string }>;
  view?: "list" | "board" | "table" | "calendar";
  children?: (data: {
    tasks: Task[];
    states: ProjectState[];
    editIssue: (id: string, changes: IssueChanges) => void;
    saving: boolean;
    showDates: boolean;
    taskPath: string;
  }) => ReactNode;
};

const projectIdSchema = z.uuid();
const proxyOptions = { baseURL: "/api" };

async function getIssues(path: string, signal: AbortSignal) {
  const issues: Issue[] = [];
  let cursor: string | null = null;

  do {
    const { data }: { data: IssuePage } = await api.get<IssuePage>(path + "/issues", {
      ...proxyOptions,
      signal,
      params: { limit: 100, cursor },
    });
    if (!Array.isArray(data?.data) || (data.next_cursor && data.next_cursor === cursor)) {
      throw new Error("Could not read the project tasks.");
    }
    issues.push(...data.data);
    cursor = data.next_cursor;
  } while (cursor);

  return issues;
}

function mark(Icon: LucideIcon, color?: string) {
  return <Icon className="size-[13px] shrink-0 text-muted-foreground" style={color ? { color } : undefined} aria-hidden="true" />;
}

export default function TaskListPage({ view = "list", children }: ViewProps) {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const workspacePath = "/workspaces/" + encodeURIComponent(workspaceId);
  const path = workspacePath + "/projects/" + encodeURIComponent(projectId);
  const hasProjectId = projectIdSchema.safeParse(projectId).success;
  const issueKey = ["issues", workspaceId, projectId];
  const taskPath = path + "/tasks";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDates, setShowDates] = useState(true);

  const workspace = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async ({ signal }) => (await api.get<{ name: string }>(workspacePath, { ...proxyOptions, signal })).data,
  });
  const projects = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Project[]>(workspacePath + "/projects", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error("Could not read the workspace projects.");
      return data;
    },
    enabled: !hasProjectId,
  });
  const project = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async ({ signal }) => (await api.get<Project>(path, { ...proxyOptions, signal })).data,
    enabled: hasProjectId,
  });
  const states = useQuery({
    queryKey: ["states", workspaceId, projectId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ProjectState[]>(path + "/states", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error("Could not read the project statuses.");
      return data;
    },
    enabled: hasProjectId,
  });
  const issues = useQuery({
    queryKey: issueKey,
    queryFn: ({ signal }) => getIssues(path, signal),
    enabled: hasProjectId,
  });
  const editIssue = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: IssueChanges }) =>
      api.patch<Issue>(path + "/issues/" + encodeURIComponent(id), changes, proxyOptions),
    onSuccess: async ({ data }, { id }) => {
      queryClient.setQueryData<Issue[]>(issueKey, (current) => current?.map((el) => el.id === id ? data : el));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: issueKey }),
        queryClient.invalidateQueries({ queryKey: ["issue", workspaceId, projectId, id] }),
      ]);
    },
  });

  const t = translations.en;
  const queries = hasProjectId ? [workspace, project, states, issues] : [workspace, projects];
  const failedQueries = queries.filter((el) => el.isError);
  const queryError = failedQueries[0]?.error;
  const loading = queries.some((el) => el.isPending);
  const activeProjects = Array.isArray(projects.data) ? projects.data.filter((el) => !el.is_archived) : [];
  const stateList = Array.isArray(states.data) ? [...states.data].sort((left, right) => left.order - right.order) : [];
  const selectedState = stateList.find((el) => el.id === statusFilter);
  const searchText = search.trim().toLowerCase();
  const identifier = project.data?.identifier;
  const tasks = (issues.data ?? [])
    .map((el) => ({ ...el, taskKey: identifier ? identifier + "-" + el.sequence_id : "—" }))
    .filter((el) => (!selectedState || el.state_id === selectedState.id)
      && (el.title.toLowerCase().includes(searchText) || el.taskKey.toLowerCase().includes(searchText)));
  const otherTasks = tasks.filter((el) => !stateList.some((state) => state.id === el.state_id));
  const today = new Date().setHours(0, 0, 0, 0);

  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const columns = showDates
    ? "grid grid-cols-[16px_61px_minmax(0,1fr)_106px_24px] items-center gap-[8px] px-[24px]"
    : "grid grid-cols-[16px_61px_minmax(0,1fr)_24px] items-center gap-[8px] px-[24px]";
  const row = columns + " min-h-[36px] border-b border-border text-[13px] hover:bg-muted/50";
  const meta = "text-[12px] text-muted-foreground";
  function saveIssue(id: string, changes: IssueChanges) {
    editIssue.mutate({ id, changes });
  }

  function renderTask(task: Task, state?: ProjectState) {
    const priority = priorities[task.priority] ?? priorities.none;
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const overdue = dueDate && dueDate.getTime() < today && state?.group !== "completed" && state?.group !== "cancelled";
    const otherStates = stateList.filter((el) => el.id !== task.state_id);

    return (
      <div key={task.id} className={row}>
        {mark(priority.icon, priority.color)}
        <span className={meta}>{task.taskKey}</span>
        <Link href={taskPath + "?issue=" + encodeURIComponent(task.id)} scroll={false} className="min-w-0 truncate hover:underline">
          {task.title}
        </Link>
        {showDates && (
          <span className={overdue ? "text-[12px] text-destructive" : meta}>
            {dueDate?.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) ?? "—"}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" className="-ml-[7px]" aria-label={t.menu + " " + task.taskKey} disabled={editIssue.isPending || !otherStates.length}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <p className="px-[8px] py-[4px] text-[12px] text-muted-foreground">{t.sheet.status}</p>
            {otherStates.map((el) => (
              <DropdownMenuItem key={el.id} onSelect={() => saveIssue(task.id, { state_id: el.id })}>
                {mark(stateIcons[el.group], el.color)}{el.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  function renderGroup(groupTasks: Task[], state?: ProjectState) {
    if (!groupTasks.length) return null;

    return (
      <div key={state?.id ?? "no-status"}>
        <div className="flex h-[36px] items-center gap-[8px] border-y border-border bg-muted px-[24px] text-[13px] font-semibold">
          {mark(state ? stateIcons[state.group] : CircleDashed, state?.color)}
          {state?.name ?? "No status"}
          <Badge variant="outline" className="ml-[16px] h-[20px] px-[6px]">{groupTasks.length}</Badge>
          {state && (
            <Button asChild variant="ghost" size="icon-sm" className="ml-auto -mr-[8px]">
              <Link href={taskPath + "?newTaskState=" + encodeURIComponent(state.id)} scroll={false} aria-label={t.addTask + " — " + state.name}><Plus /></Link>
            </Button>
          )}
        </div>
        {groupTasks.map((el) => renderTask(el, state))}
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[workspace.data?.name, project.data?.name, t.tasks].filter((el): el is string => !!el)} title={project.data?.name ?? t.tasks}>
          {hasProjectId && <NewTaskDialog />}
        </PageHeading>

        {hasProjectId && (
          <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-[8px] border-b border-border px-[22px] pb-[8px]">
            <Tabs value={view}>
              <TabsList className="gap-[4px] border-b-0">
                <TabsTrigger value="list" asChild className={viewTab}>
                  <Link href={path + "/tasks"}><List className="size-[14px]" aria-hidden="true" />{t.list}</Link>
                </TabsTrigger>
                <TabsTrigger value="board" asChild className={viewTab}>
                  <Link href={path + "/tasks/board"}><Columns3 className="size-[14px]" aria-hidden="true" />{t.board}</Link>
                </TabsTrigger>
                <TabsTrigger value="table" asChild className={viewTab}>
                  <Link href={path + "/tasks/table"}><TableProperties className="size-[14px]" aria-hidden="true" />{t.table}</Link>
                </TabsTrigger>
                <TabsTrigger value="calendar" asChild className={viewTab}>
                  <Link href={path + "/tasks/calendar"}><CalendarDays className="size-[14px]" aria-hidden="true" />{t.calendar}</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-[8px]">
              <div className="relative">
                <Label htmlFor="task-search" className="sr-only">{t.search}</Label>
                <Search className="pointer-events-none absolute top-[8px] left-[9px] size-[15px] text-muted-foreground" aria-hidden="true" />
                <Input id="task-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search} className="h-[32px] w-[144px] pl-[30px]" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="min-w-[97px]" disabled={!stateList.length}>
                    <ListFilter />{selectedState?.name ?? t.filters}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setStatusFilter("")}>All statuses</DropdownMenuItem>
                  {stateList.map((el) => (
                    <DropdownMenuItem key={el.id} onSelect={() => setStatusFilter(el.id)}>{el.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {view !== "calendar" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setShowDates((visible) => !visible)}>
                      {showDates ? "Hide dates" : "Show dates"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {!queryError && loading && <p role="status" className="px-[24px] py-[16px]">Loading…</p>}
        {queryError && (
          <div className="flex flex-col items-start gap-[8px] px-[24px] py-[16px]">
            <p role="alert" className="text-destructive">{errorText(queryError)}</p>
            <Button type="button" size="sm" variant="outline" disabled={failedQueries.some((el) => el.isFetching)}
              onClick={() => failedQueries.forEach((el) => void el.refetch())}>{t.newTask.retry}</Button>
          </div>
        )}

        {!hasProjectId && !queryError && !loading && (
          <div className="flex flex-col items-start gap-[8px] px-[24px] py-[16px]">
            {activeProjects.length ? (
              <>
                <h2 className="text-[14px] font-semibold">{t.newTask.chooseProject}</h2>
                {activeProjects.map((el) => (
                  <Button key={el.id} variant="outline" size="sm" asChild>
                    <Link href={workspacePath + "/projects/" + encodeURIComponent(el.id) + "/tasks" + (view === "list" ? "" : "/" + view)}>{el.name}</Link>
                  </Button>
                ))}
              </>
            ) : <p role="status" className={meta}>{t.newTask.noProjects}</p>}
          </div>
        )}

        {hasProjectId && !queryError && !loading && (
          <>
            {editIssue.error && <p role="alert" className="px-[24px] py-[8px] text-destructive">{errorText(editIssue.error)}</p>}
            {tasks.length === 0 && view !== "calendar" && (
              <p role="status" className="px-[24px] py-[16px] text-muted-foreground">
                {issues.data?.length ? "No matching tasks." : "No tasks yet."}
              </p>
            )}
            {children ? children({ tasks, states: stateList, editIssue: saveIssue, saving: editIssue.isPending, showDates, taskPath }) : (
              <div className="min-w-[520px]">
                <div className={columns + " h-[34px] " + meta}>
                  <span /><span /><span>{t.title}</span>{showDates && <span>{t.dueDate}</span>}<span />
                </div>
                {stateList.map((el) => renderGroup(tasks.filter((task) => task.state_id === el.id), el))}
                {renderGroup(otherTasks)}
                <TaskDetailSheet />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
