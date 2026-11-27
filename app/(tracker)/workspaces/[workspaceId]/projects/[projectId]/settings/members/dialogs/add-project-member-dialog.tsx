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
import { Label } from "@/components/ui/label";
import { api, errorText } from "@/lib/api";

interface Member {
  user_id: string;
  user: { display_name: string };
}

const schema = z.object({
  user_id: z.string().min(1, "Аъзоро интихоб кунед"),
});
type ProjectMemberForm = z.infer<typeof schema>;

// Dev 2 — Диалоги илова кардани аъзо ба проект.
export default function AddProjectMemberDialog() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const p = `/workspaces/${workspaceId}/projects/${projectId}`;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectMemberForm>({
    resolver: zodResolver(schema),
    defaultValues: { user_id: "" },
  });

  const { data: getMembers = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>(`/workspaces/${workspaceId}/members`);
      return data;
    },
  });

  const { data: getProjectMembers = [] } = useQuery({
    queryKey: ["project-members", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>(`${p}/members`);
      return data;
    },
  });

  const projectMemberIds = getProjectMembers.map((el) => el.user_id);
  const options = getMembers.filter((member) => !projectMemberIds.includes(member.user_id));

  const postProjectMember = useMutation({
    mutationFn: (values: ProjectMemberForm) => api.post(`${p}/members`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", workspaceId, projectId] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus /> Add member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Add a workspace member to this project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => postProjectMember.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-member">Member</Label>
            <select
              id="project-member"
              {...register("user_id")}
              className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
            >
              <option value="">Choose a member</option>
              {options.map((el) => (
                <option key={el.user_id} value={el.user_id}>
                  {el.user.display_name}
                </option>
              ))}
            </select>
            {errors.user_id && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.user_id.message}
              </p>
            )}
            {options.length === 0 && <p className="text-[12px] text-muted-foreground">All workspace members are already in this project.</p>}
          </div>

          {postProjectMember.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(postProjectMember.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={postProjectMember.isPending}>
              {postProjectMember.isPending ? "Adding..." : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
