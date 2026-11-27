"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

// Dev 2 — Танзимоти умумии проект. Figma: фрейми "Project settings".
export default function ProjectSettingsPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", "Website", t.settings]} title={t.title} />

        {/* Табҳо: General / Members / Statuses / Labels */}
        <Tabs value="general">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${p}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${p}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
            <TabsTrigger value="statuses" asChild>
              <Link href={`${p}/settings/statuses`}>{t.statuses}</Link>
            </TabsTrigger>
            <TabsTrigger value="labels" asChild>
              <Link href={`${p}/settings/labels`}>{t.labels}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Карточкаи General */}
        <div className="p-[24px]">
          <Card className="max-w-[584px] gap-0 p-0">
            <CardHeader className="border-b border-border px-[16px] py-[14px]">
              <CardTitle className="text-[14px]">{t.general}</CardTitle>
            </CardHeader>
            <CardContent className="gap-[16px] p-[16px]">
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="project-name">{t.name}</Label>
                <Input id="project-name" defaultValue="Website" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="project-key">{t.key}</Label>
                <Input id="project-key" defaultValue="WEB" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="project-description">{t.description}</Label>
                <Input id="project-description" defaultValue="Checkout, onboarding and the public website" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label>{t.lead}</Label>
                <Select defaultValue="madina">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="madina">Madina Rahimova</SelectItem>
                    <SelectItem value="daler">Daler Saidov</SelectItem>
                    <SelectItem value="farrukh">Farrukh Karimov</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-[8px] flex items-center gap-[6px]">
                <Button type="button">{t.save}</Button>
                <Button type="button" variant="outline" className="ml-auto">
                  {t.archive}
                </Button>
                <Button type="button" variant="outline">
                  {t.delete}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
