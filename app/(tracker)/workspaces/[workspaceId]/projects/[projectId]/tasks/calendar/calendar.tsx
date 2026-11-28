"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskListPage from "../task-list";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

type ViewData = Parameters<NonNullable<ComponentProps<typeof TaskListPage>["children"]>>[0];
type Task = ViewData["tasks"][number];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysBeforeMonth = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((daysBeforeMonth + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, index) => new Date(year, month, index - daysBeforeMonth + 1));
}

function dayKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function renderTask(task: Task, { taskPath, editIssue, saving }: ViewData) {
  const date = task.due_date ? new Date(task.due_date) : null;

  return (
    <div key={task.id} className="my-[4px] flex flex-col gap-[4px] rounded-[5px] bg-primary/10 p-[6px]">
      <Link href={taskPath + "/" + encodeURIComponent(task.id)} className="block break-words font-medium hover:underline">
        {task.taskKey} {task.title}
      </Link>
      {date && (
        <time dateTime={dayKey(date)} className="text-muted-foreground">
          {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </time>
      )}
      <form key={task.due_date} className="flex flex-wrap gap-[4px]" onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("due_date");
        if (typeof value === "string") {
          editIssue(task.id, { due_date: value ? new Date(value + "T00:00:00").toISOString() : null });
        }
      }}>
        <Input name="due_date" type="date" aria-label={"Due date for " + task.taskKey} className="h-[28px] min-w-0 px-[4px]"
          defaultValue={date ? dayKey(date) : ""} disabled={saving} />
        <Button type="submit" variant="outline" size="sm" disabled={saving}>Save date</Button>
      </form>
    </div>
  );
}

export default function CalendarPage() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const { language } = usePreferencesStore();
  const t = translations[language];
  const today = new Date();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = getCalendarDays(year, month);
  const weekdays = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];
  const grid = "grid grid-cols-[repeat(7,minmax(0,1fr))]";
  const cell = "min-h-[117px] min-w-0 border-r border-b border-border p-[9px] text-[12px]";

  function moveMonth(direction: -1 | 1) {
    setVisibleMonth(new Date(year, month + direction, 1));
  }

  return (
    <TaskListPage view="calendar">
      {(data) => {
        const unscheduled = data.tasks.filter((el) => !el.due_date);
        return (
          <div className="min-w-[740px]">
            <div className="flex items-center justify-between px-[24px] py-[12px]">
              <h2 className="font-semibold">{visibleMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
              <div className="flex gap-[4px]">
                <Button type="button" variant="outline" size="sm" onClick={() => setVisibleMonth(new Date())}>{t.today}</Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t.previous} onClick={() => moveMonth(-1)}><ArrowLeft /></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t.next} onClick={() => moveMonth(1)}><ArrowRight /></Button>
              </div>
            </div>
            <div className={grid + " border-y border-border py-[6px]"}>
              {weekdays.map((el) => <span key={el} className="px-[10px] text-[12px] text-muted-foreground">{el}</span>)}
            </div>
            <div className={grid}>
              {days.map((el) => (
                <div key={dayKey(el)} className={cell + (el.getMonth() !== month ? " bg-muted/40" : "")}>
                  <time dateTime={dayKey(el)} className={dayKey(el) === dayKey(today) ? "font-semibold text-primary" : undefined}>{el.getDate()}</time>
                  {data.tasks.filter((task) => task.due_date && dayKey(new Date(task.due_date)) === dayKey(el))
                    .map((el) => renderTask(el, data))}
                </div>
              ))}
            </div>
            {unscheduled.length > 0 && (
              <section className="px-[24px] py-[12px]">
                <h2 className="text-[13px] font-semibold">No due date</h2>
                <div className="grid grid-cols-4 gap-[8px]">{unscheduled.map((el) => renderTask(el, data))}</div>
              </section>
            )}
          </div>
        );
      }}
    </TaskListPage>
  );
}
