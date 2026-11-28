"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import translations from "./page-translations.json";

type Issue = {
  id: string;
  sequence_id: number;
  title: string;
  description: string | null;
  state_id: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  estimate_points: number | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};
type Author = { display_name: string; avatar_url: string | null };
type Comment = { id: string; body: string; created_at: string; author?: Author | null };
type Activity = { id: string; action: string; field: string | null; created_at: string; actor?: Author | null };
type ActivityPage = { data: Activity[]; next_cursor: string | null };

const proxyOptions = { baseURL: "/api" };
const formSchema = z.object({
  title: z.string().trim().min(1, "Номи вазифаро нависед.").max(500, "Ном то 500 аломат бошад."),
  description: z.string().trim().max(50_000, "Тавсиф то 50 000 аломат бошад."),
});

async function getIssue(path: string, signal: AbortSignal) {
  const { data } = await api.get<Issue>(path, { ...proxyOptions, signal });
  return data;
}

async function getActivity(path: string, signal: AbortSignal) {
  const events: Activity[] = [];
  let cursor: string | null = null;
  do {
    const { data }: { data: ActivityPage } = await api.get<ActivityPage>(path + "/activity", {
      ...proxyOptions, signal, params: { cursor },
    });
    if (!Array.isArray(data?.data) || (data.next_cursor && data.next_cursor === cursor)) throw new Error("Could not read task activity.");
    events.push(...data.data);
    cursor = data.next_cursor;
  } while (cursor);
  return events;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
}

