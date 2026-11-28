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

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  lead_id: z.string(),
  start_date: z.string().min(1, "Санаи оғозро интихоб кунед"),
  target_date: z.string().min(1, "Санаи анҷомро интихоб кунед"),
});
type ModuleForm = z.infer<typeof schema>;

// Dev 2 — Диалоги сохтани модул.
export default function NewModuleDialog() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", lead_id: "", start_date: "", target_date: "" },
  });

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
        start_date: new Date(values.start_date).toISOString(),
        target_date: new Date(values.target_date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus /> New module
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New module</DialogTitle>
          <DialogDescription>Group related tasks into a module.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => postModule.mutate(values))} className="flex flex-col gap-[12px]">
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

          {postModule.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(postModule.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={postModule.isPending}>
              {postModule.isPending ? "Creating..." : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
