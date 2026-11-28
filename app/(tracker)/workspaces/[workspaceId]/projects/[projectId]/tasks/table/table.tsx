"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Check, Circle, CircleCheck, CircleDashed, CircleX, Columns3, Contrast, List, ListFilter, Minus, OctagonExclamationPoint, Search, SignalHigh, SignalLow, SignalMedium, SlidersHorizontal, TableProperties, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewTaskDialog from "../dialogs/new-task-dialog";
import translations from "./page-translations.json";

const taskStatuses = ["backlog", "todo", "inProgress", "inReview", "done", "cancelled"] as const;
type TaskStatus = (typeof taskStatuses)[number];

interface TaskRow {
  taskKey: string;
  title: string;
  status: TaskStatus;
  statusIcon: ReactNode;
  priority: ReactNode;
  start: string;
  due: string;
  estimate: number;
  overdue?: boolean;
  tags?: ReactNode;
  people?: ReactNode;
}

function getVisibleTasks(tasks: TaskRow[], search: string, status: TaskStatus | null) {
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(query) || task.taskKey.toLowerCase().includes(query);
    const matchesStatus = status === null || task.status === status;
    return matchesSearch && matchesStatus;
  });
}

export default function TablePage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}`;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const t = translations.en;
  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const header = "h-[36px] whitespace-nowrap px-[8px]";
  const cell = "h-[36px] whitespace-nowrap px-[8px]";
  const meta = `${cell} text-[12px] text-muted-foreground`;
  const tint = "inline-flex rounded-[4px] [&>span]:bg-transparent [&>span]:text-inherit";
  const badges = "flex flex-wrap items-center gap-[4px]";
  const avatars = "flex items-center -space-x-[1px]";

  function mark(Icon: LucideIcon, color?: string) {
    return <Icon className="size-[13px] shrink-0 text-muted-foreground" style={color ? { color } : undefined} aria-hidden="true" />;
  }

  function tag(label: string, color: string) {
    return (
      <span className={tint} style={{ backgroundColor: color + "1A" }}>
        <Badge variant="secondary" className="h-[19px] px-[6px]">{label}</Badge>
      </span>
    );
  }

  function person(name: string, color: string) {
    return (
      <span className="inline-flex rounded-full [&>span]:bg-transparent" style={{ backgroundColor: color + "33" }}>
        <Avatar name={name} className="size-[20px] text-[8px]" />
      </span>
    );
  }

  function toggleStatus(status: TaskStatus) {
    setStatusFilter((current) => current === status ? null : status);
  }

  function renderTaskRow({ taskKey, title, status, statusIcon, priority, start, due, estimate, overdue, tags, people }: TaskRow) {
    return (
      <TableRow key={taskKey} className="hover:bg-muted/50">
        <TableCell className={`${meta} pl-[24px]`}>{taskKey}</TableCell>
        <TableCell className={`${cell} min-w-[260px] whitespace-normal`}>
          {taskKey === "WEB-1"
            ? <Link href={`${path}/tasks/web-1`} className="line-clamp-2 leading-[16px] hover:underline">{title}</Link>
            : <span className="line-clamp-2 leading-[16px]">{title}</span>}
        </TableCell>
        <TableCell className={meta}><span className="flex items-center gap-[4px]">{statusIcon}{t[status]}</span></TableCell>
        <TableCell className={cell}>{priority}</TableCell>
        <TableCell className={cell}><div className={avatars}>{people}</div></TableCell>
        <TableCell className={cell}><div className={badges}>{tags}</div></TableCell>
        <TableCell className={meta}>{start}</TableCell>
        <TableCell className={overdue ? `${cell} text-[12px] text-destructive` : meta}>{due}</TableCell>
        <TableCell className={meta}>{estimate}</TableCell>
        <TableCell className={meta}>18 Nov</TableCell>
        <TableCell className={`${meta} pr-[24px]`}>25 Nov</TableCell>
      </TableRow>
    );
  }

  // Намуна: вазифаҳо то пайваст шудани API.
  const demoTasks: TaskRow[] = [
    {
      taskKey: "WEB-18", title: t.backups,
      status: "backlog", statusIcon: mark(CircleDashed), priority: mark(SignalLow, "#2563EB"),
      start: "—", due: "30 Nov", estimate: 2,
      tags: <>{tag(t.backend, "#047857")}</>,
      people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
    },
    {
      taskKey: "WEB-20", title: t.keyboard,
      status: "backlog", statusIcon: mark(CircleDashed), priority: mark(SignalLow, "#2563EB"),
      start: "20 Nov", due: "2 Dec", estimate: 5,
      tags: <>{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Nur Usmonov", "#20806C")}</>,
    },
    {
      taskKey: "WEB-16", title: t.logs,
      status: "backlog", statusIcon: mark(CircleDashed), priority: mark(Minus),
      start: "—", due: "—", estimate: 3,
      tags: <>{tag(t.backend, "#047857")}</>,
      people: <>{person("Daler Saidov", "#3879A1")}</>,
    },
    {
      taskKey: "WEB-7", title: t.passwordMeter,
      status: "todo", statusIcon: mark(Circle), priority: mark(SignalHigh, "#EA580C"),
      start: "20 Nov", due: "30 Nov", estimate: 8,
      tags: <>{tag(t.feature, "#1D64B5")}{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Daler Saidov", "#3879A1")}{person("Anna Petrova", "#B66325")}</>,
    },
    {
      taskKey: "WEB-10", title: t.darkMode,
      status: "todo", statusIcon: mark(Circle), priority: mark(SignalMedium, "#D97706"),
      start: "—", due: "3 Dec", estimate: 2,
      tags: <>{tag(t.design, "#9333B8")}{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Nur Usmonov", "#20806C")}</>,
    },
    {
      taskKey: "WEB-11", title: t.errors,
      status: "todo", statusIcon: mark(Circle), priority: mark(SignalLow, "#2563EB"),
      start: "20 Nov", due: "—", estimate: 5,
      tags: <>{tag(t.design, "#9333B8")}</>,
      people: <>{person("Madina Rahimova", "#A4498B")}</>,
    },
    {
      taskKey: "WEB-1", title: t.checkout, overdue: true,
      status: "inProgress", statusIcon: mark(Contrast, "#3B82F6"), priority: mark(OctagonExclamationPoint, "#DC2626"),
      start: "—", due: "24 Nov", estimate: 3,
      tags: <>{tag(t.bug, "#DC2626")}{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Madina Rahimova", "#A4498B")}{person("Daler Saidov", "#3879A1")}</>,
    },
    {
      taskKey: "WEB-3", title: t.uploads,
      status: "inProgress", statusIcon: mark(Contrast, "#3B82F6"), priority: mark(SignalHigh, "#EA580C"),
      start: "20 Nov", due: "27 Nov", estimate: 8,
      tags: <>{tag(t.backend, "#047857")}</>,
      people: <>{person("Daler Saidov", "#3879A1")}{person("Farrukh Karimov", "#5D53A2")}</>,
    },
    {
      taskKey: "WEB-9", title: t.pushNotifications,
      status: "inProgress", statusIcon: mark(Contrast, "#3B82F6"), priority: mark(SignalMedium, "#D97706"),
      start: "—", due: "1 Dec", estimate: 2,
      tags: <>{tag(t.feature, "#1D64B5")}{tag(t.backend, "#047857")}</>,
      people: <>{person("Nur Usmonov", "#20806C")}</>,
    },
    {
      taskKey: "WEB-12", title: t.expired,
      status: "inProgress", statusIcon: mark(Contrast, "#3B82F6"), priority: mark(SignalMedium, "#D97706"),
      start: "20 Nov", due: "29 Nov", estimate: 5,
      tags: <>{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Anna Petrova", "#B66325")}</>,
    },
    {
      taskKey: "WEB-5", title: t.billing,
      status: "inReview", statusIcon: mark(Contrast, "#8B5CF6"), priority: mark(SignalHigh, "#EA580C"),
      start: "—", due: "27 Nov", estimate: 3,
      tags: <>{tag(t.bug, "#DC2626")}</>,
      people: <>{person("Madina Rahimova", "#A4498B")}</>,
    },
    {
      taskKey: "WEB-13", title: t.focus,
      status: "inReview", statusIcon: mark(Contrast, "#8B5CF6"), priority: mark(SignalLow, "#2563EB"),
      start: "20 Nov", due: "30 Nov", estimate: 8,
      tags: <>{tag(t.design, "#9333B8")}</>,
      people: <>{person("Nur Usmonov", "#20806C")}</>,
    },
    {
      taskKey: "WEB-2", title: t.success,
      status: "done", statusIcon: mark(CircleCheck, "#10B981"), priority: mark(SignalMedium, "#D97706"),
      start: "—", due: "23 Nov", estimate: 2,
      tags: <>{tag(t.design, "#9333B8")}</>,
      people: <>{person("Anna Petrova", "#B66325")}</>,
    },
    {
      taskKey: "WEB-4", title: t.session,
      status: "done", statusIcon: mark(CircleCheck, "#10B981"), priority: mark(SignalHigh, "#EA580C"),
      start: "20 Nov", due: "21 Nov", estimate: 5,
      tags: <>{tag(t.backend, "#047857")}</>,
      people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
    },
    {
      taskKey: "WEB-6", title: t.emptyStates,
      status: "done", statusIcon: mark(CircleCheck, "#10B981"), priority: mark(SignalLow, "#2563EB"),
      start: "—", due: "22 Nov", estimate: 3,
      tags: <>{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Madina Rahimova", "#A4498B")}</>,
    },
    {
      taskKey: "WEB-8", title: t.redirect,
      status: "cancelled", statusIcon: mark(CircleX, "#EF4444"), priority: mark(Minus),
      start: "20 Nov", due: "—", estimate: 8,
    },
    {
      taskKey: "WEB-14", title: t.banner,
      status: "cancelled", statusIcon: mark(CircleX, "#EF4444"), priority: mark(SignalLow, "#2563EB"),
      start: "—", due: "—", estimate: 2,
    },
    {
      taskKey: "WEB-15", title: t.loading,
      status: "backlog", statusIcon: mark(CircleDashed), priority: mark(SignalLow, "#2563EB"),
      start: "20 Nov", due: "4 Dec", estimate: 5,
      tags: <>{tag(t.design, "#9333B8")}</>,
      people: <>{person("Anna Petrova", "#B66325")}</>,
    },
    {
      taskKey: "WEB-17", title: t.datePicker,
      status: "inProgress", statusIcon: mark(Contrast, "#3B82F6"), priority: mark(SignalMedium, "#D97706"),
      start: "—", due: "3 Dec", estimate: 3,
      tags: <>{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Nur Usmonov", "#20806C")}</>,
    },
    {
      taskKey: "WEB-19", title: t.documentLabels,
      status: "done", statusIcon: mark(CircleCheck, "#10B981"), priority: mark(Minus),
      start: "20 Nov", due: "25 Nov", estimate: 8,
      people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
    },
  ];
  const visibleTasks = getVisibleTasks(demoTasks, search, statusFilter);

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[t.team, t.website, t.tasks]} title={t.website}><NewTaskDialog /></PageHeading>
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-[8px] border-b border-border px-[22px] pb-[8px]">
          <Tabs value="table">
            <TabsList className="gap-[4px] border-b-0">
              <TabsTrigger value="list" asChild className={viewTab}>
                <Link href={`${path}/tasks`}><List className="size-[14px]" aria-hidden="true" />{t.list}</Link>
              </TabsTrigger>
              <TabsTrigger value="board" asChild className={viewTab}>
                <Link href={`${path}/tasks/board`}><Columns3 className="size-[14px]" aria-hidden="true" />{t.board}</Link>
              </TabsTrigger>
              <TabsTrigger value="table" asChild className={viewTab}>
                <Link href={`${path}/tasks/table`}><TableProperties className="size-[14px]" aria-hidden="true" />{t.table}</Link>
              </TabsTrigger>
              <TabsTrigger value="calendar" asChild className={viewTab}>
                <Link href={`${path}/tasks/calendar`}><CalendarDays className="size-[14px]" aria-hidden="true" />{t.calendar}</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-[8px]">
            <div className="relative">
              <Label htmlFor="task-search" className="sr-only">{t.search}</Label>
              <Search className="pointer-events-none absolute top-[8px] left-[9px] size-[15px] text-muted-foreground" aria-hidden="true" />
              <Input
                id="task-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className="h-[32px] w-[144px] pl-[30px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-w-[97px] whitespace-nowrap"
                  aria-label={statusFilter ? `${t.filters} (${t[statusFilter]})` : t.filters}
                >
                  <ListFilter />
                  {statusFilter ? t[statusFilter] : t.filters}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {taskStatuses.map((status) => (
                  <DropdownMenuItem key={status} onSelect={() => toggleStatus(status)}>
                    {t[status]}
                    {status === statusFilter && <Check className="ml-auto" aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
          </div>
        </div>
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className={`${header} pl-[24px]`}>{t.key}</TableHead>
              <TableHead className={header}>{t.title}</TableHead>
              <TableHead className={header}>{t.status}</TableHead>
              <TableHead className={header}>{t.priority}</TableHead>
              <TableHead className={header}>{t.assignees}</TableHead>
              <TableHead className={header}>{t.labels}</TableHead>
              <TableHead className={header}>{t.startDate}</TableHead>
              <TableHead className={header}>{t.dueDate}</TableHead>
              <TableHead className={header}>{t.estimate}</TableHead>
              <TableHead className={header}>{t.created}</TableHead>
              <TableHead className={`${header} pr-[24px]`}>{t.updated}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{visibleTasks.map(renderTaskRow)}</TableBody>
        </Table>
        <p
          role="status"
          className={visibleTasks.length ? "sr-only" : "px-[24px] py-[16px] text-[13px] text-muted-foreground"}
        >
          {visibleTasks.length} {t.tasks.toLowerCase()}
        </p>
      </main>
    </div>
  );
}
