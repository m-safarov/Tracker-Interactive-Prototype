"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreHorizontal, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
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
  assignees?: { user?: Member["user"] }[];
  labels?: { label?: IssueLabel }[];
};
type Author = { display_name: string; avatar_url: string | null };
type Comment = { id: string; author_id: string; body: string; created_at: string; deleted_at: string | null; author?: Author | null };
type Member = { user_id: string; user: Author & { id: string } };
type IssueLabel = { id: string; name: string; color: string };
type Attachment = { id: string; file_name: string; file_size: number; download_url: string };
type AttachmentUpload = { attachment: Attachment; upload: { url: string; headers: Record<string, string> } };
type Activity = { id: string; action: string; field: string | null; created_at: string; actor?: Author | null };
type ActivityPage = { data: Activity[]; next_cursor: string | null };

const formSchema = z.object({
  title: z.string().trim().min(1, "Номи вазифаро нависед.").max(500, "Ном то 500 аломат бошад."),
  description: z.string().trim().max(50_000, "Тавсиф то 50 000 аломат бошад."),
});
const commentSchema = z.object({
  body: z.string().trim().min(1, "Матни шарҳро нависед.").max(50_000, "Шарҳ то 50 000 аломат бошад."),
});
const attachmentSchema = z.file().min(1, "Файли холиро замима кардан мумкин нест.");

async function getIssue(path: string, signal: AbortSignal) {
  const { data } = await api.get<Issue>(path, { signal });
  return data;
}

