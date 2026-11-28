"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Project {
  name: string;
  identifier: string;
  description: string | null;
  lead_id: string | null;
}

interface ProjectMember {
  user_id: string;
  user: { display_name: string };
}

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  description: z.string(),
  lead_id: z.string(),
});
type ProjectForm = z.infer<typeof schema>;

// Dev 2 — Танзимоти умумии проект. Figma: фрейми "Project settings".
export default function ProjectSettingsPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(`/workspaces/${workspaceId}`);
      return data;
    },
  });

  const { data: getProject, isPending, error } = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Project>(p);
      return data;
    },
  });

  const { data: getProjectMembers = [], isPending: isMembersPending } = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectMember[]>(`${p}/members`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    values: getProject
      ? { name: getProject.name, description: getProject.description ?? "", lead_id: getProject.lead_id ?? "" }
      : undefined,
  });

  const editProject = useMutation({
    mutationFn: (values: ProjectForm) => api.patch(p, { name: values.name, description: values.description, lead_id: values.lead_id || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", workspaceId, projectId] });
    },
  });

  const editArchiveProject = useMutation({
    mutationFn: () => api.patch(p, { is_archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      router.push(`/workspaces/${workspaceId}/projects/archived`);
    },
  });

  const deleteProject = useMutation({
    mutationFn: () => api.delete(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      router.push(`/workspaces/${workspaceId}/projects`);
    },
  });

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", getProject?.name ?? "", t.settings]} title={t.title} />

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
            <CardContent className="p-[16px]">
              {isPending && <p className="text-[12px] text-muted-foreground">Loading...</p>}
              {error && (
                <p role="alert" className="text-[13px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}

              {getProject && !isMembersPending && (
                <form onSubmit={handleSubmit((values) => editProject.mutate(values))} className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="project-name">{t.name}</Label>
                    <Input id="project-name" {...register("name")} />
                    {errors.name && (
                      <p role="alert" className="text-[12px] text-[#DC2626]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="project-key">{t.key}</Label>
                    <Input id="project-key" value={getProject.identifier} disabled readOnly />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="project-description">{t.description}</Label>
                    <Input id="project-description" {...register("description")} />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="project-lead">{t.lead}</Label>
                    <select
                      id="project-lead"
                      {...register("lead_id")}
                      className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
                    >
                      <option value="">No lead</option>
                      {getProjectMembers.map((el) => (
                        <option key={el.user_id} value={el.user_id}>
                          {el.user.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(editProject.error || editArchiveProject.error || deleteProject.error) && (
                    <p role="alert" className="text-[12px] text-[#DC2626]">
                      {errorText(editProject.error || editArchiveProject.error || deleteProject.error)}
                    </p>
                  )}

                  <div className="mt-[8px] flex items-center gap-[6px]">
                    <Button type="submit" disabled={editProject.isPending}>
                      {editProject.isPending ? "Saving..." : t.save}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-auto"
                      disabled={editArchiveProject.isPending}
                      onClick={() => {
                        if (window.confirm("Archive project?")) editArchiveProject.mutate();
                      }}
                    >
                      {t.archive}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={deleteProject.isPending}
                      onClick={() => {
                        if (window.confirm("Delete project?")) deleteProject.mutate();
                      }}
                    >
                      {t.delete}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
