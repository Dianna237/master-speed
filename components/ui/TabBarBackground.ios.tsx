import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useTheme } from "@/components/ThemeProvider";

export default function BlurTabBarBackground() {
  const { colors, isDark } = useTheme();

  return (
    <BlurView
      // Use light or dark tint based on app theme instead of system chrome material
      tint={isDark ? "dark" : "light"}
      intensity={100}
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
