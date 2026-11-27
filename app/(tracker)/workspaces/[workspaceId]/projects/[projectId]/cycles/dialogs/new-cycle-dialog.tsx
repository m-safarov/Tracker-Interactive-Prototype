"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dev 2 — Диалоги сохтани давра. Танҳо дизайн, логика баъд илова мешавад.
export default function NewCycleDialog() {
  return (
    <Dialog>
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

        <form className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="cycle-name">Name</Label>
            <Input id="cycle-name" placeholder="Sprint 13" />
          </div>
          <div className="flex gap-[12px]">
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="cycle-start">Start date</Label>
              <Input id="cycle-start" type="date" />
            </div>
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="cycle-end">End date</Label>
              <Input id="cycle-end" type="date" />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create cycle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
