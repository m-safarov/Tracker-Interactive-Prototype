"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Layers,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings,
  UserCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Sidebar-и workspace, ки дар ҳамаи саҳифаҳои Dev2 ҳаст. Figma: компоненти "Workspace sidebar".
// active — кадом банд ранги кабуд дорад.
interface WorkspaceSidebarProps {
  active?: "my-tasks" | "notifications" | "projects" | "tasks" | "cycles" | "modules" | "settings";
}

export default function WorkspaceSidebar({ active }: WorkspaceSidebarProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const p = `${w}/projects/website`; // намуна: id-и проект баъд аз API меояд

  const item = "flex h-[32px] items-center gap-[10px] rounded-[6px] px-[8px] hover:bg-muted";
  const activeItem = "bg-primary/10 font-medium text-primary hover:bg-primary/10";

  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-[12px] border-r border-border bg-muted/50 p-[12px]">
      {/* Workspace */}
      <button type="button" className="flex h-[36px] items-center gap-[10px] rounded-[6px] px-[4px] hover:bg-muted">
        <span className="flex size-[28px] items-center justify-center rounded-[6px] bg-primary/10 text-[13px] font-semibold text-primary">
          D
        </span>
        <span className="flex-1 text-left text-[14px] font-semibold">Demo Team</span>
        <ChevronDown className="size-[16px] text-muted-foreground" />
      </button>

      <Button type="button" size="sm" className="w-full">
        <Plus /> New task
      </Button>

      {/* Менюи асосӣ */}
      <nav className="flex flex-col gap-[2px] text-[13px]">
        <Link href={`${w}/my-tasks`} className={`${item} ${active === "my-tasks" ? activeItem : ""}`}>
          <UserCheck className="size-[16px]" /> My tasks
        </Link>
        <Link href={`${w}/notifications`} className={`${item} ${active === "notifications" ? activeItem : ""}`}>
          <Bell className="size-[16px]" /> Notifications
          <span className="ml-auto rounded-[4px] bg-primary/10 px-[6px] text-[11px] font-semibold text-primary">4</span>
        </Link>
        <Link href={`${w}/projects`} className={`${item} ${active === "projects" ? activeItem : ""}`}>
          <FolderKanban className="size-[16px]" /> Projects
        </Link>
      </nav>

      <Separator />

      {/* Проектҳо. Намуна: баъд ба .map() бо API иваз мешавад. */}
      <div className="flex flex-col gap-[2px] text-[13px]">
        <button type="button" className={`${item} font-semibold`}>
          <span className="rounded-[4px] border border-border px-[3px] text-[10px] font-normal text-muted-foreground">WEB</span>
          Website
          <ChevronDown className="ml-auto size-[16px] text-muted-foreground" />
        </button>
        <Link href={`${p}/tasks`} className={`${item} ml-[18px] ${active === "tasks" ? activeItem : ""}`}>
          <Layers className="size-[16px]" /> Tasks
        </Link>
        <Link href={`${p}/cycles`} className={`${item} ml-[18px] ${active === "cycles" ? activeItem : ""}`}>
          <RefreshCw className="size-[16px]" /> Cycles
        </Link>
        <Link href={`${p}/modules`} className={`${item} ml-[18px] ${active === "modules" ? activeItem : ""}`}>
          <Boxes className="size-[16px]" /> Modules
        </Link>
        <Link href={`${p}/settings`} className={`${item} ml-[18px] ${active === "settings" ? activeItem : ""}`}>
          <Settings className="size-[16px]" /> Settings
        </Link>

        <button type="button" className={`${item} mt-[8px]`}>
          <span className="rounded-[4px] border border-border px-[3px] text-[10px] text-muted-foreground">MOB</span>
          Mobile App
          <ChevronRight className="ml-auto size-[16px] text-muted-foreground" />
        </button>
        <button type="button" className={item}>
          <span className="rounded-[4px] border border-border px-[3px] text-[10px] text-muted-foreground">OPS</span>
          Operations
          <ChevronRight className="ml-auto size-[16px] text-muted-foreground" />
        </button>
      </div>

      {/* Корбари ҷорӣ дар поён */}
      <div className="mt-auto flex flex-col gap-[12px]">
        <Separator />
        <div className="flex items-center gap-[10px] text-[14px]">
          <Avatar name="Farrukh Karimov" className="bg-violet-100 text-violet-700" />
          <span className="flex-1">Farrukh Karimov</span>
          <MoreHorizontal className="size-[16px] text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
