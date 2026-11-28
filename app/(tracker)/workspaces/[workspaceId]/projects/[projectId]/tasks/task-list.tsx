"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Circle, CircleCheck, CircleDashed, CircleX, Columns3, Contrast, List, ListFilter, Minus, MoreHorizontal, OctagonExclamationPoint, Plus, Search, SignalHigh, SignalLow, SignalMedium, SlidersHorizontal, TableProperties, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewTaskDialog from "./dialogs/new-task-dialog";
import TaskDetailSheet from "./dialogs/task-detail-sheet";
import translations from "./page-translations.json";

interface TaskRow {
  taskKey: string;
  title: ReactNode;
  priority: ReactNode;
  date?: string;
  overdue?: boolean;
  tags?: ReactNode;
  people?: ReactNode;
}

export default function TaskListPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}`;
  const t = translations.en;
  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const columns = "grid grid-cols-[16px_61px_minmax(0,1fr)_232px_106px_70px_14px] items-center gap-[8px] px-[24px]";
  const row = `${columns} h-[36px] border-b border-border text-[13px] hover:bg-muted/50`;
  const meta = "text-[12px] text-muted-foreground";
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

  function statusGroup(title: string, count: number, icon: ReactNode) {
    return (
      <div className="flex h-[36px] items-center gap-[8px] border-y border-border bg-muted px-[24px] text-[13px] font-semibold">
        {icon}{title}
        <Badge variant="outline" className="ml-[16px] h-[20px] px-[6px]">{count}</Badge>
        <Button type="button" variant="ghost" size="icon-sm" className="ml-auto -mr-[8px]" aria-label={t.addTask}><Plus /></Button>
      </div>
    );
  }

  function taskRow({ taskKey, title, priority, date, overdue, tags, people }: TaskRow) {
    return (
      <div className={row}>
        {priority}
        <span className={meta}>{taskKey}</span>
        <div className="min-w-0 truncate">{title}</div>
        <div className={badges}>{tags}</div>
        <span className={overdue ? "text-[12px] text-destructive" : meta}>{date ?? "—"}</span>
        <div className={avatars}>{people}</div>
        <Button type="button" variant="ghost" size="icon-sm" className="-ml-[7px]" aria-label={t.menu}><MoreHorizontal /></Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[t.team, t.website, t.tasks]} title={t.website}><NewTaskDialog /></PageHeading>
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-[8px] border-b border-border px-[22px] pb-[8px]">
          <Tabs value="list">
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
              <Input id="task-search" type="search" placeholder={t.search} className="h-[32px] w-[144px] pl-[30px]" />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-[97px]"><ListFilter />{t.filters}</Button>
            <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
          </div>
        </div>
        <div className="min-w-[880px]">
          <div className={`${columns} h-[34px] ${meta}`}>
            <span /><span /><span>{t.title}</span><span>{t.labels}</span><span>{t.dueDate}</span><span>{t.assignees}</span><span />
          </div>
          {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
          {statusGroup(t.inProgress, 5, mark(Contrast, "#3B82F6"))}
          {taskRow({
            taskKey: "WEB-1", title: <TaskDetailSheet />, priority: mark(OctagonExclamationPoint, "#DC2626"),
            date: "24 Nov", overdue: true,
            tags: <>{tag(t.bug, "#DC2626")}{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Madina Rahimova", "#A4498B")}{person("Daler Saidov", "#3879A1")}</>,
          })}
          {taskRow({
            taskKey: "WEB-3", title: t.uploads, priority: mark(SignalHigh, "#EA580C"),
            date: "27 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Daler Saidov", "#3879A1")}{person("Farrukh Karimov", "#5D53A2")}</>,
          })}
          {taskRow({
            taskKey: "WEB-9", title: t.pushNotifications, priority: mark(SignalMedium, "#D97706"),
            date: "1 Dec",
            tags: <>{tag(t.feature, "#1D64B5")}{tag(t.backend, "#047857")}</>,
            people: <>{person("Nur Usmonov", "#20806C")}</>,
          })}
          {taskRow({
            taskKey: "WEB-12", title: t.expired, priority: mark(SignalMedium, "#D97706"),
            date: "29 Nov",
            tags: <>{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Anna Petrova", "#B66325")}</>,
          })}
          {taskRow({
            taskKey: "WEB-17", title: t.datePicker, priority: mark(SignalMedium, "#D97706"),
            date: "3 Dec",
            tags: <>{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Nur Usmonov", "#20806C")}</>,
          })}

          {statusGroup(t.todo, 3, mark(Circle))}
          {taskRow({
            taskKey: "WEB-7", title: t.passwordMeter, priority: mark(SignalHigh, "#EA580C"),
            date: "30 Nov",
            tags: <>{tag(t.feature, "#1D64B5")}{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Daler Saidov", "#3879A1")}{person("Anna Petrova", "#B66325")}</>,
          })}
          {taskRow({
            taskKey: "WEB-10", title: t.darkMode, priority: mark(SignalMedium, "#D97706"),
            date: "3 Dec",
            tags: <>{tag(t.design, "#9333B8")}{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Nur Usmonov", "#20806C")}</>,
          })}
          {taskRow({
            taskKey: "WEB-11", title: t.errors, priority: mark(SignalLow, "#2563EB"),
            tags: <>{tag(t.design, "#9333B8")}</>,
            people: <>{person("Madina Rahimova", "#A4498B")}</>,
          })}

          {statusGroup(t.inReview, 2, mark(Contrast, "#8B5CF6"))}
          {taskRow({
            taskKey: "WEB-5", title: t.billing, priority: mark(SignalHigh, "#EA580C"),
            date: "27 Nov",
            tags: <>{tag(t.bug, "#DC2626")}</>,
            people: <>{person("Madina Rahimova", "#A4498B")}</>,
          })}
          {taskRow({
            taskKey: "WEB-13", title: t.focus, priority: mark(SignalLow, "#2563EB"),
            date: "30 Nov",
            tags: <>{tag(t.design, "#9333B8")}</>,
            people: <>{person("Nur Usmonov", "#20806C")}</>,
          })}

          {statusGroup(t.backlog, 4, mark(CircleDashed))}
          {taskRow({
            taskKey: "WEB-18", title: t.backups, priority: mark(SignalLow, "#2563EB"),
            date: "30 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}
          {taskRow({
            taskKey: "WEB-20", title: t.keyboard, priority: mark(SignalLow, "#2563EB"),
            date: "2 Dec",
            tags: <>{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Nur Usmonov", "#20806C")}</>,
          })}
          {taskRow({
            taskKey: "WEB-16", title: t.logs, priority: mark(Minus),
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Daler Saidov", "#3879A1")}</>,
          })}
          {taskRow({
            taskKey: "WEB-15", title: t.loading, priority: mark(SignalLow, "#2563EB"),
            date: "4 Dec",
            tags: <>{tag(t.design, "#9333B8")}</>,
            people: <>{person("Anna Petrova", "#B66325")}</>,
          })}

          {statusGroup(t.done, 4, mark(CircleCheck, "#10B981"))}
          {taskRow({
            taskKey: "WEB-2", title: t.success, priority: mark(SignalMedium, "#D97706"),
            date: "23 Nov",
            tags: <>{tag(t.design, "#9333B8")}</>,
            people: <>{person("Anna Petrova", "#B66325")}</>,
          })}
          {taskRow({
            taskKey: "WEB-4", title: t.session, priority: mark(SignalHigh, "#EA580C"),
            date: "21 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}
          {taskRow({
            taskKey: "WEB-6", title: t.emptyStates, priority: mark(SignalLow, "#2563EB"),
            date: "22 Nov",
            tags: <>{tag(t.frontend, "#B45309")}</>,
            people: <>{person("Madina Rahimova", "#A4498B")}</>,
          })}
          {taskRow({
            taskKey: "WEB-19", title: t.documentLabels, priority: mark(Minus),
            date: "25 Nov",
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}

          {statusGroup(t.cancelled, 2, mark(CircleX, "#EF4444"))}
          {taskRow({
            taskKey: "WEB-8", title: t.redirect, priority: mark(Minus),
          })}
          {taskRow({
            taskKey: "WEB-14", title: t.banner, priority: mark(SignalLow, "#2563EB"),
          })}
        </div>
      </main>
    </div>
  );
}
