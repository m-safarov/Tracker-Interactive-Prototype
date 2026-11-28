"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "../page-translations.json";

const messages = translations.tg.newTask;
const formSchema = z.object({
  title: z.string().trim().min(1, messages.titleRequired).max(500, messages.titleTooLong),
  project: z.string(),
  status: z.string(),
  assignee_ids: z.array(z.string()),
  label_ids: z.array(z.string()),
});
const projectIdSchema = z.uuid();
const proxyOptions = { baseURL: "/api" };

type Project = { id: string; name: string; identifier: string; is_archived: boolean };
type ProjectStatus = { id: string; name: string; is_default: boolean };
type ProjectLabel = { id: string; name: string };
type ProjectMember = { user_id: string; user: { display_name: string } };

async function getProjects(workspacePath: string, signal: AbortSignal) {
  const { data } = await api.get<Project[]>(`${workspacePath}/projects`, { ...proxyOptions, signal });
  if (!Array.isArray(data)) throw new Error(messages.optionsError);
  return data;
}

async function getStates(projectPath: string, signal: AbortSignal) {
  const { data } = await api.get<ProjectStatus[]>(`${projectPath}/states`, { ...proxyOptions, signal });
  if (!Array.isArray(data)) throw new Error(messages.optionsError);
  return data;
}

function getErrorMessage(error: unknown, fallback: string) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status === 401) return messages.signInError;
  if (status === 403) return messages.accessError;
  return fallback;
}

