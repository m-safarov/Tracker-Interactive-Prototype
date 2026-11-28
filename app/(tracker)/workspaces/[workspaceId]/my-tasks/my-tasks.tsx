"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Circle, CircleCheck, CircleDashed, CircleX, Contrast, Minus, MoreHorizontal, OctagonExclamationPoint, Plus, SignalHigh, SignalLow, SignalMedium, type LucideIcon } from "lucide-react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewTaskDialog from "../projects/[projectId]/tasks/dialogs/new-task-dialog";
import createdTranslations from "./created/page-translations.json";
import translations from "./page-translations.json";

type Project = { id: string; identifier: string; name: string; is_archived: boolean };
type Workspace = { slug: string };
type ProjectState = {
  id: string;
  name: string;
  color: string;
  order: number;
  group: "backlog" | "unstarted" | "started" | "completed" | "cancelled";
};
type Issue = {
  id: string;
  sequence_id: number;
  title: string;
  state_id: string;
  priority: "none" | "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  labels: { label?: { id: string; name: string; color: string } }[];
  assignees: { user?: { id: string; display_name: string; avatar_url: string | null } }[];
};
type IssuePage = { data: Issue[]; next_cursor: string | null };
type Task = Issue & { taskKey: string; project: Project; states: ProjectState[]; state?: ProjectState };
type TaskGroup = { key: string; state?: ProjectState; tasks: Task[] };
type TaskFilter = "assignee" | "created_by";

const proxyOptions = { baseURL: "/api" };

const stateIcons = {
  backlog: CircleDashed,
  unstarted: Circle,
  started: Contrast,
  completed: CircleCheck,
  cancelled: CircleX,
};
const priorities = {
  none: { icon: Minus },
  low: { icon: SignalLow, color: "#2563EB" },
  medium: { icon: SignalMedium, color: "#D97706" },
  high: { icon: SignalHigh, color: "#EA580C" },
  urgent: { icon: OctagonExclamationPoint, color: "#DC2626" },
} satisfies Record<Issue["priority"], { icon: LucideIcon; color?: string }>;

function readList<T>(data: T[] | undefined, name: string): T[] {
  if (!Array.isArray(data)) throw new Error(`The API did not return a list of ${name}.`);
  return data;
}

async function getIssues(projectPath: string, userId: string, filter: TaskFilter, signal: AbortSignal) {
  const issues: Issue[] = [];
  let cursor: string | null = null;

  do {
    const { data }: { data: IssuePage } = await api.get<IssuePage>(`${projectPath}/issues`, {
      ...proxyOptions,
      params: { [filter]: userId, limit: 100, cursor },
      signal,
    });
    issues.push(...readList(data?.data, "tasks"));
    if (data.next_cursor && data.next_cursor === cursor) throw new Error("Could not read the next page of tasks.");
    cursor = data.next_cursor;
  } while (cursor);

  return issues;
}

async function getStates(projectPath: string, signal: AbortSignal) {
  const { data } = await api.get<ProjectState[]>(`${projectPath}/states`, { ...proxyOptions, signal });
  return readList(data, "statuses");
}

function groupTasks(tasks: Task[]) {
  const groups = new Map<string, TaskGroup>();
  for (const task of tasks) {
    const state = task.state;
    const key = state ? `${state.group}:${state.name}` : task.state_id;
    const group = groups.get(key);
    if (group) {
      group.tasks.push(task);
    } else {
      groups.set(key, { key, state, tasks: [task] });
    }
  }
  return [...groups.values()].sort((left, right) => (left.state?.order ?? 99) - (right.state?.order ?? 99));
}

