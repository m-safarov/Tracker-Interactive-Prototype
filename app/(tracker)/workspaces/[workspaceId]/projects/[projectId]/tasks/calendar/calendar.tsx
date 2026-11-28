"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Columns3, List, ListFilter, Search, SlidersHorizontal, TableProperties } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { useCalendarStore } from "@/app/(tracker)/workspaces/store/calendar-store";
import NewTaskDialog from "../dialogs/new-task-dialog";
import translations from "./page-translations.json";

const t = translations.en;
const demoMonth = new Date(2026, 10, 1);

// Намуна: вазифаҳои моҳи ноябри 2026 то пайваст шудани API.
const demoTasks: Record<number, { key: string; title: string; detailId?: string } | undefined> = {
  24: { key: "WEB-1", title: t.checkoutShort, detailId: "web-1" },
  25: { key: "WEB-19", title: t.documentLabels },
  27: { key: "WEB-5", title: t.billing },
  29: { key: "WEB-12", title: t.expired },
};

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysBeforeMonth = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((daysBeforeMonth + daysInMonth) / 7);

  return Array.from({ length: weeks * 7 }, (_, index) =>
    new Date(year, month, index - daysBeforeMonth + 1),
  );
}

export default function CalendarPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}`;
  const { today, selectedMonth, search, setToday, setSearch, moveMonth, goToToday, reset } = useCalendarStore();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setToday(new Date()));
    return () => {
      cancelAnimationFrame(frame);
      reset();
    };
  }, [path, reset, setToday]);

  const visibleMonth = selectedMonth ?? today ?? demoMonth;
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = getCalendarDays(year, month);
  const monthTitle = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const searchText = search.trim().toLowerCase();
  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const grid = "grid grid-cols-[repeat(7,minmax(0,1fr))]";
  const weekday = "px-[10px] text-[12px] text-muted-foreground";
  const cell = "min-h-[117px] min-w-0 border-r border-b border-border p-[9px] text-[12px]";

  function renderDay(day: Date) {
    const date = day.getDate();
    const isToday = day.toDateString() === today?.toDateString();
    const outsideMonth = day.getMonth() !== month;
    const isDemoMonth = day.getFullYear() === demoMonth.getFullYear() && day.getMonth() === demoMonth.getMonth();
    const task = isDemoMonth ? demoTasks[date] : undefined;
    const showTask = task && `${task.key} ${task.title}`.toLowerCase().includes(searchText);

    return (
      <div key={day.toDateString()} className={`${cell} ${isToday ? "bg-primary/10 font-semibold" : ""}`}>
        <span className={outsideMonth ? "text-muted-foreground" : ""} aria-current={isToday ? "date" : undefined}>{date}</span>
        {showTask && renderTask(task.key, task.title, task.detailId)}
      </div>
    );
  }

  function renderTask(taskKey: string, name: string, detailId?: string) {
    const card = (
      <div className="mt-[6px] [&>div]:bg-muted">
        <Card className="min-h-[43px] gap-[1px] px-[6px] py-[4px]">
          <span className="text-[11px] leading-[13px] text-muted-foreground">{taskKey}</span>
          <span className="line-clamp-1 text-[12px] leading-[14px] font-medium">{name}</span>
        </Card>
      </div>
    );
    return detailId
      ? <Link href={`${path}/tasks/${detailId}`} className="block hover:underline">{card}</Link>
      : card;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="min-w-0 flex-1 overflow-auto">
        <PageHeading crumbs={[t.team, t.website, t.tasks]} title={t.website}><NewTaskDialog /></PageHeading>
        <div className="flex min-h-[36px] flex-wrap items-center justify-between gap-[8px] border-b border-border px-[22px] pb-[8px]">
          <Tabs value="calendar">
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
            <Button type="button" variant="outline" size="sm" className="w-[97px]"><ListFilter />{t.filters}</Button>
            <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
          </div>
        </div>
        <section className="min-w-[790px] px-[24px] pt-[12px] pb-[24px]">
          <div className="mb-[18px] flex items-center justify-between pr-[72px]">
            <h2 className="text-[16px] font-semibold" aria-live="polite">{monthTitle}</h2>
            <div className="flex items-center gap-[10px]">
              <Button type="button" variant="outline" size="sm" className="w-[76px]" onClick={goToToday}>{t.today}</Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.previous} onClick={() => moveMonth(-1, demoMonth)}><ArrowLeft /></Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.next} onClick={() => moveMonth(1, demoMonth)}><ArrowRight /></Button>
            </div>
          </div>
          <div className={`${grid} mb-[4px]`}>
            <span className={weekday}>{t.monday}</span><span className={weekday}>{t.tuesday}</span><span className={weekday}>{t.wednesday}</span>
            <span className={weekday}>{t.thursday}</span><span className={weekday}>{t.friday}</span><span className={weekday}>{t.saturday}</span>
            <span className={weekday}>{t.sunday}</span>
          </div>
          <div className={`${grid} border-t border-l border-border`}>
            {days.map((el) => renderDay(el))}
          </div>
        </section>
      </main>
    </div>
  );
}
