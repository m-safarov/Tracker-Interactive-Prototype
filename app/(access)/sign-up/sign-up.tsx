import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import translations from "./page-translations.json";

export default function SignUpPage() {
  const t = translations.en;
  const field = "flex flex-col gap-[6px]";

  return (
    <main className="grid min-h-screen place-items-center px-[24px]">
      <section className="w-full max-w-[360px] -translate-y-[8px]">
        <h1 className="mb-[16px] text-[20px] font-semibold">{t.tracker}</h1>
        <h2 className="mb-[12px] text-[16px] font-semibold">{t.createAccount}</h2>
        <form className="flex flex-col gap-[10px]">
          <div className={field}>
            <Label htmlFor="sign-up-name">{t.name}</Label>
            <Input id="sign-up-name" name="name" autoComplete="name" />
          </div>
          <div className={field}>
            <Label htmlFor="sign-up-email">{t.email}</Label>
            <Input id="sign-up-email" name="email" type="email" autoComplete="email" />
          </div>
          <div className={field}>
            <Label htmlFor="sign-up-password">{t.password}</Label>
            <Input id="sign-up-password" name="password" type="password" autoComplete="new-password" />
          </div>
          <Button type="button" size="sm" className="mt-[6px] w-full">
            {t.createAccount}
          </Button>
        </form>
        <Link href="/sign-in" className="mt-[18px] inline-block text-[13px] text-primary hover:underline">
          {t.signIn}
        </Link>
      </section>
    </main>
  );
}