export default function NewTaskDialog() {
  const { language } = usePreferencesStore();
  const t = translations[language];
  const copy = t.newTask;
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTask = searchParams.get("newTask") === "1";
  const requestedStatus = searchParams.get("newTaskState");
  const workspacePath = `/workspaces/${encodeURIComponent(workspaceId)}`;
  const routeProject = projectIdSchema.safeParse(projectId).data;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isOpen = open || requestedTask || !!requestedStatus;
  const { register, control, handleSubmit, reset, setValue, formState } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", project: "", status: "", assignee_ids: [], label_ids: [] },
  });
  const selectedProject = useWatch({ control, name: "project" });
  const selectedStatus = useWatch({ control, name: "status" });
  const assigneeIds = useWatch({ control, name: "assignee_ids" });
  const labelIds = useWatch({ control, name: "label_ids" });

  const projects = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: ({ signal }) => getProjects(workspacePath, signal),
    select: (data) => data.filter((el) => !el.is_archived),
    enabled: isOpen && !routeProject,
    retry: false,
  });
  const projectOptions = projects.data ?? [];
  const onlyProject = projectOptions.length === 1 ? projectOptions[0].id : "";
  const project = routeProject ?? (selectedProject || onlyProject);
  const projectPath = `${workspacePath}/projects/${encodeURIComponent(project)}`;
  const statuses = useQuery({
    queryKey: ["states", workspaceId, project],
    queryFn: ({ signal }) => getStates(projectPath, signal),
    enabled: isOpen && !!project,
    retry: false,
  });
  const labels = useQuery({
    queryKey: ["labels", workspaceId, project],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ProjectLabel[]>(projectPath + "/labels", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error(messages.optionsError);
      return data;
    },
    enabled: isOpen && !!project,
    retry: false,
  });
  const members = useQuery({
    queryKey: ["project-members", workspaceId, project],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ProjectMember[]>(projectPath + "/members", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error(messages.optionsError);
      return data;
    },
    enabled: isOpen && !!project,
    retry: false,
  });
  const postIssue = useMutation({
    mutationFn: async (values: { title: string; state_id: string; assignee_ids: string[]; label_ids: string[] }) => {
      const { data } = await api.post<{ title: string }>(`${projectPath}/issues`, values, proxyOptions);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues", workspaceId, project] }),
  });

  const statusOptions = Array.isArray(statuses.data) ? statuses.data : [];
  const labelOptions = Array.isArray(labels.data) ? labels.data : [];
  const memberOptions = Array.isArray(members.data) ? members.data : [];
  const defaultStatus = statusOptions.find((status) => status.is_default) ?? statusOptions[0];
  const status = statusOptions.find((el) => el.id === (selectedStatus || requestedStatus)) ?? defaultStatus;
  const saving = formState.isSubmitting || postIssue.isPending;
  const optionQueries = routeProject ? [statuses, labels, members] : [projects, statuses, labels, members];
  const failedQueries = optionQueries.filter((el) => el.isError);
  const loading = (!routeProject && projects.isPending) || (!!project && (statuses.isPending || labels.isPending || members.isPending));
  const optionError = failedQueries[0]?.error;
  const field = "flex flex-col gap-[6px]";
  const errorClass = "text-[13px] text-destructive";
  const titleError = formState.errors.title;

  function changeOpen(nextOpen: boolean) {
    if (saving) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      postIssue.reset();
      if (requestedTask || requestedStatus) {
        const next = new URLSearchParams(searchParams);
        next.delete("newTask");
        next.delete("newTaskState");
        router.replace(pathname + (next.size ? "?" + next.toString() : ""), { scroll: false });
      }
    }
  }

  function changeProject(value: string) {
    setValue("project", value);
    setValue("status", "");
    setValue("assignee_ids", []);
    setValue("label_ids", []);
    postIssue.reset();
  }

  function toggleOption(field: "assignee_ids" | "label_ids", values: string[], id: string, checked: boolean) {
    setValue(field, checked ? [...values, id] : values.filter((el) => el !== id));
  }

  async function submit({ title, assignee_ids, label_ids }: z.infer<typeof formSchema>) {
    if (!status || optionError || postIssue.isPending || postIssue.isSuccess) return;
    await postIssue.mutateAsync({ title, state_id: status.id, assignee_ids, label_ids }).catch(() => undefined);
  }

  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="w-[120px]"><Plus />{copy.newTask}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-32px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy.newTask}</DialogTitle>
          <DialogDescription>{postIssue.isSuccess ? postIssue.data.title : copy.introduction}</DialogDescription>
        </DialogHeader>
        {postIssue.isSuccess ? (
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
                    {projectOptions.map((el) => (
                      <SelectItem key={el.id} value={el.id}>{el.name} ({el.identifier})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {projects.isSuccess && !projectOptions.length && <p role="status">{copy.noProjects}</p>}
              </div>
            )}
            <div className={field} role="group" aria-label={copy.status}>
              <span>{copy.status}</span>
              <Select value={status?.id ?? ""} onValueChange={(value) => setValue("status", value)} disabled={saving || !status || !!optionError}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {project && statuses.isSuccess && !statusOptions.length && <p role="status">{copy.noStatuses}</p>}
            </div>
            {project && !loading && !optionError && (
              <div className="grid grid-cols-2 gap-[8px]">
                <fieldset disabled={saving} className="min-w-0 rounded-[6px] border border-border p-[8px]">
                  <legend className="px-[4px] text-[13px]">{t.assignees}</legend>
                  <div className="flex max-h-[120px] flex-col gap-[8px] overflow-y-auto">
                    {memberOptions.length === 0 && <p className="text-muted-foreground">—</p>}
                    {memberOptions.map((el) => (
                      <div key={el.user_id} className="flex items-center gap-[6px]">
                        <Checkbox id={"new-task-member-" + el.user_id} checked={assigneeIds.includes(el.user_id)}
                          onCheckedChange={(checked) => toggleOption("assignee_ids", assigneeIds, el.user_id, checked)} />
                        <Label htmlFor={"new-task-member-" + el.user_id}>{el.user?.display_name || "—"}</Label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                <fieldset disabled={saving} className="min-w-0 rounded-[6px] border border-border p-[8px]">
                  <legend className="px-[4px] text-[13px]">{t.labels}</legend>
                  <div className="flex max-h-[120px] flex-col gap-[8px] overflow-y-auto">
                    {labelOptions.length === 0 && <p className="text-muted-foreground">—</p>}
                    {labelOptions.map((el) => (
                      <div key={el.id} className="flex items-center gap-[6px]">
                        <Checkbox id={"new-task-label-" + el.id} checked={labelIds.includes(el.id)}
                          onCheckedChange={(checked) => toggleOption("label_ids", labelIds, el.id, checked)} />
                        <Label htmlFor={"new-task-label-" + el.id}>{el.name}</Label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}
            {loading && <p role="status" className="text-[13px] text-muted-foreground">{copy.loading}</p>}
            {optionError && (
              <div className={field}>
                <p role="alert" className={errorClass}>{getErrorMessage(optionError, messages.optionsError)}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => failedQueries.forEach((el) => void el.refetch())}
                  disabled={failedQueries.some((el) => el.isFetching)}
                >
                  {copy.retry}
                </Button>
              </div>
            )}
            {postIssue.isError && <p role="alert" className={errorClass}>{getErrorMessage(postIssue.error, messages.createError)}</p>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" disabled={saving}>{copy.cancel}</Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={saving || loading || !status || !!optionError}>
                {saving ? copy.creating : copy.create}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
