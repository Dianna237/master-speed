import { SplashScreen } from "@/components/SplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNotificationStore } from "@/store/notificationStore";
import * as Notifications from "expo-notifications";

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
        console.log("Notification received in app:", notification);
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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
