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
});
type LabelForm = z.infer<typeof schema>;

interface LabelItem {
  id: string;
  name: string;
  color: string;
}

interface NewLabelDialogProps {
  label?: LabelItem;
  onClose?: () => void;
}

// Dev 2 — Диалоги сохтан ва тағйир додани нишона.
export default function NewLabelDialog({ label, onClose }: NewLabelDialogProps) {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(label !== undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LabelForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: label?.name ?? "", color: label?.color ?? "#10B981" },
  });

  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) onClose?.();
  }

  const postLabel = useMutation({
    mutationFn: (values: LabelForm) => api.post(`${p}/labels/`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  const editLabel = useMutation({
    mutationFn: (values: LabelForm) => api.patch(`${p}/labels/${label?.id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", workspaceId, projectId] });
      changeOpen(false);
    },
  });

  const saveLabel = label ? editLabel : postLabel;
  const buttonText = label ? "Save changes" : "Create label";

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {!label && (
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            <Plus /> New label
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label ? "Edit label" : "New label"}</DialogTitle>
          <DialogDescription>Labels help to group project tasks.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => saveLabel.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="label-name">Name</Label>
            <Input id="label-name" placeholder="frontend" {...register("name")} />
            {errors.name && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="label-color">Color</Label>
            <Input id="label-color" type="color" className="w-[64px] p-[4px]" {...register("color")} />
            {errors.color && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.color.message}
              </p>
            )}
          </div>

          {saveLabel.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(saveLabel.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveLabel.isPending}>
              {saveLabel.isPending ? "Saving..." : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
