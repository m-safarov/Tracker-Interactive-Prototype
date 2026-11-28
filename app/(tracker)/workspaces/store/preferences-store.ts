import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "tg" | "ru";
type Theme = "light" | "dark" | "system";

type Preferences = {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
};

export const usePreferencesStore = create<Preferences>()(
  persist(
    (set) => ({
      language: "en",
      theme: "light",
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "tracker-preferences" },
  ),
);
