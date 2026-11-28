"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dev 2 — Диалоги сохтани модул. Танҳо дизайн, логика баъд илова мешавад.
export default function NewModuleDialog() {
  return (
    <Dialog>
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

        <form className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="module-name">Name</Label>
            <Input id="module-name" placeholder="Checkout" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label>Lead</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="madina">Madina Rahimova</SelectItem>
                <SelectItem value="anna">Anna Petrova</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-[12px]">
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="module-start">Start date</Label>
              <Input id="module-start" type="date" />
            </div>
            <div className="flex flex-1 flex-col gap-[6px]">
              <Label htmlFor="module-end">End date</Label>
              <Input id="module-end" type="date" />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create module</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
