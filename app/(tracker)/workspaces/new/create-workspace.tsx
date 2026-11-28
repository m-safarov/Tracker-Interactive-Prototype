"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorText } from "@/lib/api";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

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

export default function CreateWorkspacePage() {
  const { language } = usePreferencesStore();
  const t = translations[language];
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  const postWorkspace = useMutation({
    mutationFn: (values: WorkspaceForm) => api.post("/workspaces/", values),
    onSuccess: (_response, values) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      router.push(`/workspaces/${values.slug}/projects`);
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-[16px]">
      <form
        onSubmit={handleSubmit((values) => postWorkspace.mutate(values))}
        className="flex w-full max-w-[360px] flex-col gap-[16px]"
      >
        <h1 className="text-[20px] font-semibold">Tracker</h1>
        <h2 className="text-[16px] font-semibold">{t.title}</h2>

        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="workspace-name">{t.name}</Label>
          <Input id="workspace-name" placeholder="Команда" {...register("name")} />
          {errors.name && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="workspace-address">{t.address}</Label>
          <Input
            id="workspace-address"
            placeholder="komanda"
            autoCapitalize="none"
            spellCheck={false}
            {...register("slug")}
          />
          {errors.slug && (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {errors.slug.message}
            </p>
          )}
        </div>

        {postWorkspace.error && (
          <p role="alert" className="text-[12px] text-[#DC2626]">
            {errorText(postWorkspace.error)}
          </p>
        )}
        <Button type="submit" className="mt-[4px] w-full" disabled={postWorkspace.isPending}>
          {postWorkspace.isPending ? "Creating..." : t.create}
        </Button>
      </form>
    </main>
  );
}
