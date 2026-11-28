"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

// Sidebar-и workspace, ки дар ҳамаи саҳифаҳои Dev2 ҳаст. Figma: компоненти "Workspace sidebar".
// active — кадом банд ранги кабуд дорад.
interface WorkspaceSidebarProps {
  active?: "my-tasks" | "notifications" | "projects" | "tasks" | "cycles" | "modules" | "settings";
}

interface Workspace {
  name: string;
  slug: string;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  is_archived: boolean;
}

interface Me {
  display_name: string;
}

export default function WorkspaceSidebar({ active }: WorkspaceSidebarProps) {
  const { workspaceId, projectId } = useParams<{ workspaceId?: string; projectId?: string }>();
  const router = useRouter();

  const item = "flex h-[32px] items-center gap-[10px] rounded-[6px] px-[8px] hover:bg-muted";
  const activeItem = "bg-primary/10 font-medium text-primary hover:bg-primary/10";

  const { data: getWorkspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get<Workspace[]>("/workspaces/");
      return data;
    },
  });

  const slug = workspaceId ?? getWorkspaces[0]?.slug;
  const w = `/workspaces/${slug}`;

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", slug],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(w);
      return data;
    },
    enabled: slug !== undefined,
  });

  const { data: getProjects = [] } = useQuery({
    queryKey: ["projects", slug],
    queryFn: async () => {
      const { data } = await api.get<Project[]>(`${w}/projects/`);
      return data;
    },
    enabled: slug !== undefined,
  });

  const { data: getUnread = [] } = useQuery({
    queryKey: ["notifications", slug, "unread"],
    queryFn: async () => {
      const { data } = await api.get<{ data: { id: string }[] }>(`${w}/notifications/?read=false`);
      return data.data;
    },
    enabled: slug !== undefined,
  });

  const { data: getMe } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<Me>("/auth/me");
      return data;
    },
  });

  const activeProjects = getProjects.filter((project) => !project.is_archived);
  const openProject = activeProjects.find((project) => project.id === projectId) ?? activeProjects[0];
  const otherProjects = activeProjects.filter((project) => project.id !== openProject?.id);
  const p = `${w}/projects/${openProject?.id}`;

  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-[12px] border-r border-border bg-muted/50 p-[12px]">
      {/* Workspace: рӯйхати ҳамаи workspace-ҳо */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex h-[36px] items-center gap-[10px] rounded-[6px] px-[4px] hover:bg-muted">
            <span className="flex size-[28px] items-center justify-center rounded-[6px] bg-primary/10 text-[13px] font-semibold text-primary">
              {getWorkspace?.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 text-left text-[14px] font-semibold">{getWorkspace?.name}</span>
            <ChevronDown className="size-[16px] text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {getWorkspaces.map((el) => (
            <DropdownMenuItem key={el.slug} onSelect={() => router.push(`/workspaces/${el.slug}/projects`)}>
              {el.name} <span className="text-muted-foreground">({el.slug})</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/workspaces/new")}>
            <Plus className="size-[14px]" /> Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {slug && (
        <>
          {openProject && (
            <Button asChild size="sm" className="w-full">
              <Link href={`${p}/tasks`}>
                <Plus /> New task
              </Link>
            </Button>
          )}

          {/* Менюи асосӣ */}
          <nav className="flex flex-col gap-[2px] text-[13px]">
            <Link href={`${w}/my-tasks`} className={`${item} ${active === "my-tasks" ? activeItem : ""}`}>
              <UserCheck className="size-[16px]" /> My tasks
            </Link>
            <Link href={`${w}/notifications`} className={`${item} ${active === "notifications" ? activeItem : ""}`}>
              <Bell className="size-[16px]" /> Notifications
              {getUnread.length > 0 && (
                <span className="ml-auto rounded-[4px] bg-primary/10 px-[6px] text-[11px] font-semibold text-primary">{getUnread.length}</span>
              )}
            </Link>
            <Link href={`${w}/projects`} className={`${item} ${active === "projects" ? activeItem : ""}`}>
              <FolderKanban className="size-[16px]" /> Projects
            </Link>
          </nav>

          <Separator />

          {/* Проектҳо: кушода — ҳозира, пӯшида — дигарон */}
          <div className="flex flex-col gap-[2px] text-[13px]">
            {openProject && (
              <>
                <Link href={`${p}/tasks`} className={`${item} font-semibold`}>
                  <span className="rounded-[4px] border border-border px-[3px] text-[10px] font-normal text-muted-foreground">
                    {openProject.identifier}
                  </span>
                  {openProject.name}
                  <ChevronDown className="ml-auto size-[16px] text-muted-foreground" />
                </Link>
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
              </>
            )}

            {otherProjects.map((el, index) => (
              <Link key={el.id} href={`${w}/projects/${el.id}/tasks`} className={`${item} ${index === 0 ? "mt-[8px]" : ""}`}>
                <span className="rounded-[4px] border border-border px-[3px] text-[10px] text-muted-foreground">{el.identifier}</span>
                {el.name}
                <ChevronRight className="ml-auto size-[16px] text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Корбари ҷорӣ дар поён */}
      <div className="mt-auto flex flex-col gap-[12px]">
        <Separator />
        <div className="flex items-center gap-[10px] text-[14px]">
          <Avatar name={getMe?.display_name ?? ""} className="bg-violet-100 text-violet-700" />
          <span className="flex-1">{getMe?.display_name}</span>
          <MoreHorizontal className="size-[16px] text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
