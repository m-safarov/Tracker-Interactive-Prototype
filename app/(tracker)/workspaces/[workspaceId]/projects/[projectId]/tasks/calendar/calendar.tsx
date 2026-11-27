"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Columns3, List, ListFilter, Search, SlidersHorizontal, TableProperties } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewTaskDialog from "../dialogs/new-task-dialog";
import translations from "./page-translations.json";

export default function CalendarPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}`;
  const t = translations.en;
  const viewTab = "flex h-[30px] items-center gap-[6px] rounded-[5px] border-b-0 px-[10px] pb-[0px] text-[12px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
  const grid = "grid grid-cols-[repeat(7,minmax(0,1fr))]";
  const weekday = "px-[10px] text-[12px] text-muted-foreground";
  const cell = "min-h-[117px] min-w-0 border-r border-b border-border p-[9px] text-[12px]";

  function dayCell(date: number, children?: ReactNode, previous = false, highlighted = false) {
    return (
      <div className={`${cell} ${highlighted ? "bg-primary/10 font-semibold" : ""}`}>
        <span className={previous ? "text-muted-foreground" : ""}>{date}</span>
        {children}
      </div>
    );
  }

  function task(taskKey: string, name: string) {
    return (
      <div className="mt-[6px] [&>div]:bg-muted">
        <Card className="min-h-[43px] gap-[1px] px-[6px] py-[4px]">
          <span className="text-[11px] leading-[13px] text-muted-foreground">{taskKey}</span>
          <span className="line-clamp-1 text-[12px] leading-[14px] font-medium">{name}</span>
        </Card>
      </div>
    );
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
              <Input id="task-search" type="search" placeholder={t.search} className="h-[32px] w-[144px] pl-[30px]" />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-[97px]"><ListFilter />{t.filters}</Button>
            <Button type="button" variant="outline" size="sm" className="w-[104px]"><SlidersHorizontal />{t.display}</Button>
          </div>
        </div>
        <section className="min-w-[790px] px-[24px] pt-[12px] pb-[24px]">
          <div className="mb-[18px] flex items-center justify-between pr-[72px]">
            <h2 className="text-[16px] font-semibold">{t.month}</h2>
            <div className="flex items-center gap-[10px]">
              <Button type="button" variant="outline" size="sm" className="w-[76px]">{t.today}</Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.previous}><ArrowLeft /></Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={t.next}><ArrowRight /></Button>
            </div>
          </div>
          <div className={`${grid} mb-[4px]`}>
            <span className={weekday}>{t.monday}</span><span className={weekday}>{t.tuesday}</span><span className={weekday}>{t.wednesday}</span>
            <span className={weekday}>{t.thursday}</span><span className={weekday}>{t.friday}</span><span className={weekday}>{t.saturday}</span>
            <span className={weekday}>{t.sunday}</span>
          </div>
          <div className={`${grid} border-t border-l border-border`}>
              {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
              {dayCell(26, undefined, true)}
              {dayCell(27, undefined, true)}
              {dayCell(28, undefined, true)}
              {dayCell(29, undefined, true)}
              {dayCell(30, undefined, true)}
              {dayCell(31, undefined, true)}
              {dayCell(1)}

              {dayCell(2)}
              {dayCell(3)}
              {dayCell(4)}
              {dayCell(5)}
              {dayCell(6)}
              {dayCell(7)}
              {dayCell(8)}

              {dayCell(9)}
              {dayCell(10)}
              {dayCell(11)}
              {dayCell(12)}
              {dayCell(13)}
              {dayCell(14)}
              {dayCell(15)}

              {dayCell(16)}
              {dayCell(17)}
              {dayCell(18)}
              {dayCell(19)}
              {dayCell(20)}
              {dayCell(21)}
              {dayCell(22)}

              {dayCell(23)}
              {dayCell(24, <Link href={`${path}/tasks/web-1`} className="block hover:underline">{task("WEB-1", t.checkoutShort)}</Link>)}
              {dayCell(25, task("WEB-19", t.documentLabels))}
              {dayCell(26, undefined, false, true)}
              {dayCell(27, task("WEB-5", t.billing))}
              {dayCell(28)}
              {dayCell(29, task("WEB-12", t.expired))}
          </div>
        </section>
      </main>
    </div>
  );
}
