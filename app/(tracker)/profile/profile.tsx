import { Globe } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeading from "@/components/page-heading";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import translations from "./page-translations.json";

export default function ProfilePage() {
  const t = translations.en;
  const field = "flex flex-col gap-[6px]";
  const cardHeader = "-mx-[16px] -mt-[16px] min-h-[48px] items-center border-b border-border px-[16px]";
  const preference = "flex flex-wrap items-center justify-between gap-[8px]";
  const select = "h-[32px] w-[194px] max-w-full";

  return (
    <div className="flex min-h-screen">
      <WorkspaceSidebar />
      <main className="min-w-0 flex-1">
        <PageHeading crumbs={[t.team, t.profile]} title={t.profile} />
        <div className="flex w-full max-w-[632px] flex-col gap-[16px] px-[24px] py-[28px] text-[13px]">
          <Card className="gap-[16px] pb-[20px]">
            <CardHeader className={cardHeader}><CardTitle>{t.profile}</CardTitle></CardHeader>
            <Avatar name="Farrukh Karimov" className="size-[32px]" />
            <form className="flex flex-col gap-[10px]">
          <div className={field}>
            <Label htmlFor="profile-name">{t.name}</Label>
            <Input id="profile-name" name="name" defaultValue="Farrukh Karimov" autoComplete="name" />
          </div>
          <div className={field}>
            <Label htmlFor="profile-photo">{t.photo}</Label>
            <Input id="profile-photo" name="photo" type="url" />
          </div>
          <div className={field}>
            <Label htmlFor="profile-email">{t.email}</Label>
            <Input id="profile-email" name="email" type="email" defaultValue="farrukh@example.com" autoComplete="email" />
          </div>
              <Button type="button" size="sm" className="mt-[12px] self-start">{t.save}</Button>
            </form>
          </Card>
          <Card className="gap-[16px] pb-[18px]">
            <CardHeader className={cardHeader}><CardTitle>{t.preferences}</CardTitle></CardHeader>
            <div className={preference} role="group" aria-label={t.language}>
              <span>{t.language}</span>
              <Select defaultValue="en">
                <SelectTrigger className={select}><Globe className="size-[14px] text-muted-foreground" aria-hidden="true" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t.english}</SelectItem>
                  <SelectItem value="tg">{t.tajik}</SelectItem>
                  <SelectItem value="ru">{t.russian}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={preference} role="group" aria-label={t.theme}>
              <span>{t.theme}</span>
              <Select defaultValue="system">
                <SelectTrigger className={select}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t.system}</SelectItem>
                  <SelectItem value="light">{t.light}</SelectItem>
                  <SelectItem value="dark">{t.dark}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-[8px] self-start">{t.changePassword}</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
