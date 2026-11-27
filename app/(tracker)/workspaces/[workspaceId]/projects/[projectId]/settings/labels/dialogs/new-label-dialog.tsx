"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dev 2 — Диалоги сохтани нишона. Танҳо дизайн, логика баъд илова мешавад.
export default function NewLabelDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus /> New label
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New label</DialogTitle>
          <DialogDescription>Labels help to group project tasks.</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="label-name">Name</Label>
            <Input id="label-name" placeholder="frontend" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="label-color">Color</Label>
            <Input id="label-color" type="color" defaultValue="#10B981" className="w-[64px] p-[4px]" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create label</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
