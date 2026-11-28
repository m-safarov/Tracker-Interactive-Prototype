"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  actor: { display_name: string };
}

const typeText: Record<string, string> = {
  issue_assigned: "assigned a task to you",
  comment_added: "commented on a task",
  mentioned: "mentioned you",
};

// Dev 2 — Ҳамаи огоҳиномаҳо. Figma: фрейми "Notifications".
export default function NotificationsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  // Сатри огоҳинома: unread — заминаи кабуди сабук ва нуқтаи кабуд.
  const row = "flex h-[64px] w-full items-center gap-[12px] border-b border-border px-[24px] text-left";
  const unread = "bg-primary/5";
  const dot = "size-[6px] rounded-full bg-primary";

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(w);
      return data;
    },
  });

  const { data: getNotifications = [], isPending, error } = useQuery({
    queryKey: ["notifications", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Notification[] }>(`${w}/notifications/`);
      return data.data;
    },
  });

  const postReadNotification = useMutation({
    mutationFn: (id: string) => api.post(`${w}/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
    },
  });

  const postReadAll = useMutation({
    mutationFn: () => api.post(`${w}/notifications/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", workspaceId] });
    },
  });

  const isEmpty = !isPending && !error && getNotifications.length === 0;

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="notifications" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", t.notifications]} title={t.notifications}>
          <Button type="button" size="sm" variant="outline" disabled={postReadAll.isPending} onClick={() => postReadAll.mutate()}>
            {t.markAll}
          </Button>
        </PageHeading>

        {/* Табҳо: All / Unread */}
        <Tabs value="all">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="all" asChild>
              <Link href={`${w}/notifications`}>{t.all}</Link>
            </TabsTrigger>
            <TabsTrigger value="unread" asChild>
              <Link href={`${w}/notifications/unread`}>{t.unread}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isPending && <p className="px-[24px] py-[12px] text-[12px] text-muted-foreground">Loading...</p>}
        {(error || postReadNotification.error || postReadAll.error) && (
          <p role="alert" className="px-[24px] py-[12px] text-[13px] text-[#DC2626]">
            {errorText(error || postReadNotification.error || postReadAll.error)}
          </p>
        )}
        {isEmpty && <p className="px-[24px] py-[24px] text-[12px] text-muted-foreground">No notifications yet</p>}

        {getNotifications.map((el) => (
          <button
            key={el.id}
            type="button"
            className={el.is_read ? row : `${row} ${unread}`}
            onClick={() => {
              if (!el.is_read) postReadNotification.mutate(el.id);
            }}
          >
            <Avatar name={el.actor.display_name} className="size-[32px] bg-pink-100 text-pink-700" />
            <div className="flex-1 text-[13px]">
              <p className="font-semibold">{el.actor.display_name}</p>
              <p className="text-muted-foreground">{typeText[el.type] ?? el.type}</p>
            </div>
            <span className="w-[60px] text-[12px] text-muted-foreground">
              {new Date(el.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <span className={el.is_read ? "size-[6px]" : dot} />
          </button>
        ))}
      </main>
    </div>
  );
}
