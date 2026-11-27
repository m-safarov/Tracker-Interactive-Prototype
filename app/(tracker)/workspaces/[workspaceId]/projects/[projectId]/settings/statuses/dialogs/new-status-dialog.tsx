"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dev 2 — Диалоги сохтани статус. Танҳо дизайн, логика баъд илова мешавад.
export default function NewStatusDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus /> New status
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New status</DialogTitle>
          <DialogDescription>Add a step to the project workflow.</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="status-name">Name</Label>
            <Input id="status-name" placeholder="In Review" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="status-color">Color</Label>
            <Input id="status-color" type="color" defaultValue="#3B82F6" className="w-[64px] p-[4px]" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
