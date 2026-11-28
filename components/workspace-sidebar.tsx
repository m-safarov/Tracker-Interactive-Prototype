"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Boxes, ChevronDown, ChevronRight, FolderKanban, Layers, MoreHorizontal, Plus, RefreshCw, Settings, UserCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

interface WorkspaceSidebarProps {
  active?: "my-tasks" | "notifications" | "projects" | "tasks" | "cycles" | "modules" | "settings";
}

type Workspace = { slug: string; name: string };
type Project = { id: string; name: string; identifier: string; is_archived: boolean };
type Account = { display_name: string; avatar_url: string | null };

const proxyOptions = { baseURL: "/api" };
const projectLinks = [
  { segment: "tasks", label: "Tasks", icon: Layers },
  { segment: "cycles", label: "Cycles", icon: RefreshCw },
  { segment: "modules", label: "Modules", icon: Boxes },
  { segment: "settings", label: "Settings", icon: Settings },
];

export default function WorkspaceSidebar({ active }: WorkspaceSidebarProps) {
  const params = useParams<{ workspaceId?: string; projectId?: string }>();
  const routeWorkspace = params.workspaceId === "undefined" ? undefined : params.workspaceId;
  const router = useRouter();
  const [projectChoice, setProjectChoice] = useState<{ workspace: string; project: string | null }>();

  const workspaces = useQuery({
    queryKey: ["workspaces"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Workspace[]>("/workspaces", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error("Could not load workspaces.");
      return data;
    },
  });
  const workspaceList = workspaces.data ?? [];
  const workspace = routeWorkspace
    ? workspaceList.find((el) => el.slug === routeWorkspace)
    : workspaceList[0];
  const workspaceId = routeWorkspace ?? workspace?.slug;
  const w = workspaceId ? "/workspaces/" + encodeURIComponent(workspaceId) : null;

  const projects = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Project[]>(w + "/projects", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error("Could not load projects.");
      return data;
    },
    enabled: !!w,
  });
  const notifications = useQuery({
    queryKey: ["notifications", workspaceId, "sidebar-count"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<{ unread_count: number }>(w + "/notifications", {
        ...proxyOptions, signal, params: { read: false, limit: 1 },
      });
      return data.unread_count ?? 0;
    },
    enabled: !!w,
  });
  const account = useQuery({
    queryKey: ["current-account"],
    queryFn: async ({ signal }) => (await api.get<Account>("/auth/me", { ...proxyOptions, signal })).data,
  });

  const workspaceName = workspace?.name ?? workspaceId ?? "Workspaces";
  const accountName = account.data?.display_name || "Profile";
  const unreadCount = notifications.data ?? 0;
  const projectList = Array.isArray(projects.data)
    ? projects.data.filter((el) => !el.is_archived || el.id === params.projectId)
    : [];
  const firstActiveProject = projectList.find((el) => !el.is_archived);
  const noActiveProjects = projects.isSuccess && !firstActiveProject;
  const routeProject = projectList.find((el) => el.id === params.projectId);
  const expandedProjectId = projectChoice && projectChoice.workspace === workspaceId
    ? projectChoice.project
    : routeProject?.id ?? firstActiveProject?.id;
  const taskProject = projectList.find((el) => el.id === expandedProjectId && !el.is_archived) ?? firstActiveProject;
  const taskHref = w && taskProject ? w + "/projects/" + encodeURIComponent(taskProject.id) + "/tasks?newTask=1" : null;
  const projectsHref = w ? w + "/projects" : "/workspaces/new";

  const item = "flex h-[32px] items-center gap-[10px] rounded-[6px] px-[8px] hover:bg-muted";
  const projectItem = item + " ml-[18px]";
  const activeItem = "bg-primary/10 font-medium text-primary hover:bg-primary/10";
  const bodyText = "px-[8px] text-[12px] text-muted-foreground";

  function renderProject(project: Project) {
    const expanded = project.id === expandedProjectId;
    const p = w + "/projects/" + encodeURIComponent(project.id);

    return (
      <div key={project.id} className="flex flex-col gap-[2px]">
        <Button type="button" variant="ghost" className={item + " w-full justify-start font-semibold"} aria-expanded={expanded}
          onClick={() => { if (workspaceId) setProjectChoice({ workspace: workspaceId, project: expanded ? null : project.id }); }}>
          <span className="rounded-[4px] border border-border px-[3px] text-[10px] font-normal text-muted-foreground">{project.identifier}</span>
          <span className="min-w-0 flex-1 truncate text-left">{project.name}</span>
          {expanded
            ? <ChevronDown className="ml-auto size-[16px] text-muted-foreground" />
            : <ChevronRight className="ml-auto size-[16px] text-muted-foreground" />}
        </Button>
        {expanded && projectLinks.map((el) => {
          const selected = active === el.segment && params.projectId === project.id;
          return (
            <Link key={el.segment} href={p + "/" + el.segment} aria-current={selected ? "page" : undefined}
              className={projectItem + (selected ? " " + activeItem : "")}>
              <el.icon className="size-[16px]" /> {el.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-[12px] border-r border-border bg-muted/50 p-[12px]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" className="flex h-[36px] items-center justify-start gap-[10px] rounded-[6px] px-[4px] hover:bg-muted">
            <span className="flex size-[28px] shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-[13px] font-semibold text-primary">
              {workspaceId ? workspaceName.charAt(0).toUpperCase() : <FolderKanban className="size-[16px]" />}
            </span>
            <span className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold">{workspaceName}</span>
            <ChevronDown className="size-[16px] text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {workspaceList.map((el) => (
            <DropdownMenuItem key={el.slug} onSelect={() => router.push("/workspaces/" + encodeURIComponent(el.slug) + "/projects")}>
              {el.name}
            </DropdownMenuItem>
          ))}
          {workspaceList.length > 0 && <DropdownMenuSeparator />}
          {w && !noActiveProjects && <DropdownMenuItem onSelect={() => router.push(w + "/settings")}>Workspace settings</DropdownMenuItem>}
          <DropdownMenuItem onSelect={() => router.push("/workspaces/new")}>Create workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {workspaces.isPending && !w && <p role="status" className={bodyText}>Loading workspaces…</p>}
      {workspaces.isError && (
        <div className="flex flex-col items-start gap-[4px]">
          <p role="alert" className={bodyText}>Could not load workspaces.</p>
          <Button type="button" size="sm" variant="ghost" onClick={() => void workspaces.refetch()}>Try again</Button>
        </div>
      )}

      {taskHref ? (
        <Button asChild size="sm" className="w-full"><Link href={taskHref}><Plus /> New task</Link></Button>
      ) : (
        <Button type="button" size="sm" className="w-full" disabled><Plus /> New task</Button>
      )}

      <nav className="flex flex-col gap-[2px] text-[13px]">
        <Link href={w ? w + "/my-tasks" : projectsHref} className={item + (active === "my-tasks" ? " " + activeItem : "")}>
          <UserCheck className="size-[16px]" /> My tasks
        </Link>
        <Link href={w ? w + "/notifications" : projectsHref} className={item + (active === "notifications" ? " " + activeItem : "")}>
          <Bell className="size-[16px]" /> Notifications
          {unreadCount > 0 && (
            <span className="ml-auto rounded-[4px] bg-primary/10 px-[6px] text-[11px] font-semibold text-primary">{unreadCount}</span>
          )}
        </Link>
        <Link href={projectsHref} className={item + (active === "projects" ? " " + activeItem : "")}>
          <FolderKanban className="size-[16px]" /> Projects
        </Link>
        {w && noActiveProjects && (
          <Link href={w + "/settings"} className={item + (active === "settings" && !params.projectId ? " " + activeItem : "")}>
            <Settings className="size-[16px]" /> Workspace settings
          </Link>
        )}
      </nav>

      <Separator />
      <div className="flex min-h-0 flex-col gap-[2px] overflow-y-auto text-[13px]">
        {w && projects.isPending && <p role="status" className={bodyText}>Loading projects…</p>}
        {projects.isError && (
          <div className="flex flex-col items-start gap-[4px]">
            <p role="alert" className={bodyText}>Could not load projects.</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => void projects.refetch()}>Try again</Button>
          </div>
        )}
        {projectList.length ? projectList.map((el) => renderProject(el)) : (
          <>
            <Link href={projectsHref} className={item + " font-semibold"}>
              <FolderKanban className="size-[16px]" /> Project
              <ChevronDown className="ml-auto size-[16px] text-muted-foreground" />
            </Link>
            {projectLinks.map((el) => (
              <Link key={el.segment} href={projectsHref} className={projectItem}>
                <el.icon className="size-[16px]" /> {el.label}
              </Link>
            ))}
            {noActiveProjects && <p className={bodyText}>Use New project on the Projects page to get started.</p>}
            {!w && workspaces.isSuccess && <p className={bodyText}>Create a workspace to get started.</p>}
          </>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-[12px]">
        <Separator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" aria-label={accountName + " menu"} className="flex w-full items-center justify-start gap-[10px] px-0 text-[14px]">
              <Avatar name={accountName} src={account.data?.avatar_url ?? undefined} className="bg-violet-100 text-violet-700" />
              <span className="min-w-0 flex-1 truncate text-left">{accountName}</span>
              <MoreHorizontal className="size-[16px] text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem onSelect={() => router.push("/profile")}>Profile</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
