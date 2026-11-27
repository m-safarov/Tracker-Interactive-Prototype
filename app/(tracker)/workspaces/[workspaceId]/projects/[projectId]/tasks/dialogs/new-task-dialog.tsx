import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import translations from "../page-translations.json";

export default function NewTaskDialog() {
  const t = translations.en;
  const copy = t.newTask;
  const field = "flex flex-col gap-[6px]";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="w-[120px]"><Plus />{copy.newTask}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.newTask}</DialogTitle>
          <DialogDescription>{copy.introduction}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-[14px]">
          <div className={field}>
            <Label htmlFor="new-task-title">{copy.title}</Label>
            <Input id="new-task-title" name="title" placeholder={copy.taskTitle} />
          </div>
          <div className={field} role="group" aria-label={copy.status}>
            <span>{copy.status}</span>
            <Select defaultValue="todo">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">{copy.todo}</SelectItem>
                <SelectItem value="in-progress">{copy.inProgress}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" size="sm">{copy.cancel}</Button></DialogClose>
            <DialogClose asChild><Button type="button" size="sm">{copy.create}</Button></DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
