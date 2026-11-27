import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import translations from "./page-translations.json";

// Dev 2 — Формаи сохтани workspace. Figma: фрейми "Create workspace".
export default function CreateWorkspacePage() {
  // Матнҳо аз page-translations.json. Логикаи иваз кардани забонро Dev1 менависад.
  const t = translations.en;

  return (
    <main className="flex min-h-screen items-center justify-center p-[16px]">
      <form className="flex w-full max-w-[360px] flex-col gap-[16px]">
        <h1 className="text-[20px] font-semibold">Tracker</h1>
        <h2 className="text-[16px] font-semibold">{t.title}</h2>

        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="workspace-name">{t.name}</Label>
          <Input id="workspace-name" placeholder="Команда" />
        </div>
        <div className="flex flex-col gap-[6px]">
          <Label htmlFor="workspace-address">{t.address}</Label>
          <Input id="workspace-address" placeholder="komanda" />
        </div>

        <Button type="submit" className="mt-[4px] w-full">
          {t.create}
        </Button>
      </form>
    </main>
  );
}
