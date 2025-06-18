import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  setTheme: (theme: "dark" | "light") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false, // Default theme
  setTheme: (theme) => set({ isDark: theme === "dark" }),
}));
