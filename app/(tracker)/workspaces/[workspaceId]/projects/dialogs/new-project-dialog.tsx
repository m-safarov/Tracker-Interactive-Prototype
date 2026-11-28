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
import { Textarea } from "@/components/ui/textarea";
import { api, errorText } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  identifier: z
    .string()
    .trim()
    .min(1, "Identifier-ро нависед")
    .max(10, "Identifier аз 10 ҳарф зиёд набошад")
    .regex(/^[A-Z0-9]+$/, "Танҳо ҳарфи калони лотинӣ (A-Z) ва рақам (0-9)"),
  description: z.string().max(500, "Тавсиф аз 500 ҳарф зиёд набошад"),
});
type ProjectForm = z.infer<typeof schema>;

export default function NewProjectDialog() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", identifier: "", description: "" },
  });

  const postProject = useMutation({
    mutationFn: (values: ProjectForm) => api.post(`/workspaces/${workspaceId}/projects/`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus /> New project
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Create a project for your team.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => postProject.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" placeholder="Website" {...register("name")} />
            {errors.name && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-identifier">Identifier</Label>
            <Input id="project-identifier" placeholder="WEB" autoCapitalize="characters" {...register("identifier")} />
            {errors.identifier && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.identifier.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-description">Description</Label>
            <Textarea id="project-description" placeholder="What is this project about?" {...register("description")} />
            {errors.description && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.description.message}
              </p>
            )}
          </div>

          {postProject.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(postProject.error)}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={postProject.isPending}>
              {postProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
