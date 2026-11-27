"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CircleCheck, CircleDashed, Contrast, Minus, MoreHorizontal, Plus, SignalHigh, SignalLow, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
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

export default function MyTasksPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const path = `/workspaces/${workspaceId}/my-tasks`;
  const t = translations.en;
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
      <WorkspaceSidebar active="my-tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[t.team, t.myTasks]} title={t.myTasks} />
        <Tabs value="assigned">
          <TabsList className="h-[40px] items-end gap-[25px] px-[24px]">
            <TabsTrigger value="assigned" asChild className={tabLink}>
              <Link href={path}>{t.assignedToMe}</Link>
            </TabsTrigger>
            <TabsTrigger value="created" asChild className={tabLink}>
              <Link href={`${path}/created`}>{t.createdByMe}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="min-w-[880px]">
          <div className={`${columns} h-[34px] ${meta}`}>
            <span /><span /><span>{t.title}</span><span>{t.labels}</span><span>{t.dueDate}</span><span>{t.assignees}</span><span />
          </div>
          {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
          {statusGroup(t.inProgress, 1, mark(Contrast, "#3B82F6"))}
          {taskRow({
            taskKey: "WEB-3", title: t.uploads, priority: mark(SignalHigh, "#EA580C"),
            date: "27 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Daler Saidov", "#3879A1")}{person("Farrukh Karimov", "#5D53A2")}</>,
          })}

          {statusGroup(t.backlog, 1, mark(CircleDashed))}
          {taskRow({
            taskKey: "WEB-18", title: t.backups, priority: mark(SignalLow, "#2563EB"),
            date: "30 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}

          {statusGroup(t.done, 2, mark(CircleCheck, "#10B981"))}
          {taskRow({
            taskKey: "WEB-4", title: t.session, priority: mark(SignalHigh, "#EA580C"),
            date: "21 Nov",
            tags: <>{tag(t.backend, "#047857")}</>,
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}
          {taskRow({
            taskKey: "WEB-19", title: t.documentLabels, priority: mark(Minus),
            date: "25 Nov",
            people: <>{person("Farrukh Karimov", "#5D53A2")}</>,
          })}
        </div>
      </main>
    </div>
  );
}
