"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewModuleDialog from "./dialogs/new-module-dialog";
import translations from "./page-translations.json";

// Dev 2 — Модулҳои проект ва статусашон. Figma: фрейми "Modules".
export default function ModulesPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Синфи як сатр — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[56px] items-center gap-[16px] border-b border-border px-[24px] hover:bg-muted/50";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="modules" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.modules]} title={t.modules}>
          <NewModuleDialog />
        </PageHeading>

        {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
        {/* Link танҳо дар гирди ном аст, то тугмаи "..." ссылкаро накушояд. */}
        <div className={row}>
          <Link href={`${p}/modules/checkout`} className="flex-1">
            <p className="text-[13px] font-semibold">Checkout</p>
            <p className="text-[12px] text-muted-foreground">19 Nov – 3 Dec</p>
          </Link>
          <div className="flex w-[160px] items-center gap-[8px] text-[13px] text-muted-foreground">
            <Avatar name="Madina Rahimova" className="bg-pink-100 text-pink-700" /> Madina Rahimova
          </div>
          <span className="w-[80px] text-[12px] text-muted-foreground">{t.inProgress}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Module menu">
            <MoreHorizontal />
          </Button>
        </div>

        <div className={row}>
          <Link href={`${p}/modules/onboarding`} className="flex-1">
            <p className="text-[13px] font-semibold">Onboarding</p>
            <p className="text-[12px] text-muted-foreground">4–17 Dec</p>
          </Link>
          <div className="flex w-[160px] items-center gap-[8px] text-[13px] text-muted-foreground">
            <Avatar name="Anna Petrova" className="bg-orange-100 text-orange-700" /> Anna Petrova
          </div>
          <span className="w-[80px] text-[12px] text-muted-foreground">{t.backlog}</span>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Module menu">
            <MoreHorizontal />
          </Button>
        </div>
      </main>
    </div>
  );
}
