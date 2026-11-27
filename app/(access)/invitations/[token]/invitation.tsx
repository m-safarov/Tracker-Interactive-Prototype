import Link from "next/link";
import { Button } from "@/components/ui/button";
import translations from "./page-translations.json";

// Dev 2 — Саҳифаи қабули даъват. Figma: фрейми "Invitation".
export default function InvitationPage() {
  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <main className="flex min-h-screen items-center justify-center p-[16px]">
      <div className="flex w-full max-w-[360px] flex-col gap-[16px] text-[13px]">
        <h1 className="text-[20px] font-semibold">Tracker</h1>
        <h2 className="text-[16px] font-semibold">{t.title}</h2>

        {/* Намуна: ном, workspace, нақш ва сана баъд аз API меоянд */}
        <p className="mt-[8px]">Madina Rahimova {t.invites} Demo Team.</p>
        <p>{t.role}: Member</p>
        <p className="text-[12px] text-muted-foreground">{t.expires} 3 Dec</p>

        <Button asChild className="mt-[8px] w-full">
          <Link href="/sign-in">{t.signIn}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/sign-up">{t.createAccount}</Link>
        </Button>
      </div>
    </main>
  );
}
