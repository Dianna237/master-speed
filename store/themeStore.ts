import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: "system", // Default to system theme
  isDark: false,
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    // If mode is system, we'll let the system theme be set separately
    if (mode !== "system") {
      set({ isDark: mode === "dark" });
    }
  },
  setSystemTheme: (isDark) => {
    const { themeMode } = get();
    // Only update isDark if we're using system theme
    if (themeMode === "system") {
      set({ isDark });
    }
  },
}));
