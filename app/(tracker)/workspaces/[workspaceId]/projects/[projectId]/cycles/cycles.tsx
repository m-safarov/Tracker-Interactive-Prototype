"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import NewCycleDialog from "./dialogs/new-cycle-dialog";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
}

interface Cycle {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

// Dev 2 — Давраҳо: фаъол, оянда ва тамомшуда. Figma: фрейми "Cycles".
export default function CyclesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфҳо — дар ҳамаи гурӯҳҳо ва сатрҳо як хел.
  const group = "flex h-[36px] items-center border-b border-border bg-muted px-[24px] text-[13px] font-semibold";
  const row = "flex h-[56px] items-center gap-[16px] border-b border-border px-[24px] hover:bg-muted/50";

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(`/workspaces/${workspaceId}`);
      return data;
    },
  });

  const { data: getProject } = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Project>(p);
      return data;
    },
  });

  const { data: getCycles = [], isPending, error } = useQuery({
    queryKey: ["cycles", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Cycle[]>(`${p}/cycles/`);
      return data;
    },
  });

  const deleteCycle = useMutation({
    mutationFn: (id: string) => api.delete(`${p}/cycles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles", workspaceId, projectId] });
    },
  });

  const activeCycles = getCycles.filter((cycle) => cycle.status === "active");
  const upcomingCycles = getCycles.filter((cycle) => cycle.status === "upcoming");
  const completedCycles = getCycles.filter((cycle) => cycle.status === "completed");

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="cycles" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.cycles]} title={t.cycles}>
          <NewCycleDialog />
        </PageHeading>

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || deleteCycle.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || deleteCycle.error)}
          </p>
        )}

        {/* Link танҳо дар гирди ном аст, то тугмаи "..." ссылкаро накушояд. */}
        <div className={group}>{t.active}</div>
        {activeCycles.map((el) => {
          const start = el.start_date ? new Date(el.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          const end = el.end_date ? new Date(el.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          return (
            <div key={el.id} className={row}>
              <Link href={`${p}/cycles/${el.id}`} className="flex-1">
                <p className="text-[13px] font-semibold">{el.name}</p>
                <p className="text-[12px] text-muted-foreground">{start && `${start} – ${end}`}</p>
              </Link>
              <span className="w-[80px] text-[12px] text-muted-foreground">{t.active}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      if (window.confirm("Delete cycle?")) deleteCycle.mutate(el.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        <div className={group}>{t.upcoming}</div>
        {upcomingCycles.map((el) => {
          const start = el.start_date ? new Date(el.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          const end = el.end_date ? new Date(el.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          return (
            <div key={el.id} className={row}>
              <Link href={`${p}/cycles/${el.id}`} className="flex-1">
                <p className="text-[13px] font-semibold">{el.name}</p>
                <p className="text-[12px] text-muted-foreground">{start && `${start} – ${end}`}</p>
              </Link>
              <span className="w-[80px] text-[12px] text-muted-foreground">{t.upcoming}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      if (window.confirm("Delete cycle?")) deleteCycle.mutate(el.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        <div className={group}>{t.completed}</div>
        {completedCycles.map((el) => {
          const start = el.start_date ? new Date(el.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          const end = el.end_date ? new Date(el.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
          return (
            <div key={el.id} className={row}>
              <Link href={`${p}/cycles/${el.id}`} className="flex-1">
                <p className="text-[13px] font-semibold">{el.name}</p>
                <p className="text-[12px] text-muted-foreground">{start && `${start} – ${end}`}</p>
              </Link>
              <span className="w-[80px] text-[12px] text-muted-foreground">{t.completed}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Cycle menu">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      if (window.confirm("Delete cycle?")) deleteCycle.mutate(el.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </main>
    </div>
  );
}