export default function MyTasksPage() {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspacePath = `/workspaces/${encodeURIComponent(workspaceId ?? "")}`;
  const path = `${workspacePath}/my-tasks`;
  const view = pathname.endsWith("/created") ? "created" : "assigned";
  const filter = view === "created" ? "created_by" : "assignee";
  const needsWorkspace = !workspaceId || workspaceId === "undefined";
  const workspaces = useQuery({
    queryKey: ["workspaces", "my-tasks"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Workspace[]>("/workspaces", { ...proxyOptions, signal });
      return readList(data, "workspaces");
    },
    enabled: needsWorkspace,
    gcTime: 0,
    retry: false,
  });
  const availableWorkspaces = workspaces.isSuccess ? workspaces.data : [];
  const hasWorkspace = !needsWorkspace || availableWorkspaces.some((el) => el.slug === workspaceId);
  const fallbackSlug = availableWorkspaces[0]?.slug;
  const fallbackPath = !hasWorkspace && fallbackSlug
    ? `/workspaces/${encodeURIComponent(fallbackSlug)}/my-tasks${view === "created" ? "/created" : ""}`
    : null;

  useEffect(() => {
    if (fallbackPath) router.replace(fallbackPath, { scroll: false });
  }, [fallbackPath, router]);

  const account = useQuery({
    queryKey: ["current-account"],
    queryFn: async ({ signal }) => (await api.get<{ id: string }>("/auth/me", { ...proxyOptions, signal })).data,
    enabled: hasWorkspace,
    gcTime: 0,
    retry: false,
  });
  const workspace = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async ({ signal }) => (await api.get<{ name: string }>(workspacePath, { ...proxyOptions, signal })).data,
    enabled: hasWorkspace,
    retry: false,
  });
  const projects = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Project[]>(`${workspacePath}/projects`, { ...proxyOptions, signal });
      return readList(data, "projects");
    },
    select: (data) => readList(data, "projects"),
    enabled: hasWorkspace,
    retry: false,
  });
  const userId = account.data?.id;
  const projectList = hasWorkspace ? projects.data ?? [] : [];
  const issueQueries = useQueries({
    queries: userId ? projectList.map((el) => ({
      queryKey: ["issues", workspaceId, el.id, filter, userId],
      queryFn: ({ signal }) => getIssues(`${workspacePath}/projects/${encodeURIComponent(el.id)}`, userId, filter, signal),
      retry: false,
    })) : [],
  });
  const stateQueries = useQueries({
    queries: projectList.map((el, index) => ({
      queryKey: ["states", workspaceId, el.id],
      queryFn: ({ signal }) => getStates(`${workspacePath}/projects/${encodeURIComponent(el.id)}`, signal),
      select: (data: ProjectState[]) => readList(data, "statuses"),
      enabled: !!issueQueries[index]?.data?.length,
      retry: false,
    })),
  });
  const editIssue = useMutation({
    mutationFn: ({ id, projectId, stateId }: { id: string; projectId: string; stateId: string }) =>
      api.patch(`${workspacePath}/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(id)}`, { state_id: stateId }, proxyOptions),
    onSuccess: (_, { id, projectId }) => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, projectId] }),
      queryClient.invalidateQueries({ queryKey: ["issue", workspaceId, projectId, id] }),
    ]),
  });
  const t = view === "created" ? createdTranslations.en : translations.en;
  const queries = hasWorkspace
    ? [account, workspace, projects, ...issueQueries, ...stateQueries.filter((el, index) => issueQueries[index]?.data?.length)]
    : [workspaces];
  const failedQueries = queries.filter((el) => el.isError);
  const error = failedQueries[0]?.error;
  const sessionExpired = isAxiosError(error) && error.response?.status === 401;
  const pending = !!fallbackPath || queries.some((el) => el.isPending);
  const tasks = projectList.flatMap((project, index) => {
    const states = stateQueries[index]?.data ?? [];
    return (issueQueries[index]?.data ?? []).map((el) => ({
      ...el,
      taskKey: `${project.identifier}-${el.sequence_id}`,
      project,
      states,
      state: states.find((state) => state.id === el.state_id),
    }));
  });
  const groups = groupTasks(tasks);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const tabLink = "flex h-[39px] items-center px-[2px] pb-[0px] data-[state=active]:text-primary";
  const columns = "grid grid-cols-[16px_61px_minmax(0,1fr)_232px_106px_70px_14px] items-center gap-[8px] px-[24px]";
  const row = `${columns} h-[36px] border-b border-border text-[13px] hover:bg-muted/50`;
  const meta = "text-[12px] text-muted-foreground";
  const tint = "inline-flex rounded-[4px] [&>span]:bg-transparent [&>span]:text-inherit";
  const badges = "flex flex-wrap items-center gap-[4px]";
  const avatars = "flex items-center -space-x-[1px]";

  function mark(Icon: LucideIcon, color?: string) {
    return <Icon className="size-[13px] shrink-0 text-muted-foreground" style={color ? { color } : undefined} aria-hidden="true" />;
  }

  function renderLabel({ label }: Issue["labels"][number]) {
    if (!label) return null;
    return (
      <span key={label.id} className={tint} style={{ backgroundColor: label.color + "1A" }}>
        <Badge variant="secondary" className="h-[19px] px-[6px]">{label.name}</Badge>
      </span>
    );
  }

  function renderAssignee({ user }: Issue["assignees"][number]) {
    if (!user) return null;
    return (
      <span key={user.id} title={user.display_name}>
        <Avatar name={user.display_name} src={user.avatar_url ?? undefined} className="size-[20px] text-[8px]" />
      </span>
    );
  }

  function renderTask(task: Task) {
    const priority: { icon: LucideIcon; color?: string } = priorities[task.priority] ?? priorities.none;
    const date = task.due_date ? new Date(task.due_date) : null;
    const overdue = date && date.getTime() < startOfToday && !task.completed_at
      && task.state?.group !== "completed" && task.state?.group !== "cancelled";
    const href = `${workspacePath}/projects/${encodeURIComponent(task.project.id)}/tasks/${encodeURIComponent(task.id)}`;
    const otherStates = task.states.filter((el) => el.id !== task.state_id);
    return (
      <div key={task.id} className={row}>
        {mark(priority.icon, priority.color)}
        <span className={meta}>{task.taskKey}</span>
        <Link href={href} className="min-w-0 truncate hover:underline">{task.title}</Link>
        <div className={badges}>{task.labels?.map((el) => renderLabel(el))}</div>
        <span className={overdue ? "text-[12px] text-destructive" : meta}>
          {date?.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) ?? "—"}
        </span>
        <div className={avatars}>{task.assignees?.map((el) => renderAssignee(el))}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" className="-ml-[7px]"
              aria-label={t.menu + " " + task.taskKey} disabled={editIssue.isPending || otherStates.length === 0}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {otherStates.map((el) => (
              <DropdownMenuItem key={el.id} onSelect={() => editIssue.mutate({ id: task.id, projectId: task.project.id, stateId: el.id })}>
                {mark(stateIcons[el.group], el.color)}{el.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  function renderGroup({ key, state, tasks }: TaskGroup) {
    const projectsWithState = new Map<string, { name: string; href: string }>();
    for (const task of tasks) {
      if (task.state && !task.project.is_archived) {
        projectsWithState.set(task.project.id, {
          name: task.project.name,
          href: `${workspacePath}/projects/${encodeURIComponent(task.project.id)}/tasks?newTaskState=${encodeURIComponent(task.state.id)}`,
        });
      }
    }
    const choices = Array.from(projectsWithState.values());
    const addTaskLabel = state ? t.addTask + " — " + state.name : t.addTask;

    return (
      <section key={key}>
        <div className="flex h-[36px] items-center gap-[8px] border-y border-border bg-muted px-[24px] text-[13px] font-semibold">
          {mark(state ? stateIcons[state.group] : CircleDashed, state?.color)}
          <h2>{state?.name ?? "—"}</h2>
          <Badge variant="outline" className="ml-[16px] h-[20px] px-[6px]">{tasks.length}</Badge>
          {choices.length === 1 && (
            <Button asChild variant="ghost" size="icon-sm" className="ml-auto -mr-[8px]">
              <Link href={choices[0].href} aria-label={addTaskLabel}><Plus /></Link>
            </Button>
          )}
          {choices.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" className="ml-auto -mr-[8px]" aria-label={addTaskLabel}><Plus /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {choices.map((el) => <DropdownMenuItem key={el.href} onSelect={() => router.push(el.href)}>{el.name}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {tasks.map((el) => renderTask(el))}
      </section>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {hasWorkspace && <WorkspaceSidebar active="my-tasks" />}
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={hasWorkspace && workspace.data ? [workspace.data.name, t.myTasks] : [t.myTasks]} title={t.myTasks}>
          {hasWorkspace && workspace.isSuccess && <NewTaskDialog />}
        </PageHeading>
        {hasWorkspace && (
          <Tabs value={view}>
            <TabsList className="h-[40px] items-end gap-[25px] px-[24px]">
              <TabsTrigger value="assigned" asChild className={tabLink}>
                <Link href={path}>{t.assignedToMe}</Link>
              </TabsTrigger>
              <TabsTrigger value="created" asChild className={tabLink}>
                <Link href={`${path}/created`}>{t.createdByMe}</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className={hasWorkspace ? "min-w-[880px]" : undefined}>
          {hasWorkspace && (
            <div className={`${columns} h-[34px] ${meta}`}>
              <span /><span /><span>{t.title}</span><span>{t.labels}</span><span>{t.dueDate}</span><span>{t.assignees}</span><span />
            </div>
          )}
          {pending && !error && <p role="status" className="px-[24px] py-[16px]">{t.loading}</p>}
          {error && (
            <div className="flex flex-col items-start gap-[8px] px-[24px] py-[16px]">
              <p role="alert" className="text-destructive">{errorText(error)}</p>
              {sessionExpired ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`}>{t.signIn}</Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => failedQueries.forEach((el) => void el.refetch())}
                  disabled={failedQueries.some((el) => el.isFetching)}
                >
                  {t.retry}
                </Button>
              )}
            </div>
          )}
          {!hasWorkspace && !pending && !error && (
            <div className="flex flex-col items-start gap-[8px] px-[24px] py-[16px]">
              <p role="status">{translations.en.noWorkspace}</p>
              <Button asChild size="sm"><Link href="/workspaces/new">{translations.en.createWorkspace}</Link></Button>
            </div>
          )}
          {hasWorkspace && !pending && !error && !groups.length && <p role="status" className="px-[24px] py-[16px]">{t.empty}</p>}
          {editIssue.error && <p role="alert" className="px-[24px] py-[8px] text-destructive">{errorText(editIssue.error)}</p>}
          {!pending && !error && groups.map((el) => renderGroup(el))}
        </div>
      </main>
    </div>
  );
}
