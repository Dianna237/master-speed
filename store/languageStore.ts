import { create } from "zustand";

type Language = "en" | "fr";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const languageNames: Record<Language, string> = {
  en: "English",
  fr: "Français",
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en", // Default language
  setLanguage: (language) => set({ language }),
}));

export { languageNames };
