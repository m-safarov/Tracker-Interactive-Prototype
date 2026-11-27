"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MoreHorizontal, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import NewProjectDialog from "./dialogs/new-project-dialog";
import translations from "./page-translations.json";

// Dev 2 — Рӯйхати проектҳои фаъол. Figma: фрейми "Projects".
export default function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="projects" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", t.projects]} title={t.projects}>
          <NewProjectDialog />
        </PageHeading>

        {/* Табҳо: Active / Archived */}
        <Tabs value="active">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="active" asChild>
              <Link href={`${w}/projects`}>{t.active}</Link>
            </TabsTrigger>
            <TabsTrigger value="archived" asChild>
              <Link href={`${w}/projects/archived`}>{t.archived}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Ҷадвали проектҳо. Намуна: баъд ба .map() бо API иваз мешавад. */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-[24px]">{t.project}</TableHead>
              <TableHead className="w-[170px]">{t.lead}</TableHead>
              <TableHead className="w-[90px]">{t.created}</TableHead>
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="pl-[24px]">
                <div className="flex items-center gap-[14px]">
                  <span className="rounded-[4px] border border-border bg-muted px-[6px] py-[2px] text-[12px] text-muted-foreground">WEB</span>
                  <div>
                    <p className="font-semibold">Website</p>
                    <p className="text-[12px] text-muted-foreground">Checkout, onboarding and the public website</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-[8px] text-muted-foreground">
                  <Avatar name="Madina Rahimova" className="bg-pink-100 text-pink-700" /> Madina Rahimova
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">18 Nov</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Project menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Settings /> {t.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem>{t.archive}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-[24px]">
                <div className="flex items-center gap-[14px]">
                  <span className="rounded-[4px] border border-border bg-muted px-[6px] py-[2px] text-[12px] text-muted-foreground">MOB</span>
                  <div>
                    <p className="font-semibold">Mobile App</p>
                    <p className="text-[12px] text-muted-foreground">iOS and Android app releases</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-[8px] text-muted-foreground">
                  <Avatar name="Daler Saidov" className="bg-sky-100 text-sky-700" /> Daler Saidov
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">19 Nov</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Project menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Settings /> {t.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem>{t.archive}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="pl-[24px]">
                <div className="flex items-center gap-[14px]">
                  <span className="rounded-[4px] border border-border bg-muted px-[6px] py-[2px] text-[12px] text-muted-foreground">OPS</span>
                  <div>
                    <p className="font-semibold">Operations</p>
                    <p className="text-[12px] text-muted-foreground">Internal systems, infrastructure and documentation</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-[8px] text-muted-foreground">
                  <Avatar name="Farrukh Karimov" className="bg-violet-100 text-violet-700" /> Farrukh Karimov
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">20 Nov</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Project menu">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Settings /> {t.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem>{t.archive}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
