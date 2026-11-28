"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorText } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(50, "Ном аз 50 ҳарф зиёд набошад"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ранг бояд #RRGGBB бошад"),
  group: z.enum(["backlog", "unstarted", "started", "completed", "cancelled"]),
});
type StatusForm = z.infer<typeof schema>;

interface StatusItem {
  id: string;
  name: string;
  color: string;
  group: "backlog" | "unstarted" | "started" | "completed" | "cancelled";
}

interface NewStatusDialogProps {
  status?: StatusItem;
  onClose?: () => void;
}

// Dev 2 — Диалоги сохтан ва тағйир додани статус.
export default function NewStatusDialog({ status, onClose }: NewStatusDialogProps) {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(status !== undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StatusForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: status?.name ?? "", color: status?.color ?? "#3B82F6", group: status?.group ?? "unstarted" },
  });

  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) onClose?.();
  }

  const postStatus = useMutation({
    mutationFn: (values: StatusForm) => api.post(`${p}/states/`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  const editStatus = useMutation({
    mutationFn: (values: StatusForm) => api.patch(`${p}/states/${status?.id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states", workspaceId, projectId] });
      changeOpen(false);
    },
  });

  const saveStatus = status ? editStatus : postStatus;
  const buttonText = status ? "Save changes" : "Create status";

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {!status && (
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            <Plus /> New status
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{status ? "Edit status" : "New status"}</DialogTitle>
          <DialogDescription>Add a step to the project workflow.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => saveStatus.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="status-name">Name</Label>
            <Input id="status-name" placeholder="In Review" {...register("name")} />
            {errors.name && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="status-color">Color</Label>
            <Input id="status-color" type="color" className="w-[64px] p-[4px]" {...register("color")} />
            {errors.color && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.color.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="status-group">Group</Label>
            <select
              id="status-group"
              {...register("group")}
              className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
            >
              <option value="backlog">Backlog</option>
              <option value="unstarted">Unstarted</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {saveStatus.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(saveStatus.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveStatus.isPending}>
              {saveStatus.isPending ? "Saving..." : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
