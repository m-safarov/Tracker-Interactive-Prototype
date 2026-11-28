"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, errorText } from "@/lib/api";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";
import translations from "./page-translations.json";

interface Invite {
  role: string;
  expires_at: string;
  workspace: { name: string; slug: string };
  invited_by: { display_name: string };
}

// Dev 2 — Саҳифаи қабули даъват. Figma: фрейми "Invitation".
export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const { language } = usePreferencesStore();
  const t = translations[language];

  const { data: getInvite, isPending, error } = useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data } = await api.get<Invite>(`/workspaces/_invites/${token}`);
      return data;
    },
  });

  const postAcceptInvite = useMutation({
    mutationFn: () => api.post(`/workspaces/_invites/${token}/accept`),
    onSuccess: () => {
      router.push(`/workspaces/${getInvite?.workspace.slug}/projects`);
    },
  });

  const expires = getInvite ? new Date(getInvite.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

  return (
    <main className="flex min-h-screen items-center justify-center p-[16px]">
      <div className="flex w-full max-w-[360px] flex-col gap-[16px] text-[13px]">
        <h1 className="text-[20px] font-semibold">Tracker</h1>
        <h2 className="text-[16px] font-semibold">{t.title}</h2>

        {isPending && <p className="text-[12px] text-muted-foreground">Loading...</p>}
        {(error || postAcceptInvite.error) && (
          <p role="alert" className="text-[13px] text-[#DC2626]">
            {errorText(error || postAcceptInvite.error)}
          </p>
        )}

        {getInvite && (
          <>
            <p className="mt-[8px]">
              {getInvite.invited_by.display_name} {t.invites} {getInvite.workspace.name}.
            </p>
            <p>
              {t.role}: <span className="capitalize">{getInvite.role}</span>
            </p>
            <p className="text-[12px] text-muted-foreground">
              {t.expires} {expires}
            </p>

            <Button type="button" className="mt-[8px] w-full" disabled={postAcceptInvite.isPending} onClick={() => postAcceptInvite.mutate()}>
              {postAcceptInvite.isPending ? "Accepting..." : "Accept invitation"}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/sign-in?next=/invitations/${token}`}>{t.signIn}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/sign-up?invite=${token}`}>{t.createAccount}</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
