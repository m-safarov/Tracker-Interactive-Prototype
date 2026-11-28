"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeading from "@/components/page-heading";
import ProgressCard from "@/components/progress-card";
import TaskTable from "@/components/task-table";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

// Dev 2 — Як давра ва вазифаҳояш. Figma: фрейми "Cycle detail".
export default function CycleDetailPage() {
  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="cycles" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.cycles, "Sprint 12"]} title="Sprint 12">
          <Button type="button" size="sm" variant="outline">
            <Plus /> {t.addTasks}
          </Button>
        </PageHeading>

        <ProgressCard subtitle="19 Nov – 3 Dec" percent={25} />
        <TaskTable />
      </main>
    </div>
  );
}
