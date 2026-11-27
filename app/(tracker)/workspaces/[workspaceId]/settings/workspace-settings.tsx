"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

// Dev 2 — Танзимоти workspace. Figma: фрейми "Workspace settings".
export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", t.settings]} title={t.title} />

        {/* Табҳо: General / Members */}
        <Tabs value="general">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${w}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${w}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Карточкаи General: ном ва суроға */}
        <div className="p-[24px]">
          <Card className="max-w-[584px] gap-0 p-0">
            <CardHeader className="border-b border-border px-[16px] py-[14px]">
              <CardTitle className="text-[14px]">{t.general}</CardTitle>
            </CardHeader>
            <CardContent className="gap-[16px] p-[16px]">
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="workspace-name">{t.name}</Label>
                <Input id="workspace-name" defaultValue="Demo Team" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <Label htmlFor="workspace-address">{t.address}</Label>
                <Input id="workspace-address" defaultValue="demo" />
              </div>

              <div className="flex items-center gap-[6px]">
                <Button type="button">{t.save}</Button>
                <Button type="button" variant="outline" className="ml-auto">
                  {t.transfer}
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
