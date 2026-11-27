import { Progress } from "@/components/ui/progress";

// Карточкаи пешрафт дар Cycle detail ва Module detail.
// subtitle — сатри болоӣ (сана ё "роҳбар · сана"), percent — аз 0 то 100.
interface ProgressCardProps {
  subtitle: string;
  percent: number;
}

export default function ProgressCard({ subtitle, percent }: ProgressCardProps) {
  const count = "flex w-[124px] gap-[10px]";

  return (
    <div className="mx-[24px] mt-[20px] flex flex-col gap-[10px] rounded-[8px] border border-border p-[16px]">
      <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      <div className="flex items-center justify-between text-[13px] font-semibold">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} className="[&>div]:bg-emerald-500" />

      {/* Шумораи вазифаҳо аз рӯи гурӯҳ. Намуна: баъд аз API меояд. */}
      <div className="flex text-[12px] text-muted-foreground">
        <span className={count}>Backlog <b className="font-normal">1</b></span>
        <span className={count}>Unstarted <b className="font-normal">1</b></span>
        <span className={count}>Started <b className="font-normal">3</b></span>
        <span className={count}>Completed <b className="font-normal">2</b></span>
        <span className={count}>Cancelled <b className="font-normal">1</b></span>
      </div>
    </div>
  );
}
