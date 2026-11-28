"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import TaskDetailPage from "../[taskId]/task-detail";
import translations from "../page-translations.json";

export default function TaskDetailSheet() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const issueId = searchParams.get("issue");
  const path = "/workspaces/" + encodeURIComponent(workspaceId) + "/projects/" + encodeURIComponent(projectId) + "/tasks";
  const t = translations.en;

  if (!issueId) return null;

  function close(open: boolean) {
    if (open) return;
    const next = new URLSearchParams(searchParams);
    next.delete("issue");
    router.replace(path + (next.size ? "?" + next.toString() : ""), { scroll: false });
  }

  return (
    <Sheet open onOpenChange={close}>
      <SheetContent className="gap-0 sm:max-w-[840px]">
        <SheetHeader className="shrink-0 gap-[4px] pr-[46px]">
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription className="sr-only">{t.tasks}</SheetDescription>
          <Button asChild variant="ghost" size="sm" className="self-start">
            <Link href={path + "/" + encodeURIComponent(issueId)}><ExternalLink aria-hidden="true" />{t.sheet.openPage}</Link>
          </Button>
        </SheetHeader>
        <TaskDetailPage key={issueId} />
      </SheetContent>
    </Sheet>
  );
}
