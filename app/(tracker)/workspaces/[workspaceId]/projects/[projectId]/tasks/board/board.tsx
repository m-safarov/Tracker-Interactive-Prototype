"use client";

import Link from "next/link";
import { DndContext, KeyboardSensor, PointerSensor, rectIntersection, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TaskListPage from "../task-list";

type ViewData = Parameters<NonNullable<ComponentProps<typeof TaskListPage>["children"]>>[0];
type Task = ViewData["tasks"][number];

function TaskCard({ task, href, saving, showDates }: { task: Task; href: string; saving: boolean; showDates: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, disabled: saving });

  return (
    <div ref={setNodeRef} className={isDragging ? "relative z-10" : undefined}
      style={transform ? { transform: "translate3d(" + transform.x + "px," + transform.y + "px,0)" } : undefined}>
      <Card className="flex flex-col gap-[6px] rounded-[6px] p-[10px]">
        <div className="flex items-center justify-between gap-[4px]">
          <span className="text-[12px] text-muted-foreground">{task.taskKey}</span>
          <Button type="button" size="icon-sm" variant="ghost" className="cursor-grab touch-none active:cursor-grabbing"
            disabled={saving} aria-label={"Move " + task.taskKey} {...attributes} {...listeners}>
            <GripVertical aria-hidden="true" />
          </Button>
        </div>
        <Link href={href} className="line-clamp-2 text-[13px] font-medium hover:underline">{task.title}</Link>
        {showDates && (
          <span className="text-[12px] text-muted-foreground">
            {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
          </span>
        )}
      </Card>
    </div>
  );
}

function BoardColumn({ id, name, color, count, children }: { id: string; name: string; color?: string; count: number; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section ref={setNodeRef} aria-label={name} className={"flex min-h-[420px] w-[226px] shrink-0 flex-col gap-[8px] rounded-[8px] bg-muted p-[8px]" + (isOver ? " ring-2 ring-primary" : "")}>
      <div className="flex items-center gap-[8px] px-[4px] py-[4px] text-[13px] font-semibold">
        {color && <span aria-hidden="true" className="size-[8px] rounded-full" style={{ backgroundColor: color }} />}
        <h2>{name}</h2>
        <Badge variant="outline">{count}</Badge>
      </div>
      {children}
    </section>
  );
}

export default function BoardPage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  return (
    <TaskListPage view="board">
      {({ tasks, states, editIssue, saving, showDates, taskPath }) => {
        const otherTasks = tasks.filter((el) => !states.some((state) => state.id === el.state_id));
        const columns = otherTasks.length
          ? [...states, { id: "no-status", name: "No status", color: undefined }]
          : states;

        return (
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={({ active, over }) => {
            const task = tasks.find((el) => el.id === active.id);
            const state = states.find((el) => el.id === over?.id);
            if (task && state && state.id !== task.state_id && !saving) editIssue(task.id, { state_id: state.id });
          }}>
            <div className="flex gap-[12px] overflow-x-auto px-[24px] py-[12px]">
              {columns.map((el) => {
                const columnTasks = el.id === "no-status" ? otherTasks : tasks.filter((task) => task.state_id === el.id);
                return (
                  <BoardColumn key={el.id} id={el.id} name={el.name} color={el.color} count={columnTasks.length}>
                    {columnTasks.map((el) => (
                      <TaskCard key={el.id} task={el} href={taskPath + "/" + encodeURIComponent(el.id)} saving={saving} showDates={showDates} />
                    ))}
                  </BoardColumn>
                );
              })}
            </div>
          </DndContext>
        );
      }}
    </TaskListPage>
  );
}
