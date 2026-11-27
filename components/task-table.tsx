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
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Ҷадвали вазифаҳо, ки аз рӯи статус гурӯҳ шудаанд. Дар Cycle detail ва Module detail истифода мешавад.
// Намуна: ҳамаи сатрҳо дастӣ навишта шудаанд, баъд ба .map() бо API иваз мешаванд.
export default function TaskTable() {
  // Сутунҳо: приоритет | калид | ном | нишонаҳо | мӯҳлат | иҷрокунандагон | меню
  const columns = "grid grid-cols-[16px_70px_1fr_240px_114px_70px_32px] items-center gap-x-[8px] px-[24px]";
  const head = `${columns} h-[34px] text-[12px] text-muted-foreground`;
  const group = "flex h-[36px] items-center gap-[8px] border-y border-border bg-muted px-[24px] text-[13px] font-semibold";
  const groupCount = "ml-[24px] rounded-[4px] bg-background px-[6px] text-[11px] font-normal text-muted-foreground";
  const row = `${columns} h-[36px] border-b border-border text-[13px]`;
  const key = "text-[12px] text-muted-foreground";
  const label = "mr-[4px] rounded-[4px] px-[6px] py-[1px] text-[12px]";
  const due = "text-[12px] text-muted-foreground";
  const avatar = "-mr-[6px] size-[18px] border border-background text-[8px]";

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

      {/* ===== In Progress ===== */}
      <div className={group}>
        <Contrast className="size-[14px] text-blue-500" /> In Progress
        <span className={groupCount}>2</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <OctagonExclamationPoint className="size-[14px] text-red-600" />
        <span className={key}>WEB-1</span>
        <span>Checkout fails on Safari when the card form is autofilled</span>
        <span>
          <span className={`${label} bg-red-50 text-red-700`}>bug</span>
          <span className={`${label} bg-amber-50 text-amber-700`}>frontend</span>
        </span>
        <span className="text-[12px] text-destructive">24 Nov</span>
        <span className="flex">
          <Avatar name="Madina Rahimova" className={`${avatar} bg-pink-100 text-pink-700`} />
          <Avatar name="Daler Saidov" className={`${avatar} bg-sky-100 text-sky-700`} />
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>
      <div className={row}>
        <SignalHigh className="size-[14px] text-orange-500" />
        <span className={key}>WEB-3</span>
        <span>Migrate image uploads to S3</span>
        <span><span className={`${label} bg-emerald-50 text-emerald-700`}>backend</span></span>
        <span className={due}>27 Nov</span>
        <span className="flex">
          <Avatar name="Daler Saidov" className={`${avatar} bg-sky-100 text-sky-700`} />
          <Avatar name="Farrukh Karimov" className={`${avatar} bg-violet-100 text-violet-700`} />
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>

      {/* ===== In Review ===== */}
      <div className={group}>
        <Contrast className="size-[14px] text-violet-600" /> In Review
        <span className={groupCount}>1</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <SignalHigh className="size-[14px] text-orange-500" />
        <span className={key}>WEB-5</span>
        <span>Validate billing address before payment</span>
        <span><span className={`${label} bg-red-50 text-red-700`}>bug</span></span>
        <span className={due}>27 Nov</span>
        <span className="flex"><Avatar name="Madina Rahimova" className={`${avatar} bg-pink-100 text-pink-700`} /></span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>

      {/* ===== Todo ===== */}
      <div className={group}>
        <Circle className="size-[14px]" /> Todo
        <span className={groupCount}>1</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <SignalHigh className="size-[14px] text-orange-500" />
        <span className={key}>WEB-7</span>
        <span>Add password strength meter to sign-up</span>
        <span>
          <span className={`${label} bg-blue-50 text-blue-700`}>feature</span>
          <span className={`${label} bg-amber-50 text-amber-700`}>frontend</span>
        </span>
        <span className={due}>30 Nov</span>
        <span className="flex">
          <Avatar name="Daler Saidov" className={`${avatar} bg-sky-100 text-sky-700`} />
          <Avatar name="Anna Petrova" className={`${avatar} bg-orange-100 text-orange-700`} />
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>

      {/* ===== Backlog ===== */}
      <div className={group}>
        <CircleDashed className="size-[14px] text-muted-foreground" /> Backlog
        <span className={groupCount}>1</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <SignalLow className="size-[14px] text-blue-500" />
        <span className={key}>WEB-18</span>
        <span>Write a runbook for database backups</span>
        <span><span className={`${label} bg-emerald-50 text-emerald-700`}>backend</span></span>
        <span className={due}>30 Nov</span>
        <span className="flex"><Avatar name="Farrukh Karimov" className={`${avatar} bg-violet-100 text-violet-700`} /></span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>

      {/* ===== Done ===== */}
      <div className={group}>
        <CircleCheck className="size-[14px] text-emerald-500" /> Done
        <span className={groupCount}>2</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <SignalMedium className="size-[14px] text-orange-500" />
        <span className={key}>WEB-2</span>
        <span>Create checkout success screen</span>
        <span><span className={`${label} bg-purple-50 text-purple-700`}>design</span></span>
        <span className={due}>23 Nov</span>
        <span className="flex"><Avatar name="Anna Petrova" className={`${avatar} bg-orange-100 text-orange-700`} /></span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>
      <div className={row}>
        <SignalHigh className="size-[14px] text-orange-500" />
        <span className={key}>WEB-4</span>
        <span>Update session refresh logic</span>
        <span><span className={`${label} bg-emerald-50 text-emerald-700`}>backend</span></span>
        <span className={due}>21 Nov</span>
        <span className="flex"><Avatar name="Farrukh Karimov" className={`${avatar} bg-violet-100 text-violet-700`} /></span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>

      {/* ===== Cancelled ===== */}
      <div className={group}>
        <CircleX className="size-[14px] text-red-500" /> Cancelled
        <span className={groupCount}>1</span>
        <Plus className="ml-auto size-[14px] text-muted-foreground" />
      </div>
      <div className={row}>
        <Minus className="size-[14px] text-muted-foreground" />
        <span className={key}>WEB-8</span>
        <span>Replace legacy checkout redirect</span>
        <span />
        <span className={due}>—</span>
        <span />
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Task menu"><MoreHorizontal /></Button>
      </div>
    </div>
  );
}
