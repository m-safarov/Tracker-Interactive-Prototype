"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Dev 2 — Диалоги сохтани проект. Танҳо дизайн, логикаи сохтан баъд илова мешавад.
export default function NewProjectDialog() {
  return (
    <Dialog>
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

        <form className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" placeholder="Website" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-identifier">Identifier</Label>
            <Input id="project-identifier" placeholder="WEB" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="project-description">Description</Label>
            <Textarea id="project-description" placeholder="What is this project about?" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
