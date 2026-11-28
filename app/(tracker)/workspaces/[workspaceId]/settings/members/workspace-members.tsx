"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import { useWorkspaceMembersStore } from "../../../store/workspace-members-store";
import InviteMemberDialog from "./dialogs/invite-member-dialog";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Workspace {
  name: string;
}

interface Member {
  user_id: string;
  role: "owner" | "admin" | "member" | "guest";
  user: { display_name: string };
}

// Рангҳои аватар аз дизайн — аз рӯи тартиби аъзо.
const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-slate-200 text-slate-700",
];

// Dev 2 — Аъзо ва нақшҳои workspace. Figma: фрейми "Workspace members".
export default function WorkspaceMembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const queryClient = useQueryClient();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  // Синфи як сатри аъзо — дар ҳамаи сатрҳо як хел.
  const row = "flex h-[48px] items-center gap-[8px] border-b border-border text-[13px]";

  const { selectedUserId, role, setSelectedUserId, setRole } = useWorkspaceMembersStore();
  const [roleOpen, setRoleOpen] = useState(false);

  const { data: getWorkspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(w);
      return data;
    },
  });

  const { data: getMembers = [], isPending, error } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>(`${w}/members`);
      return data;
    },
  });

  const editMemberRole = useMutation({
    mutationFn: () => api.patch(`${w}/members/${selectedUserId}`, { role }),
    onSuccess: () => {
      setRoleOpen(false);
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });

  const deleteMember = useMutation({
    mutationFn: (userId: string) => api.delete(`${w}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", t.settings]} title={t.title} />

        {/* Табҳо: General / Members */}
        <Tabs value="members">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${w}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${w}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="p-[24px]">
          <Card className="max-w-[920px] gap-0 p-0 pb-[32px]">
            <CardHeader className="items-center border-b border-border px-[16px] py-[8px]">
              <CardTitle className="text-[14px]">{t.members}</CardTitle>
              <InviteMemberDialog />
            </CardHeader>

            {/* Рӯйхати аъзо */}
            <div className="flex flex-col px-[16px]">
              {isPending && <p className="py-[12px] text-[13px] text-muted-foreground">Loading...</p>}
              {error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}
              {deleteMember.error && (
                <p role="alert" className="py-[12px] text-[13px] text-[#DC2626]">
                  {errorText(deleteMember.error)}
                </p>
              )}
              {!isPending && !error && getMembers.length === 0 && (
                <p className="py-[12px] text-[13px] text-muted-foreground">No members yet</p>
              )}

              {getMembers.map((el, index) => (
                <div key={el.user_id} className={row}>
                  <Avatar name={el.user.display_name} className={avatarColors[index % avatarColors.length]} />
                  <span className="flex-1 font-semibold">{el.user.display_name}</span>
                  <span className="w-[100px] text-[12px] text-muted-foreground capitalize">{el.role}</span>

                  {el.role === "owner" ? (
                    <span className="size-[28px]" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Member menu">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedUserId(el.user_id);
                            setRole(el.role);
                            setRoleOpen(true);
                          }}
                        >
                          {t.changeRole}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          destructive
                          onSelect={() => {
                            if (window.confirm("Remove member?")) deleteMember.mutate(el.user_id);
                          }}
                        >
                          {t.remove}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Диалоги Change role */}
        <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.changeRole}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-[12px]">
              <Label htmlFor="member-role">Role</Label>
              <select
                id="member-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>

              {editMemberRole.error && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errorText(editMemberRole.error)}
                </p>
              )}
              <Button type="button" disabled={editMemberRole.isPending} onClick={() => editMemberRole.mutate()}>
                {editMemberRole.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
