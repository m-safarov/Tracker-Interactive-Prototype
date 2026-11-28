"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Link2, MoreHorizontal, Paperclip, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

export default function TaskDetailPage() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
  const t = translations.en;
  const meta = "text-[12px] text-muted-foreground";
  const actions = "flex items-center gap-[5px] text-muted-foreground";
  const sectionHeader = "flex min-h-[42px] items-center justify-between gap-[8px] font-semibold";
  const textButton = "text-muted-foreground";
  const commentHeader = "flex flex-wrap items-center gap-[10px]";
  const tab = "h-[34px] pb-[0px] data-[state=active]:text-primary";
  const propertyRow = "grid min-h-[41px] grid-cols-[85px_minmax(0,1fr)] items-center gap-[10px] border-b border-border";

  function attachment(name: string, size: string) {
    return (
      <li className="flex min-h-[32px] items-center gap-[8px] rounded-[6px] bg-muted px-[10px]">
        <FileText className="size-[14px] text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1 break-all">{name}</span>
        <span className={meta}>{size}</span>
      </li>
    );
  }

  function property(name: string, value: ReactNode) {
    return <div className={propertyRow}><dt className={meta}>{name}</dt><dd>{value}</dd></div>;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <WorkspaceSidebar active="tasks" />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 [&>div:last-child]:hidden">
          <PageHeading crumbs={[t.team, t.website, "WEB-1"]} title={t.checkout} />
        </div>
        <div className="flex min-h-[48px] items-center justify-between border-b border-border pr-[8px] pl-[24px]">
          <span className={meta}>WEB-1</span>
          <div className={actions}>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t.copyLink}><Link2 /></Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t.menu}><MoreHorizontal /></Button>
            <Button variant="ghost" size="icon-sm" asChild><Link href={path} aria-label={t.closePage}><X /></Link></Button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 overflow-auto md:grid-cols-[minmax(0,1fr)_279px]">
          <div className="min-w-0 px-[24px] py-[24px] text-[13px] leading-[16px]">
            <h1 className="mb-[36px] text-[20px] leading-[24px] font-semibold">{t.checkout}</h1>
            <section className="border-b border-border pb-[12px]">
              <div className={sectionHeader}>
                <h2>{t.description}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}>{t.edit}</Button>
              </div>
              <p>{t.checkoutDescription}</p>
            </section>

            <section className="border-b border-border py-[4px]">
              <div className={sectionHeader}>
                <h2>{t.subTasks}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}><Plus />{t.subTask}</Button>
              </div>
              <div className={sectionHeader}>
                <h2>{t.relations}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}><Plus />{t.relation}</Button>
              </div>
            </section>

            <section className="border-b border-border pt-[6px] pb-[16px]">
              <div className={sectionHeader}>
                <h2>{t.attachments}</h2>
                <Button type="button" variant="outline" size="sm"><Paperclip />{t.attachFile}</Button>
              </div>
              <ul className="flex flex-col gap-[2px]">
                {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
                {attachment("safari-checkout.png", "2.4 MB")}
                {attachment("checkout-notes.pdf", "184 KB")}
                {attachment("safari-console.txt", "6 KB")}
              </ul>
            </section>

            <Tabs defaultValue="comments" className="mt-[12px]">
              <TabsList className="gap-[24px]">
                <TabsTrigger value="comments" className={tab}>{t.comments}</TabsTrigger>
                <TabsTrigger value="activity" className={tab}>{t.activity}</TabsTrigger>
              </TabsList>
              <TabsContent value="comments">
                {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
                <div className="flex gap-[10px] pt-[4px]">
                  <Avatar name="Madina Rahimova" />
                  <div className="min-w-0 flex-1">
                    <div className={commentHeader}><strong>Madina Rahimova</strong><span className={meta}>{t.yesterday}</span></div>
                    <p className="mt-[6px]">{t.firstComment}</p>
                    <Button type="button" variant="ghost" size="sm" className="my-[6px] h-[24px] px-[0px]">{t.reply}</Button>
                    <div className="flex gap-[8px]">
                      <Avatar name="Daler Saidov" className="size-[20px] text-[8px]" />
                      <div>
                        <div className={commentHeader}><strong>Daler Saidov</strong><span className={meta}>{t.hoursAgo}</span></div>
                        <p className="mt-[4px]">{t.secondComment}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <form className="mt-[30px] rounded-[6px] border border-border p-[10px] focus-within:border-primary [&>textarea]:border-0">
                  <Label htmlFor="task-comment" className="sr-only">{t.comment}</Label>
                  <Textarea id="task-comment" placeholder={t.commentPlaceholder} rows={1} className="min-h-[28px] resize-none p-[0px]" />
                  <div className="flex justify-end"><Button type="button" size="sm">{t.comment}</Button></div>
                </form>
              </TabsContent>
              <TabsContent value="activity"><p className={meta}>{t.emptyActivity}</p></TabsContent>
            </Tabs>
          </div>

          <aside className="border-t border-border px-[15px] py-[24px] text-[13px] md:border-t-0 md:border-l">
            <h2 className="font-semibold">{t.properties}</h2>
            <dl>
              {property(t.status, t.inProgress)}
              {property(t.priority, t.urgent)}
              {property(t.assignees, "Madina Rahimova")}
              {property(t.labels, <>{t.bug} · {t.frontend}</>)}
              {property(t.startDate, "18 Nov")}
              {property(t.dueDate, <span className="text-destructive">24 Nov</span>)}
              {property(t.estimate, "5")}
              {property(t.parentTask, "—")}
              {property(t.cycle, "Sprint 12")}
              {property(t.modules, t.checkoutModule)}
              {property(t.createdBy, "Madina Rahimova")}
              {property(t.created, "18 Nov")}
              {property(t.updated, "24 Nov")}
              {property(t.completed, "—")}
            </dl>
          </aside>
        </div>
      </main>
    </div>
  );
}
