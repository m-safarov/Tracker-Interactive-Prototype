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
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  start_date: z.string().min(1, "Санаи оғозро интихоб кунед"),
  end_date: z.string().min(1, "Санаи анҷомро интихоб кунед"),
});
type CycleForm = z.infer<typeof schema>;

// Dev 2 — Диалоги сохтани давра.
export default function NewCycleDialog() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CycleForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", start_date: "", end_date: "" },
  });

  const postCycle = useMutation({
    mutationFn: (values: CycleForm) =>
      api.post(`${p}/cycles/`, {
        name: values.name,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus /> New cycle
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New cycle</DialogTitle>
          <DialogDescription>Plan a time box for the team.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => postCycle.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="cycle-name">Name</Label>
            <Input id="cycle-name" placeholder="Sprint 13" {...register("name")} />
            {errors.name && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex gap-[12px]">
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="cycle-start">Start date</Label>
              <Input id="cycle-start" type="date" {...register("start_date")} />
              {errors.start_date && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="cycle-end">End date</Label>
              <Input id="cycle-end" type="date" {...register("end_date")} />
              {errors.end_date && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          {postCycle.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(postCycle.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={postCycle.isPending}>
              {postCycle.isPending ? "Creating..." : "Create cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
