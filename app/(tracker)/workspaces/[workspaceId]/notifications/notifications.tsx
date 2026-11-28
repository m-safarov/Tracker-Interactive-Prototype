"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

// Dev 2 — Ҳамаи огоҳиномаҳо. Figma: фрейми "Notifications".
export default function NotificationsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  // Сатри огоҳинома: unread — заминаи кабуди сабук ва нуқтаи кабуд.
  const row = "flex h-[64px] items-center gap-[12px] border-b border-border px-[24px]";
  const unread = "bg-primary/5";
  const dot = "size-[6px] rounded-full bg-primary";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="notifications" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={["Demo Team", t.notifications]} title={t.notifications}>
          <Button type="button" size="sm" variant="outline">
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

        {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
        <div className={`${row} ${unread}`}>
          <Avatar name="Madina Rahimova" className="size-[32px] bg-pink-100 text-pink-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Madina Rahimova</p>
            <p className="text-muted-foreground">assigned WEB-1 to you</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">24 Nov</span>
          <span className={dot} />
        </div>
        <div className={`${row} ${unread}`}>
          <Avatar name="Daler Saidov" className="size-[32px] bg-sky-100 text-sky-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Daler Saidov</p>
            <p className="text-muted-foreground">commented on WEB-1</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">24 Nov</span>
          <span className={dot} />
        </div>
        <div className={`${row} ${unread}`}>
          <Avatar name="Nigina Usmonova" className="size-[32px] bg-emerald-100 text-emerald-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Nigina Usmonova</p>
            <p className="text-muted-foreground">mentioned you in WEB-10</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">25 Nov</span>
          <span className={dot} />
        </div>
        <div className={`${row} ${unread}`}>
          <Avatar name="Anna Petrova" className="size-[32px] bg-orange-100 text-orange-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Anna Petrova</p>
            <p className="text-muted-foreground">commented on WEB-7</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">25 Nov</span>
          <span className={dot} />
        </div>
        <div className={row}>
          <Avatar name="Madina Rahimova" className="size-[32px] bg-pink-100 text-pink-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Madina Rahimova</p>
            <p className="text-muted-foreground">mentioned you in WEB-5</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">23 Nov</span>
          <span className="size-[6px]" />
        </div>
        <div className={row}>
          <Avatar name="Daler Saidov" className="size-[32px] bg-sky-100 text-sky-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Daler Saidov</p>
            <p className="text-muted-foreground">assigned WEB-3 to you</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">22 Nov</span>
          <span className="size-[6px]" />
        </div>
        <div className={row}>
          <Avatar name="Nigina Usmonova" className="size-[32px] bg-emerald-100 text-emerald-700" />
          <div className="flex-1 text-[13px]">
            <p className="font-semibold">Nigina Usmonova</p>
            <p className="text-muted-foreground">commented on WEB-9</p>
          </div>
          <span className="w-[60px] text-[12px] text-muted-foreground">21 Nov</span>
          <span className="size-[6px]" />
        </div>
      </main>
    </div>
  );
}
