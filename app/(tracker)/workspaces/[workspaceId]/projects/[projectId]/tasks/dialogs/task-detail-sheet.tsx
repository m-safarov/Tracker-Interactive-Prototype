"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, FileText, Link2, MoreHorizontal, Paperclip, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import translations from "../page-translations.json";

export default function TaskDetailSheet() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const path = `/workspaces/${workspaceId}/projects/${projectId}/tasks`;
  const t = translations.en;
  const copy = t.sheet;
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
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-[35px] max-w-full justify-start px-[0px] font-normal">
          <span className="truncate">{copy.checkout}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="shrink-0 justify-between pr-[40px]">
          <span className={meta}>WEB-1</span>
          <div className={actions}>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.copyLink}><Link2 /></Button>
            <Button variant="ghost" size="icon-sm" asChild><Link href={`${path}/web-1`} aria-label={copy.openPage}><ExternalLink /></Link></Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.menu}><MoreHorizontal /></Button>
          </div>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 overflow-auto md:grid-cols-[minmax(0,1fr)_279px]">
          <div className="min-w-0 px-[24px] py-[24px] text-[13px] leading-[16px]">
            <SheetTitle className="mb-[16px]">{copy.checkout}</SheetTitle>
            <section className="border-b border-border pb-[12px]">
              <div className={sectionHeader}>
                <h2>{copy.description}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}>{copy.edit}</Button>
              </div>
              <SheetDescription className="leading-[16px] text-foreground">{copy.checkoutDescription}</SheetDescription>
            </section>

            <section className="border-b border-border py-[4px]">
              <div className={sectionHeader}>
                <h2>{copy.subTasks}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}><Plus />{copy.subTask}</Button>
              </div>
              <div className={sectionHeader}>
                <h2>{copy.relations}</h2>
                <Button type="button" variant="ghost" size="sm" className={textButton}><Plus />{copy.relation}</Button>
              </div>
            </section>

            <section className="border-b border-border pt-[6px] pb-[16px]">
              <div className={sectionHeader}>
                <h2>{copy.attachments}</h2>
                <Button type="button" variant="outline" size="sm"><Paperclip />{copy.attachFile}</Button>
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
                <TabsTrigger value="comments" className={tab}>{copy.comments}</TabsTrigger>
                <TabsTrigger value="activity" className={tab}>{copy.activity}</TabsTrigger>
              </TabsList>
              <TabsContent value="comments">
                {/* Намуна: баъд ба .map() бо API иваз мешавад. */}
                <div className="flex gap-[10px] pt-[4px]">
                  <Avatar name="Madina Rahimova" />
                  <div className="min-w-0 flex-1">
                    <div className={commentHeader}><strong>Madina Rahimova</strong><span className={meta}>{copy.yesterday}</span></div>
                    <p className="mt-[6px]">{copy.firstComment}</p>
                    <Button type="button" variant="ghost" size="sm" className="my-[6px] h-[24px] px-[0px]">{copy.reply}</Button>
                    <div className="flex gap-[8px]">
                      <Avatar name="Daler Saidov" className="size-[20px] text-[8px]" />
                      <div>
                        <div className={commentHeader}><strong>Daler Saidov</strong><span className={meta}>{copy.hoursAgo}</span></div>
                        <p className="mt-[4px]">{copy.secondComment}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <form className="mt-[30px] rounded-[6px] border border-border p-[10px] focus-within:border-primary [&>textarea]:border-0">
                  <Label htmlFor="sheet-comment" className="sr-only">{copy.comment}</Label>
                  <Textarea id="sheet-comment" placeholder={copy.commentPlaceholder} rows={1} className="min-h-[28px] resize-none p-[0px]" />
                  <div className="flex justify-end"><Button type="button" size="sm">{copy.comment}</Button></div>
                </form>
              </TabsContent>
              <TabsContent value="activity"><p className={meta}>{copy.emptyActivity}</p></TabsContent>
            </Tabs>
          </div>

          <aside className="border-t border-border px-[15px] py-[24px] text-[13px] md:border-t-0 md:border-l">
            <h2 className="font-semibold">{copy.properties}</h2>
            <dl>
              {property(copy.status, copy.inProgress)}
              {property(copy.priority, copy.urgent)}
              {property(copy.assignees, "Madina Rahimova")}
              {property(copy.labels, <>{copy.bug} · {copy.frontend}</>)}
              {property(copy.startDate, "18 Nov")}
              {property(copy.dueDate, <span className="text-destructive">24 Nov</span>)}
              {property(copy.estimate, "5")}
              {property(copy.parentTask, "—")}
              {property(copy.cycle, "Sprint 12")}
              {property(copy.modules, copy.checkoutModule)}
              {property(copy.createdBy, "Madina Rahimova")}
              {property(copy.created, "18 Nov")}
              {property(copy.updated, "24 Nov")}
              {property(copy.completed, "—")}
            </dl>
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  );
}
