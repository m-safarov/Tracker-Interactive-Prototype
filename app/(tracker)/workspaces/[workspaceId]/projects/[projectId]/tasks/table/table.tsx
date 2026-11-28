"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TaskListPage from "../task-list";
import translations from "./page-translations.json";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
}

export default function TablePage() {
  const t = translations.en;
  const cell = "h-[36px] whitespace-nowrap px-[8px]";
  const head = "whitespace-nowrap px-[8px]";
  const meta = cell + " text-muted-foreground";

  return (
    <TaskListPage view="table">
      {({ tasks, states, showDates, taskPath }) => (
        <div className="px-[16px] py-[8px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={head}>{t.key}</TableHead>
                <TableHead className={head}>{t.title}</TableHead>
                <TableHead className={head}>{t.status}</TableHead>
                <TableHead className={head}>{t.priority}</TableHead>
                {showDates && <TableHead className={head}>{t.startDate}</TableHead>}
                {showDates && <TableHead className={head}>{t.dueDate}</TableHead>}
                <TableHead className={head}>{t.estimate}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((el) => (
                <TableRow key={el.id} className="hover:bg-muted/50">
                  <TableCell className={meta}>{el.taskKey}</TableCell>
                  <TableCell className="h-[36px] min-w-[180px] px-[8px]">
                    <Link href={taskPath + "/" + encodeURIComponent(el.id)} className="font-medium hover:underline">{el.title}</Link>
                  </TableCell>
                  <TableCell className={cell}>{states.find((state) => state.id === el.state_id)?.name ?? "—"}</TableCell>
                  <TableCell className={cell + " capitalize"}>{el.priority === "none" ? "—" : el.priority}</TableCell>
                  {showDates && <TableCell className={meta}>{formatDate(el.start_date)}</TableCell>}
                  {showDates && <TableCell className={meta}>{formatDate(el.due_date)}</TableCell>}
                  <TableCell className={meta}>{el.estimate_points ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TaskListPage>
  );
}