async function getActivity(path: string, signal: AbortSignal) {
  const events: Activity[] = [];
  let cursor: string | null = null;
  do {
    const { data }: { data: ActivityPage } = await api.get<ActivityPage>(path + "/activity", {
      signal, params: { cursor },
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
  const commentsKey = [...issueKey, "comments"];
  const activityKey = [...issueKey, "activity"];
  const attachmentsKey = [...issueKey, "attachments"];
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [activityTab, setActivityTab] = useState("comments");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "" },
  });
  const commentForm = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  const issue = useQuery({
    queryKey: issueKey,
    queryFn: ({ signal }) => getIssue(issuePath, signal),
    enabled: !!issueId,
  });
  const project = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: async ({ signal }) => (await api.get<{ name: string; identifier: string }>(path, { signal })).data,
  });
  const states = useQuery({
    queryKey: ["states", workspaceId, projectId],
    queryFn: async ({ signal }) => (await api.get<{ id: string; name: string }[]>(path + "/states", { signal })).data,
  });
  const comments = useQuery({
    queryKey: commentsKey,
    queryFn: async function getComments({ signal }) {
      const { data } = await api.get<Comment[]>(issuePath + "/comments", { signal });
      if (!Array.isArray(data)) throw new Error("Could not read task comments.");
      return data;
    },
    enabled: issue.isSuccess && activityTab === "comments",
  });
  const activity = useQuery({
    queryKey: activityKey,
    queryFn: ({ signal }) => getActivity(issuePath, signal),
    enabled: issue.isSuccess && activityTab === "activity",
  });
  const account = useQuery({
    queryKey: ["me"],
    queryFn: async function getMe({ signal }) {
      return (await api.get<{ id: string }>("/auth/me", { signal })).data;
    },
    enabled: issue.isSuccess,
  });
  const members = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async function getMembers({ signal }) {
      return (await api.get<Member[]>(path + "/members", { signal })).data;
    },
    enabled: issue.isSuccess,
  });
  const labels = useQuery({
    queryKey: ["labels", workspaceId, projectId],
    queryFn: async function getLabels({ signal }) {
      return (await api.get<IssueLabel[]>(path + "/labels", { signal })).data;
    },
    enabled: issue.isSuccess,
  });
  const attachments = useQuery({
    queryKey: attachmentsKey,
    queryFn: async function getAttachments({ signal }) {
      return (await api.get<Attachment[]>(issuePath + "/attachments", { signal })).data;
    },
    enabled: issue.isSuccess,
  });

  function refreshIssue() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: issueListKey }),
      queryClient.invalidateQueries({ queryKey: issueKey }),
    ]);
  }

  const editIssue = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) =>
      (await api.patch<Issue>(issuePath, { title: values.title, description: values.description || null })).data,
    onSuccess: async (data) => {
      queryClient.setQueryData(issueKey, data);
      await refreshIssue();
      setEditing(false);
    },
  });
  const deleteIssue = useMutation({
    mutationFn: () => api.delete(issuePath),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: issueListKey });
      router.replace(taskPath, { scroll: false });
    },
  });
  const postComment = useMutation({
    mutationFn: (values: z.infer<typeof commentSchema>) => api.post(issuePath + "/comments", values),
    onSuccess: async () => {
      await refreshIssue();
      commentForm.reset();
    },
  });
  const editComment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      api.patch(issuePath + "/comments/" + encodeURIComponent(id), { body }),
    onSuccess: async () => {
      await refreshIssue();
      commentForm.reset();
      setEditingCommentId(null);
    },
  });
  const deleteComment = useMutation({
    mutationFn: (id: string) => api.delete(issuePath + "/comments/" + encodeURIComponent(id)),
    onSuccess: refreshIssue,
  });
  const postAssignee = useMutation({
    mutationFn: (user_id: string) => api.post(issuePath + "/assignees", { user_id }),
    onSuccess: refreshIssue,
  });
  const deleteAssignee = useMutation({
    mutationFn: (id: string) => api.delete(issuePath + "/assignees/" + encodeURIComponent(id)),
    onSuccess: refreshIssue,
  });
  const postLabel = useMutation({
    mutationFn: (label_id: string) => api.post(issuePath + "/labels", { label_id }),
    onSuccess: refreshIssue,
  });
  const deleteLabel = useMutation({
    mutationFn: (id: string) => api.delete(issuePath + "/labels/" + encodeURIComponent(id)),
    onSuccess: refreshIssue,
  });
  const deleteAttachment = useMutation({
    mutationFn: (id: string) => api.delete(path + "/attachments/" + encodeURIComponent(id)),
    onSuccess: refreshIssue,
  });
  const postAttachment = useMutation({
    mutationFn: async (file: File) => {
      const { data: { attachment, upload } } = await api.post<AttachmentUpload>(issuePath + "/attachments", {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
      });
      try {
        const response = await fetch(upload.url, { method: "PUT", headers: upload.headers, body: file });
        if (!response.ok) throw new Error("Upload failed: " + response.status + " " + response.statusText);
      } catch (error) {
        await api.delete(path + "/attachments/" + encodeURIComponent(attachment.id)).catch(() => undefined);
        throw error;
      }
    },
    onSettled: refreshIssue,
  });

  const { language } = usePreferencesStore();
  const t = translations[language];
  const task = issue.data;
  const taskAssignees = (task?.assignees ?? []).flatMap((el) => el.user?.id ? [el.user] : []);
  const taskLabels = (task?.labels ?? []).flatMap((el) => {
    const label = el.label;
    return label?.id ? [labels.data?.find((item) => item.id === label.id) ?? label] : [];
  });
  const availableMembers = members.data?.filter((el) => !taskAssignees.some((user) => user.id === el.user_id));
  const availableLabels = labels.data?.filter((el) => !taskLabels.some((label) => label.id === el.id));
  const visibleComments = comments.data?.filter((el) => !el.deleted_at) ?? [];
  const commentPending = postComment.isPending || editComment.isPending || deleteComment.isPending;
  const commentError = postComment.error || editComment.error || deleteComment.error;
  const assigneeError = members.error || postAssignee.error || deleteAssignee.error;
  const labelError = labels.error || postLabel.error || deleteLabel.error;
  const fileError = attachments.error || postAttachment.error || deleteAttachment.error;
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

  function startEditingComment(comment: Comment) {
    postComment.reset();
    editComment.reset();
    deleteComment.reset();
    commentForm.reset({ body: comment.body });
    setEditingCommentId(comment.id);
  }

  function submitComment(values: z.infer<typeof commentSchema>) {
    if (editingCommentId) editComment.mutate({ id: editingCommentId, body: values.body });
    else postComment.mutate(values);
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
                  {comments.isPending && <p role="status" className={meta}>{t.loadingComments}</p>}
                  {comments.isError && <p role="alert" className="text-destructive">{errorText(comments.error)}</p>}
                  {comments.isSuccess && !visibleComments.length && <p className={meta}>{t.emptyComments}</p>}
                  {visibleComments.map((el) => (
                    <div key={el.id} className="flex gap-[10px] border-b border-border py-[8px]">
                      {el.author && <Avatar name={el.author.display_name} src={el.author.avatar_url ?? undefined} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-[8px]"><strong>{el.author?.display_name ?? "—"}</strong><span className={meta}>{formatDate(el.created_at)}</span></div>
                        <p className="whitespace-pre-wrap break-words">{el.body}</p>
                      </div>
                      {account.data?.id === el.author_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={t.commentMenu} disabled={commentPending}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => startEditingComment(el)}>{t.edit}</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              if (editingCommentId === el.id) {
                                setEditingCommentId(null);
                                commentForm.reset();
                              }
                              deleteComment.mutate(el.id);
                            }}>{t.delete}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                  <form className="mt-[12px] flex flex-col gap-[8px]" onSubmit={commentForm.handleSubmit(submitComment)}>
                    <Label htmlFor="task-comment">{editingCommentId ? t.editComment : t.comment}</Label>
                    <Textarea id="task-comment" rows={3} placeholder={t.commentPlaceholder} {...commentForm.register("body")} />
                    {commentForm.formState.errors.body && <p role="alert" className="text-destructive">{commentForm.formState.errors.body.message}</p>}
                    {commentError && <p role="alert" className="text-destructive">{errorText(commentError)}</p>}
                    <div className="flex justify-end gap-[8px]">
                      {editingCommentId && (
                        <Button type="button" variant="outline" size="sm" disabled={commentPending} onClick={() => {
                          editComment.reset();
                          setEditingCommentId(null);
                          commentForm.reset();
                        }}>{t.cancel}</Button>
                      )}
                      <Button type="submit" size="sm" disabled={commentPending}>{editingCommentId ? t.save : t.send}</Button>
                    </div>
                  </form>
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
              <section className="mt-[20px] grid gap-[8px]">
                <h3 className="font-semibold">{t.attachments}</h3>
                {attachments.isPending && <p role="status" className={meta}>{t.loadingAttachments}</p>}
                {attachments.isSuccess && !attachments.data.length && <p className={meta}>{t.emptyAttachments}</p>}
                {attachments.data?.map((el) => (
                  <div key={el.id} className="flex items-center gap-[8px] border-b border-border py-[4px]">
                    <a href={el.download_url} className="min-w-0 flex-1 truncate hover:underline">{el.file_name}</a>
                    <span className={meta}>{el.file_size.toLocaleString(language)} B</span>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t.delete + " " + el.file_name}
                      disabled={deleteAttachment.isPending || postAttachment.isPending} onClick={() => deleteAttachment.mutate(el.id)}><X /></Button>
                  </div>
                ))}
                <Label htmlFor="task-attachment">{t.attachFile}</Label>
                <Input id="task-attachment" type="file" className="max-w-[280px]" disabled={postAttachment.isPending}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    event.currentTarget.value = "";
                    setAttachmentError("");
                    postAttachment.reset();
                    deleteAttachment.reset();
                    const result = attachmentSchema.safeParse(file);
                    if (result.success) postAttachment.mutate(result.data);
                    else setAttachmentError(result.error.issues[0].message);
                  }} />
                {postAttachment.isPending && <p role="status" className={meta}>{t.uploading}</p>}
                {attachmentError && <p role="alert" className="text-destructive">{attachmentError}</p>}
                {fileError && <p role="alert" className="text-destructive">{errorText(fileError)}</p>}
              </section>
            </div>
            <aside className="border-t border-border px-[16px] py-[20px] text-[13px] md:border-t-0 md:border-l">
              <h3 className="font-semibold">{t.properties}</h3>
              <dl>
                {property(t.status, status ?? "—")}
                {property(t.priority, task.priority === "none" ? "—" : task.priority)}
                {property(t.assignees, (
                  <div className="grid gap-[4px] py-[6px]">
                    {taskAssignees.map((el) => (
                      <div key={el.id} className="flex items-center justify-between gap-[4px]">
                        <span>{el.display_name}</span>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.remove + " " + el.display_name}
                          disabled={deleteAssignee.isPending || postAssignee.isPending} onClick={() => deleteAssignee.mutate(el.id)}><X /></Button>
                      </div>
                    ))}
                    {!!availableMembers?.length && (
                      <Select value="" disabled={postAssignee.isPending || deleteAssignee.isPending} onValueChange={(value) => postAssignee.mutate(value)}>
                        <SelectTrigger><SelectValue placeholder={t.addAssignee} /></SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((el) => <SelectItem key={el.user_id} value={el.user_id}>{el.user.display_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {assigneeError && <p role="alert" className="text-destructive">{errorText(assigneeError)}</p>}
                  </div>
                ))}
                {property(t.labels, (
                  <div className="grid gap-[4px] py-[6px]">
                    {taskLabels.map((el) => (
                      <div key={el.id} className="flex items-center justify-between gap-[4px]">
                        <span className="flex items-center gap-[4px]">
                          <span aria-hidden="true" className="size-[8px] shrink-0 rounded-full" style={{ backgroundColor: el.color }} />
                          {el.name}
                        </span>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={t.remove + " " + el.name}
                          disabled={deleteLabel.isPending || postLabel.isPending} onClick={() => deleteLabel.mutate(el.id)}><X /></Button>
                      </div>
                    ))}
                    {!!availableLabels?.length && (
                      <Select value="" disabled={postLabel.isPending || deleteLabel.isPending} onValueChange={(value) => postLabel.mutate(value)}>
                        <SelectTrigger><SelectValue placeholder={t.addLabel} /></SelectTrigger>
                        <SelectContent>
                          {availableLabels.map((el) => (
                            <SelectItem key={el.id} value={el.id}>
                              <span className="flex items-center gap-[6px]">
                                <span aria-hidden="true" className="size-[8px] rounded-full" style={{ backgroundColor: el.color }} />
                                {el.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {labelError && <p role="alert" className="text-destructive">{errorText(labelError)}</p>}
                  </div>
                ))}
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
