"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import { api, errorText } from "@/lib/api";
import { useWorkspaceSettingsStore } from "../../store/workspace-settings-store";
import translations from "./page-translations.json";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface Member {
  user_id: string;
  role: "owner" | "admin" | "member" | "guest";
  user: { display_name: string };
}

const schema = z.object({
  name: z.string().trim().min(1, "Номро нависед").max(100, "Ном аз 100 ҳарф зиёд набошад"),
  slug: z
    .string()
    .trim()
    .min(2, "мин 2 ҳарф бошад")
    .max(50, "макс аз 50 ҳарф зиёд набошад")
    .regex(/^[a-z0-9-]+$/, "Танҳо ҳарфи хурди лотинӣ (a-z), рақам (0-9) ва тире (-)"),
});
type WorkspaceForm = z.infer<typeof schema>;

export default function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const w = `/workspaces/${workspaceId}`;
  const router = useRouter();
  const queryClient = useQueryClient();

  const t = translations.en;

  const { newOwnerId, setNewOwnerId } = useWorkspaceSettingsStore();
  const [transferOpen, setTransferOpen] = useState(false);

  const { data: getWorkspace, isPending, error } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Workspace>(w);
      return data;
    },
  });

  const { data: getMembers = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>(`${w}/members`);
      return data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceForm>({
    resolver: zodResolver(schema),
    values: getWorkspace ? { name: getWorkspace.name, slug: getWorkspace.slug } : undefined,
  });

  const editWorkspace = useMutation({
    mutationFn: (values: WorkspaceForm) => api.patch(w, values),
    onSuccess: (_response, values) => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      router.push(`/workspaces/${values.slug}/settings`);
    },
  });

  const postTransferOwnership = useMutation({
    mutationFn: () => api.post(`${w}/transfer-ownership`, { user_id: newOwnerId }),
    onSuccess: () => {
      setNewOwnerId("");
      setTransferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: () => api.delete(w),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      router.push("/workspaces/new");
    },
  });

  const otherMembers = getMembers.filter((member) => member.role !== "owner");

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar active="settings" />

      <main className="flex flex-1 flex-col">
        <PageHeading crumbs={[getWorkspace?.name ?? "", t.settings]} title={t.title} />

        {/* Табҳо: General / Members */}
        <Tabs value="general">
          <TabsList className="px-[24px] pt-[8px]">
            <TabsTrigger value="general" asChild>
              <Link href={`${w}/settings`}>{t.general}</Link>
            </TabsTrigger>
            <TabsTrigger value="members" asChild>
              <Link href={`${w}/settings/members`}>{t.members}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Карточкаи General: ном ва суроға */}
        <div className="p-[24px]">
          <Card className="max-w-[584px] gap-0 p-0">
            <CardHeader className="border-b border-border px-[16px] py-[14px]">
              <CardTitle className="text-[14px]">{t.general}</CardTitle>
            </CardHeader>
            <CardContent className="gap-[16px] p-[16px]">
              {isPending && <p className="text-[14px] text-[#64748B]">Loading...</p>}
              {error && (
                <p role="alert" className="text-[14px] text-[#DC2626]">
                  {errorText(error)}
                </p>
              )}

              {getWorkspace && (
                <form onSubmit={handleSubmit((values) => editWorkspace.mutate(values))} className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="workspace-name">{t.name}</Label>
                    <Input id="workspace-name" {...register("name")} />
                    {errors.name && (
                      <p role="alert" className="text-[12px] text-[#DC2626]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <Label htmlFor="workspace-address">{t.address}</Label>
                    <Input id="workspace-address" autoCapitalize="none" spellCheck={false} {...register("slug")} />
                    {errors.slug && (
                      <p role="alert" className="text-[12px] text-[#DC2626]">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>

                  {editWorkspace.error && (
                    <p role="alert" className="text-[12px] text-[#DC2626]">
                      {errorText(editWorkspace.error)}
                    </p>
                  )}
                  {deleteWorkspace.error && (
                    <p role="alert" className="text-[12px] text-[#DC2626]">
                      {errorText(deleteWorkspace.error)}
                    </p>
                  )}

                  <div className="flex items-center gap-[6px]">
                    <Button type="submit" disabled={editWorkspace.isPending}>
                      {editWorkspace.isPending ? "Saving..." : t.save}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => setTransferOpen(true)}
                    >
                      {t.transfer}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={deleteWorkspace.isPending}
                      onClick={() => {
                        if (window.confirm("Delete workspace?")) deleteWorkspace.mutate();
                      }}
                    >
                      {t.delete}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Диалоги Transfer ownership */}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.transfer}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-[12px]">
              <Label htmlFor="new-owner">New owner</Label>
              <select
                id="new-owner"
                value={newOwnerId}
                onChange={(event) => setNewOwnerId(event.target.value)}
                className="h-[36px] rounded-[6px] border border-[#E2E8F0] px-[8px] text-[14px]"
              >
                <option value="">Select a member</option>
                {otherMembers.map((el) => (
                  <option key={el.user_id} value={el.user_id}>
                    {el.user.display_name}
                  </option>
                ))}
              </select>

              {postTransferOwnership.error && (
                <p role="alert" className="text-[12px] text-[#DC2626]">
                  {errorText(postTransferOwnership.error)}
                </p>
              )}
              <Button
                type="button"
                disabled={!newOwnerId || postTransferOwnership.isPending}
                onClick={() => postTransferOwnership.mutate()}
              >
                {postTransferOwnership.isPending ? "Transferring..." : t.transfer}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
