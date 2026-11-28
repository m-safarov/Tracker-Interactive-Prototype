"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorText } from "@/lib/api";

interface ProjectMember {
  user_id: string;
  user: { display_name: string };
}

interface Module {
  id: string;
  name: string;
  status: string;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
}

interface NewModuleDialogProps {
  module?: Module;
  onClose?: () => void;
}

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  lead_id: z.string(),
  status: z.enum(["backlog", "in_progress", "paused", "completed", "cancelled"]),
  start_date: z.string().min(1, "Санаи оғозро интихоб кунед"),
  target_date: z.string().min(1, "Санаи анҷомро интихоб кунед"),
});
type ModuleForm = z.infer<typeof schema>;

// Dev 2 — Диалоги сохтан ва тағйир додани модул.
export default function NewModuleDialog({ module, onClose }: NewModuleDialogProps) {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(!!module);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: module?.name ?? "",
      lead_id: module?.lead_id ?? "",
      status: (module?.status as ModuleForm["status"]) ?? "backlog",
      start_date: module?.start_date?.slice(0, 10) ?? "",
      target_date: module?.target_date?.slice(0, 10) ?? "",
    },
  });

  function changeOpen(value: boolean) {
    setOpen(value);
    if (!value) onClose?.();
  }

  const { data: getProjectMembers = [] } = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectMember[]>(`${p}/members`);
      return data;
    },
  });

  const postModule = useMutation({
    mutationFn: (values: ModuleForm) =>
      api.post(`${p}/modules/`, {
        name: values.name,
        lead_id: values.lead_id || null,
        status: values.status,
        start_date: new Date(values.start_date).toISOString(),
        target_date: new Date(values.target_date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  const editModule = useMutation({
    mutationFn: (values: ModuleForm) =>
      api.patch(`${p}/modules/${module?.id}`, {
        name: values.name,
        lead_id: values.lead_id || null,
        status: values.status,
        start_date: new Date(values.start_date).toISOString(),
        target_date: new Date(values.target_date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["module", workspaceId, projectId, module?.id] });
      changeOpen(false);
    },
  });

  const saveModule = module ? editModule : postModule;

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      {!module && (
        <DialogTrigger asChild>
          <Button type="button" size="sm">
            <Plus /> New module
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? "Edit module" : "New module"}</DialogTitle>
          <DialogDescription>Group related tasks into a module.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => saveModule.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="module-name">Name</Label>
            <Input id="module-name" placeholder="Checkout" {...register("name")} />
            {errors.name && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="module-lead">Lead</Label>
            <select
              id="module-lead"
              {...register("lead_id")}
              className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
            >
              <option value="">Choose a lead</option>
              {getProjectMembers.map((el) => (
                <option key={el.user_id} value={el.user_id}>
                  {el.user.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="module-status">Status</Label>
            <select
              id="module-status"
              {...register("status")}
              className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
            >
              <option value="backlog">Backlog</option>
              <option value="in_progress">In progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-[12px]">
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="module-start">Start date</Label>
              <Input id="module-start" type="date" {...register("start_date")} />
              {errors.start_date && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="module-end">End date</Label>
              <Input id="module-end" type="date" {...register("target_date")} />
              {errors.target_date && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errors.target_date.message}
                </p>
              )}
            </div>
          </div>

          {saveModule.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(saveModule.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saveModule.isPending}>
              {saveModule.isPending ? "Saving..." : module ? "Save changes" : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
