"use client";

import { useEffect } from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferencesStore } from "@/app/(tracker)/workspaces/store/preferences-store";

// Select-и забон дар кунҷи рости боло, дар ҳамаи саҳифаҳо.
export default function TopBar() {
  const { language, setLanguage, theme } = usePreferencesStore();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && systemTheme.matches));
    }

    applyTheme();
    if (theme !== "system") return;

    systemTheme.addEventListener("change", applyTheme);
    return () => systemTheme.removeEventListener("change", applyTheme);
  }, [theme]);

  return (
    <div className="fixed top-[8px] right-[56px] z-40">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="h-[32px] w-[152px]">
          <Globe className="size-[16px] text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tg">Тоҷикӣ</SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
