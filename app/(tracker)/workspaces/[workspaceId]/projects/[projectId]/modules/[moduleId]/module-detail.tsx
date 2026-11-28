"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeading from "@/components/page-heading";
import ProgressCard from "@/components/progress-card";
import TaskTable from "@/components/task-table";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

// Dev 2 — Як модул ва вазифаҳояш. Figma: фрейми "Module detail".
export default function ModuleDetailPage() {
  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="modules" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.modules, "Checkout"]} title="Checkout">
          <Button type="button" size="sm" variant="outline">
            <Plus /> {t.addTasks}
          </Button>
        </PageHeading>

        <ProgressCard subtitle="Madina Rahimova · 19 Nov – 3 Dec" percent={25} />
        <TaskTable />
      </main>
    </div>
  );
}
