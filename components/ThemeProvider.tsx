import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/themeStore";
import { getColors } from "../theme/colors";

interface ThemeContextType {
  isDark: boolean;
  themeMode: "light" | "dark" | "system";
  colors: ReturnType<typeof getColors>;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themeMode, isDark, setThemeMode, setSystemTheme } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Calculate the actual theme based on mode and system preference
  const getActualTheme = () => {
    if (themeMode === "system") {
      return systemColorScheme === "dark";
    }
    return themeMode === "dark";
  };

  // Get colors based on actual theme
  const actualIsDark = getActualTheme();
  const colors = getColors(actualIsDark ? "dark" : "light");

  // Sync with system theme when using system mode
  useEffect(() => {
    if (systemColorScheme && themeMode === "system") {
      setSystemTheme(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode, setSystemTheme]);

  const value: ThemeContextType = {
    isDark: actualIsDark,
    themeMode,
    colors,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
