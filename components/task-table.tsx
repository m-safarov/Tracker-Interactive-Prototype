import type { ReactNode } from "react";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleX,
  Contrast,
  Minus,
  MoreHorizontal,
  OctagonExclamationPoint,
  Plus,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface State {
  id: string;
  name: string;
  group: string;
}

interface Issue {
  id: string;
  sequence_id: number;
  title: string;
  state_id: string;
  priority: string;
  due_date: string | null;
}

interface TaskTableProps {
  issues?: Issue[];
  states?: State[];
  identifier?: string;
  onRemove?: (id: string) => void;
}

const groupIcon: Record<string, ReactNode> = {
  backlog: <CircleDashed className="size-[14px] text-muted-foreground" />,
  unstarted: <Circle className="size-[14px]" />,
  started: <Contrast className="size-[14px] text-blue-500" />,
  completed: <CircleCheck className="size-[14px] text-emerald-500" />,
  cancelled: <CircleX className="size-[14px] text-red-500" />,
};

const priorityIcon: Record<string, ReactNode> = {
  urgent: <OctagonExclamationPoint className="size-[14px] text-red-600" />,
  high: <SignalHigh className="size-[14px] text-orange-500" />,
  medium: <SignalMedium className="size-[14px] text-orange-500" />,
  low: <SignalLow className="size-[14px] text-blue-500" />,
  none: <Minus className="size-[14px] text-muted-foreground" />,
};

// Ҷадвали вазифаҳо, ки аз рӯи статус гурӯҳ шудаанд. Дар Cycle detail ва Module detail истифода мешавад.
export default function TaskTable({ issues = [], states = [], identifier = "", onRemove }: TaskTableProps) {
  // Сутунҳо: приоритет | калид | ном | нишонаҳо | мӯҳлат | иҷрокунандагон | меню
  const columns = "grid grid-cols-[16px_70px_1fr_240px_114px_70px_32px] items-center gap-x-[8px] px-[24px]";
  const head = `${columns} h-[34px] text-[12px] text-muted-foreground`;
  const group = "flex h-[36px] items-center gap-[8px] border-y border-border bg-muted px-[24px] text-[13px] font-semibold";
  const groupCount = "ml-[24px] rounded-[4px] bg-background px-[6px] text-[11px] font-normal text-muted-foreground";
  const row = `${columns} h-[36px] border-b border-border text-[13px]`;
  const key = "text-[12px] text-muted-foreground";
  const due = "text-[12px] text-muted-foreground";

  return (
    <div className="mt-[20px] flex flex-col">
      <div className={head}>
        <span />
        <span />
        <span>Title</span>
        <span>Labels</span>
        <span>Due date</span>
        <span>Assignees</span>
        <span />
      </div>

      {/* Гурӯҳҳо: ҳар статус ва вазифаҳои он */}
      {states.map((el) => {
        const stateIssues = issues.filter((issue) => issue.state_id === el.id);
        if (stateIssues.length === 0) return null;
        return (
          <div key={el.id}>
            <div className={group}>
              {groupIcon[el.group]} {el.name}
              <span className={groupCount}>{stateIssues.length}</span>
              <Plus className="ml-auto size-[14px] text-muted-foreground" />
            </div>
            {stateIssues.map((el) => (
              <div key={el.id} className={row}>
                {priorityIcon[el.priority]}
                <span className={key}>
                  {identifier}-{el.sequence_id}
                </span>
                <span>{el.title}</span>
                <span />
                <span className={due}>
                  {el.due_date ? new Date(el.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                </span>
                <span />
                {onRemove ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem destructive onSelect={() => onRemove(el.id)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