export default function TaskDetailPage() {
  const { workspaceId, projectId, taskId } = useParams<{ workspaceId: string; projectId: string; taskId?: string }>();
  const searchParams = useSearchParams();
  const issueId = taskId ?? searchParams.get("issue");
  const embedded = !taskId;
  const path = "/workspaces/" + encodeURIComponent(workspaceId) + "/projects/" + encodeURIComponent(projectId);
  const taskPath = path + "/tasks";
  const issuePath = path + "/issues/" + encodeURIComponent(issueId ?? "");
  const issueKey = ["issue", workspaceId, projectId, issueId];
  const issueListKey = ["issues", workspaceId, projectId];
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [activityTab, setActivityTab] = useState("comments");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });

  const issue = useQuery({
    queryKey: issueKey,
    queryFn: ({ signal }) => getIssue(issuePath, signal),
    enabled: !!issueId,
  });
  const project = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async ({ signal }) => (await api.get<{ name: string; identifier: string }>(path, { ...proxyOptions, signal })).data,
  });
  const states = useQuery({
    queryKey: ["states", workspaceId, projectId],
    queryFn: async ({ signal }) => (await api.get<{ id: string; name: string }[]>(path + "/states", { ...proxyOptions, signal })).data,
  });
  const comments = useQuery({
    queryKey: [...issueKey, "comments"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<Comment[]>(issuePath + "/comments", { ...proxyOptions, signal });
      if (!Array.isArray(data)) throw new Error("Could not read task comments.");
      return data;
    },
    enabled: issue.isSuccess && activityTab === "comments",
  });
  const activity = useQuery({
    queryKey: [...issueKey, "activity"],
    queryFn: ({ signal }) => getActivity(issuePath, signal),
    enabled: issue.isSuccess && activityTab === "activity",
  });

  const editIssue = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) =>
      (await api.patch<Issue>(issuePath, { title: values.title, description: values.description || null }, proxyOptions)).data,
    onSuccess: async (data) => {
      queryClient.setQueryData(issueKey, data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: issueListKey }),
        queryClient.invalidateQueries({ queryKey: issueKey }),
      ]);
      setEditing(false);
    },
  });
  const deleteIssue = useMutation({
    mutationFn: () => api.delete(issuePath, proxyOptions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: issueListKey });
      router.replace(taskPath, { scroll: false });
    },
  });

  const t = translations.en;
  const task = issue.data;
  const taskKey = task && project.data?.identifier ? project.data.identifier + "-" + task.sequence_id : "—";
  const status = Array.isArray(states.data) ? states.data.find((el) => el.id === task?.state_id)?.name : undefined;
  const meta = "text-[12px] text-muted-foreground";
  const propertyRow = "grid min-h-[41px] grid-cols-[100px_minmax(0,1fr)] items-center gap-[8px] border-b border-border";

  function property(name: string, value: ReactNode) {
    return <div className={propertyRow}><dt className={meta}>{name}</dt><dd>{value}</dd></div>;
  }

  function startEditing() {
    if (!task) return;
    editIssue.reset();
    reset({ title: task.title, description: task.description ?? "" });
    setEditing(true);
  }

  const content = (
    <>
      {issue.isPending && <p role="status" className="p-[24px]">Loading task…</p>}
      {issue.isError && (
        <div className="flex flex-col items-start gap-[8px] p-[24px]">
          <p role="alert" className="text-destructive">{errorText(issue.error)}</p>
          <Button variant="outline" size="sm" onClick={() => void issue.refetch()} disabled={issue.isFetching}>Try again</Button>
        </div>
      )}
      {task && (
        <>
          <div className="flex min-h-[48px] items-center justify-between gap-[8px] border-b border-border px-[24px]">
            <span className={meta}>{taskKey}</span>
            <div className="flex items-center gap-[4px]">
              <Dialog onOpenChange={(open) => { if (open) deleteIssue.reset(); }}>
                <DialogTrigger asChild><Button type="button" variant="ghost" size="sm">Delete task</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete task?</DialogTitle>
                    <DialogDescription>{task.title}</DialogDescription>
                  </DialogHeader>
                  {deleteIssue.error && <p role="alert" className="text-destructive">{errorText(deleteIssue.error)}</p>}
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={deleteIssue.isPending}>Cancel</Button></DialogClose>
                    <Button type="button" variant="destructive" disabled={deleteIssue.isPending || deleteIssue.isSuccess} onClick={() => deleteIssue.mutate()}>
                      {deleteIssue.isPending ? "Deleting…" : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {!embedded && <Button asChild variant="ghost" size="icon-sm"><Link href={taskPath} aria-label={t.closePage}><X /></Link></Button>}
            </div>
          </div>
          <div className="grid min-h-0 flex-1 overflow-auto md:grid-cols-[minmax(0,1fr)_245px]">
            <div className="min-w-0 px-[24px] py-[20px] text-[13px]">
              {embedded && <h2 className="mb-[18px] break-words text-[20px] font-semibold">{task.title}</h2>}
              <section className="border-b border-border pb-[12px]">
                <div className="flex min-h-[36px] items-center justify-between gap-[8px] font-semibold">
                  <h3>{t.description}</h3>
                  {!editing && <Button type="button" variant="ghost" size="sm" onClick={startEditing}>{t.edit}</Button>}
                </div>
                {editing ? (
                  <form className="flex flex-col gap-[8px]" onSubmit={handleSubmit((values) => editIssue.mutate(values))}>
                    <Label htmlFor="issue-title">Title</Label>
                    <Input id="issue-title" {...register("title")} />
                    {errors.title && <p role="alert" className="text-destructive">{errors.title.message}</p>}
                    <Label htmlFor="issue-description">{t.description}</Label>
                    <Textarea id="issue-description" rows={4} {...register("description")} />
                    {errors.description && <p role="alert" className="text-destructive">{errors.description.message}</p>}
                    {editIssue.error && <p role="alert" className="text-destructive">{errorText(editIssue.error)}</p>}
                    <div className="flex justify-end gap-[8px]">
                      <Button type="button" variant="outline" size="sm" disabled={editIssue.isPending} onClick={() => setEditing(false)}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={editIssue.isPending}>{editIssue.isPending ? "Saving…" : "Save"}</Button>
                    </div>
                  </form>
                ) : <p className="whitespace-pre-wrap break-words">{task.description || "—"}</p>}
              </section>
              <Tabs value={activityTab} onValueChange={setActivityTab} className="mt-[12px]">
                <TabsList className="gap-[24px]">
                  <TabsTrigger value="comments">{t.comments}</TabsTrigger>
                  <TabsTrigger value="activity">{t.activity}</TabsTrigger>
                </TabsList>
                <TabsContent value="comments">
                  {comments.isPending && <p role="status" className={meta}>Loading comments…</p>}
                  {comments.isError && <p role="alert" className="text-destructive">{errorText(comments.error)}</p>}
                  {comments.isSuccess && !comments.data.length && <p className={meta}>No comments yet.</p>}
                  {comments.data?.map((el) => (
                    <div key={el.id} className="flex gap-[10px] border-b border-border py-[8px]">
                      {el.author && <Avatar name={el.author.display_name} src={el.author.avatar_url ?? undefined} />}
                      <div>
                        <div className="flex flex-wrap items-center gap-[8px]"><strong>{el.author?.display_name ?? "—"}</strong><span className={meta}>{formatDate(el.created_at)}</span></div>
                        <p className="whitespace-pre-wrap break-words">{el.body}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="activity">
                  {activity.isPending && <p role="status" className={meta}>Loading activity…</p>}
                  {activity.isError && <p role="alert" className="text-destructive">{errorText(activity.error)}</p>}
                  {activity.isSuccess && !activity.data.length && <p className={meta}>{t.emptyActivity}</p>}
                  {activity.data?.map((el) => (
                    <div key={el.id} className="flex flex-wrap items-center gap-[8px] border-b border-border py-[8px]">
                      <strong>{el.actor?.display_name ?? "—"}</strong>
                      <span>{el.action}{el.field && " · " + el.field}</span>
                      <span className={meta}>{formatDate(el.created_at)}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
            <aside className="border-t border-border px-[16px] py-[20px] text-[13px] md:border-t-0 md:border-l">
              <h3 className="font-semibold">{t.properties}</h3>
              <dl>
                {property(t.status, status ?? "—")}
                {property(t.priority, task.priority === "none" ? "—" : task.priority)}
                {property(t.startDate, formatDate(task.start_date))}
                {property(t.dueDate, formatDate(task.due_date))}
                {property(t.estimate, task.estimate_points ?? "—")}
                {property(t.parentTask, task.parent_id ? <Link className="break-all hover:underline" href={taskPath + "/" + encodeURIComponent(task.parent_id)}>Open parent task</Link> : "—")}
                {property(t.created, formatDate(task.created_at))}
                {property(t.updated, formatDate(task.updated_at))}
                {property(t.completed, formatDate(task.completed_at))}
              </dl>
            </aside>
          </div>
        </>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="flex min-w-0 flex-1 flex-col">
        <PageHeading crumbs={[project.data?.name, taskKey].filter((el): el is string => !!el)} title={task?.title ?? "Task"} />
        {content}
      </main>
    </div>
  );
}
