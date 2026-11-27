"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorText } from "@/lib/api";

const schema = z.object({
  email: z.email("Email-ро дуруст нависед"),
  role: z.enum(["admin", "member", "guest"]),
});
type InviteForm = z.infer<typeof schema>;

export default function InviteMemberDialog() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "member" },
  });

  const postInvite = useMutation({
    mutationFn: async (values: InviteForm) => {
      const { data } = await api.post(`${w}/members/invite`, values);
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus /> Invite member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>Send an invitation by email.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => postInvite.mutate(values))} className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" placeholder="name@example.com" {...register("email")} />
            {errors.email && (
              <p role="alert" className="text-[12px] text-[#DC2626]">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-[6px]">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              {...register("role")}
              className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {postInvite.error && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errorText(postInvite.error)}
            </p>
          )}

          {postInvite.data && (
            <p className="text-[12px] break-all">Link: /invitations/{postInvite.data.token}</p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={postInvite.isPending}>
              {postInvite.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
