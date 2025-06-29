import { SplashScreen } from "@/components/SplashScreen";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNotificationStore } from "@/store/notificationStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { initialize, setNotification } = useNotificationStore();

  useEffect(() => {
    if (loaded) {
      // Hide splash screen after 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize notification store
    initialize();

    // Set up notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response in app:", response);
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data?.type === "test_completed") {
          // Navigate to results or show results
          console.log("Test completed notification tapped in app");
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [initialize, setNotification]);

  if (!loaded || showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <ThemedStack />
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
