"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, errorText } from "@/lib/api";
import translations from "../page-translations.json";

const copy = translations.en.newTask;
const titleSchema = z.object({
  title: z.string().trim().min(1, copy.titleRequired).max(500, copy.titleTooLong),
});
const projectIdSchema = z.uuid();

type Project = { id: string; name: string; identifier: string; is_archived: boolean };
type ProjectStatus = { id: string; name: string; is_default: boolean };

async function loadProjects(workspacePath: string, signal: AbortSignal) {
  const { data } = await api.get<Project[]>(`${workspacePath}/projects`, { signal });
  return data.filter((project) => !project.is_archived);
}

async function loadStatuses(projectPath: string, signal: AbortSignal) {
  const { data } = await api.get<ProjectStatus[]>(`${projectPath}/states`, { signal });
  return data;
}

export default function NewTaskDialog() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const workspacePath = `/workspaces/${encodeURIComponent(workspaceId)}`;
  const routeProject = projectIdSchema.safeParse(projectId).data;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(titleSchema),
    defaultValues: { title: "" },
  });

  const projects = useQuery({
    queryKey: ["new-task-projects", workspaceId],
    queryFn: ({ signal }) => loadProjects(workspacePath, signal),
    enabled: open && !routeProject,
    retry: false,
  });
  const projectOptions = projects.data ?? [];
  const onlyProject = projectOptions.length === 1 ? projectOptions[0].id : "";
  const project = routeProject ?? (selectedProject || onlyProject);
  const projectPath = `${workspacePath}/projects/${encodeURIComponent(project)}`;
  const statuses = useQuery({
    queryKey: ["new-task-statuses", workspaceId, project],
    queryFn: ({ signal }) => loadStatuses(projectPath, signal),
    enabled: open && !!project,
    retry: false,
  });
  const createTask = useMutation({
    mutationFn: async (values: { title: string; state_id: string }) => {
      const { data } = await api.post<{ title: string }>(`${projectPath}/issues`, values);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-tasks", workspaceId] }),
  });

  const statusOptions = statuses.data ?? [];
  const defaultStatus = statusOptions.find((status) => status.is_default) ?? statusOptions[0];
  const status = statusOptions.find((item) => item.id === selectedStatus) ?? defaultStatus;
  const saving = formState.isSubmitting || createTask.isPending;
  const loading = (!routeProject && projects.isPending) || (!!project && statuses.isPending);
  const projectError = routeProject ? null : projects.error;
  const optionError = projectError ?? statuses.error;
  const field = "flex flex-col gap-[6px]";
  const errorClass = "text-[13px] text-destructive";
  const titleError = formState.errors.title;

  function changeOpen(nextOpen: boolean) {
    if (saving) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setSelectedProject("");
      setSelectedStatus("");
      createTask.reset();
    }
  }

  function changeProject(value: string) {
    setSelectedProject(value);
    setSelectedStatus("");
    createTask.reset();
  }

  async function submit({ title }: z.infer<typeof titleSchema>) {
    if (!status || optionError || createTask.isPending || createTask.isSuccess) return;
    await createTask.mutateAsync({ title, state_id: status.id }).catch(() => undefined);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="w-[120px]"><Plus />{copy.newTask}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.newTask}</DialogTitle>
          <DialogDescription>{createTask.isSuccess ? createTask.data.title : copy.introduction}</DialogDescription>
        </DialogHeader>
        {createTask.isSuccess ? (
          <>
            <p role="status" className="text-[13px] font-medium">{copy.created}</p>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" size="sm">{copy.close}</Button></DialogClose>
              <Button asChild size="sm">
                <Link href={`${workspacePath}/my-tasks/created`}>{copy.viewCreated}</Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form method="post" noValidate className="flex flex-col gap-[14px]" onSubmit={handleSubmit(submit)} aria-busy={saving}>
            <div className={field}>
              <Label htmlFor="new-task-title">{copy.title}</Label>
              <Input
                id="new-task-title"
                placeholder={copy.taskTitle}
                maxLength={500}
                readOnly={saving}
                aria-invalid={!!titleError}
                aria-describedby={titleError ? "new-task-title-error" : undefined}
                {...register("title")}
              />
              {titleError && <p id="new-task-title-error" role="alert" className={errorClass}>{titleError.message}</p>}
            </div>
            {!routeProject && (
              <div className={field} role="group" aria-label={copy.project}>
                <span>{copy.project}</span>
                <Select value={project} onValueChange={changeProject} disabled={saving || !projectOptions.length}>
                  <SelectTrigger><SelectValue placeholder={copy.chooseProject} /></SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.name} ({option.identifier})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {projects.isSuccess && !projectOptions.length && <p role="status">{copy.noProjects}</p>}
              </div>
            )}
            <div className={field} role="group" aria-label={copy.status}>
              <span>{copy.status}</span>
              <Select value={status?.id ?? ""} onValueChange={setSelectedStatus} disabled={saving || !status || !!optionError}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {project && statuses.isSuccess && !statusOptions.length && <p role="status">{copy.noStatuses}</p>}
            </div>
            {loading && <p role="status" className="text-[13px] text-muted-foreground">{copy.loading}</p>}
            {optionError && (
              <div className={field}>
                <p role="alert" className={errorClass}>{errorText(optionError)}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => projectError ? projects.refetch() : statuses.refetch()}
                  disabled={projects.isFetching || statuses.isFetching}
                >
                  {copy.retry}
                </Button>
              </div>
            )}
            {createTask.isError && <p role="alert" className={errorClass}>{errorText(createTask.error)}</p>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" disabled={saving}>{copy.cancel}</Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={saving || !status || !!optionError}>
                {saving ? copy.creating : copy.create}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
