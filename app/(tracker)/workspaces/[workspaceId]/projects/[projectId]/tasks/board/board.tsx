"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Circle, CircleCheck, CircleDashed, CircleX, Columns3, Contrast, List, ListFilter, Minus, OctagonExclamationPoint, Plus, Search, SignalHigh, SignalLow, SignalMedium, SlidersHorizontal, TableProperties, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { useBoardStore } from "@/app/(tracker)/workspaces/store/board-store";
import NewTaskDialog from "../dialogs/new-task-dialog";
import translations from "./page-translations.json";

interface BoardCard {
  taskKey: string;
  title: string;
  priority: ReactNode;
  href?: string;
  date?: string;
  overdue?: boolean;
  tags?: ReactNode;
  people?: ReactNode;
}

export default function BoardPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}`;
  const t = translations.en;
  const { moved, setMoved } = useBoardStore();

  useEffect(() => () => setMoved(false), [path, setMoved]);

  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const column = "flex min-h-[682px] min-w-0 flex-col gap-[8px] rounded-[8px] bg-muted p-[5px]";
  const meta = "text-[12px] text-muted-foreground";
  const title = "line-clamp-2 text-[13px] leading-[16px] font-medium";
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

  function columnHeading(name: string, count: number, icon: ReactNode) {
    return (
      <div className="flex h-[30px] items-center gap-[6px] px-[4px] text-[13px] font-semibold">
        {icon}<h2 className="min-w-0 flex-1 truncate">{name}</h2>
        <span className={meta}>{count}</span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.addTask}><Plus /></Button>
      </div>
    );
  }

  function taskCard({ taskKey, title: name, priority, href, date, overdue, tags, people }: BoardCard) {
    return (
      <Card className="min-h-[108px] gap-[4px] px-[8px] py-[7px]">
        <div className="flex items-center justify-between gap-[6px]"><span className={meta}>{taskKey}</span>{priority}</div>
        {href ? <Link href={href} title={name} className={`${title} hover:underline`}>{name}</Link> : <p title={name} className={title}>{name}</p>}
        <div className={badges}>{tags}</div>
        <div className="mt-auto flex min-h-[15px] items-center justify-between">
          <span className={overdue ? "text-[11px] text-destructive" : meta}>{date}</span>
          <div className={avatars}>{people}</div>
        </div>
      </Card>
    );
  }

  const checkoutCard = taskCard({
      taskKey: "WEB-1", title: t.checkout, priority: mark(OctagonExclamationPoint, "#DC2626"),
      href: `${path}/tasks/web-1`, overdue: true,
      date: "24 Nov",
      tags: <>{tag(t.bug, "#DC2626")}{tag(t.frontend, "#B45309")}</>,
      people: <>{person("Madina Rahimova", "#A4498B")}{person("Daler Saidov", "#3879A1")}</>,
    });

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[t.team, t.website, t.tasks]} title={t.website}><NewTaskDialog /></PageHeading>
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-[8px] border-b border-border px-[22px] pb-[8px]">
          <Tabs value="board">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setMoved(true)}>{t.showMoved}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setMoved(false)}>{t.showOriginal}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid min-w-[1084px] grid-cols-[repeat(6,minmax(0,1fr))] gap-[12px] px-[24px] py-[20px]">
          {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
          <section className={column} aria-label={t.backlog}>
            {columnHeading(t.backlog, 4, mark(CircleDashed))}
            {taskCard({
                taskKey: "WEB-18", title: t.backups, priority: mark(SignalLow, "#2563EB"),
                date: "30 Nov",
                tags: <>{tag(t.backend, "#047857")}</>,
                people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
              })}
            {taskCard({
                taskKey: "WEB-20", title: t.keyboard, priority: mark(SignalLow, "#2563EB"),
                date: "2 Dec",
                tags: <>{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Nur Usmonov", "#20806C")}</>,
              })}
            {taskCard({
                taskKey: "WEB-16", title: t.logs, priority: mark(Minus),
                tags: <>{tag(t.backend, "#047857")}</>,
                people: <>{person("Daler Saidov", "#3879A1")}</>,
              })}
            {taskCard({
                taskKey: "WEB-15", title: t.loading, priority: mark(SignalLow, "#2563EB"),
                date: "4 Dec",
                tags: <>{tag(t.design, "#9333B8")}</>,
                people: <>{person("Anna Petrova", "#B66325")}</>,
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
          <section className={column} aria-label={t.todo}>
            {columnHeading(t.todo, 3, mark(Circle))}
            {taskCard({
                taskKey: "WEB-7", title: t.passwordMeter, priority: mark(SignalHigh, "#EA580C"),
                date: "30 Nov",
                tags: <>{tag(t.feature, "#1D64B5")}{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Daler Saidov", "#3879A1")}{person("Anna Petrova", "#B66325")}</>,
              })}
            {taskCard({
                taskKey: "WEB-10", title: t.darkMode, priority: mark(SignalMedium, "#D97706"),
                date: "3 Dec",
                tags: <>{tag(t.design, "#9333B8")}{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Nur Usmonov", "#20806C")}</>,
              })}
            {taskCard({
                taskKey: "WEB-11", title: t.errors, priority: mark(SignalLow, "#2563EB"),
                tags: <>{tag(t.design, "#9333B8")}</>,
                people: <>{person("Madina Rahimova", "#A4498B")}</>,
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
          <section className={column} aria-label={t.inProgress}>
            {columnHeading(t.inProgress, moved ? 4 : 5, mark(Contrast, "#3B82F6"))}
            {!moved && checkoutCard}
            {taskCard({
                taskKey: "WEB-3", title: t.uploads, priority: mark(SignalHigh, "#EA580C"),
                date: "27 Nov",
                tags: <>{tag(t.backend, "#047857")}</>,
                people: <>{person("Daler Saidov", "#3879A1")}{person("Farrukh Karimov", "#5D53A2")}</>,
              })}
            {taskCard({
                taskKey: "WEB-9", title: t.pushNotifications, priority: mark(SignalMedium, "#D97706"),
                date: "1 Dec",
                tags: <>{tag(t.feature, "#1D64B5")}{tag(t.backend, "#047857")}</>,
                people: <>{person("Nur Usmonov", "#20806C")}</>,
              })}
            {taskCard({
                taskKey: "WEB-12", title: t.expired, priority: mark(SignalMedium, "#D97706"),
                date: "29 Nov",
                tags: <>{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Anna Petrova", "#B66325")}</>,
              })}
            {taskCard({
                taskKey: "WEB-17", title: t.datePicker, priority: mark(SignalMedium, "#D97706"),
                date: "3 Dec",
                tags: <>{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Nur Usmonov", "#20806C")}</>,
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
          <section className={column} aria-label={t.inReview}>
            {columnHeading(t.inReview, moved ? 3 : 2, mark(Contrast, "#8B5CF6"))}
            {moved && checkoutCard}
            {taskCard({
                taskKey: "WEB-5", title: t.billing, priority: mark(SignalHigh, "#EA580C"),
                date: "27 Nov",
                tags: <>{tag(t.bug, "#DC2626")}</>,
                people: <>{person("Madina Rahimova", "#A4498B")}</>,
              })}
            {taskCard({
                taskKey: "WEB-13", title: t.focus, priority: mark(SignalLow, "#2563EB"),
                date: "30 Nov",
                tags: <>{tag(t.design, "#9333B8")}</>,
                people: <>{person("Nur Usmonov", "#20806C")}</>,
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
          <section className={column} aria-label={t.done}>
            {columnHeading(t.done, 4, mark(CircleCheck, "#10B981"))}
            {taskCard({
                taskKey: "WEB-2", title: t.success, priority: mark(SignalMedium, "#D97706"),
                date: "23 Nov",
                tags: <>{tag(t.design, "#9333B8")}</>,
                people: <>{person("Anna Petrova", "#B66325")}</>,
              })}
            {taskCard({
                taskKey: "WEB-4", title: t.session, priority: mark(SignalHigh, "#EA580C"),
                date: "21 Nov",
                tags: <>{tag(t.backend, "#047857")}</>,
                people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
              })}
            {taskCard({
                taskKey: "WEB-6", title: t.emptyStates, priority: mark(SignalLow, "#2563EB"),
                date: "22 Nov",
                tags: <>{tag(t.frontend, "#B45309")}</>,
                people: <>{person("Madina Rahimova", "#A4498B")}</>,
              })}
            {taskCard({
                taskKey: "WEB-19", title: t.documentLabels, priority: mark(Minus),
                date: "25 Nov",
                people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
          <section className={column} aria-label={t.cancelled}>
            {columnHeading(t.cancelled, 2, mark(CircleX, "#EF4444"))}
            {taskCard({
                taskKey: "WEB-8", title: t.redirect, priority: mark(Minus),
              })}
            {taskCard({
                taskKey: "WEB-14", title: t.banner, priority: mark(SignalLow, "#2563EB"),
              })}
            <Button type="button" variant="ghost" size="icon-sm" className="self-start" aria-label={t.addTask}><Plus /></Button>
          </section>
        </div>
      </main>
    </div>
  );
}
