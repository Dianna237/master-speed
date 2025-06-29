import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { useNotificationStore } from "./store/notificationStore";

// Screens
import HistoryScreen from "./screens/HistoryScreen";
import TestScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { initialize, setNotification } = useNotificationStore();
  const { isDark, colors } = useTheme();

  // Create a navigation theme based on app theme
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

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
        // Handle notification tap
        const data = response.notification.request.content.data;
        if (data?.type === "test_completed") {
          return
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [initialize, setNotification]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Dashboard") {
              iconName = focused ? "speedometer" : "speedometer-outline";
            } else if (route.name === "Test") {
              iconName = focused ? "pulse" : "pulse-outline";
            } else if (route.name === "History") {
              iconName = focused ? "time" : "time-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            } else if (route.name === "OpenSpeedTest") {
              iconName = focused ? "speedometer" : "speedometer-outline";
            }

            // Ensure iconName is always a valid Ionicons glyph name
            return (
              <Ionicons
                name={iconName as React.ComponentProps<typeof Ionicons>["name"]}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Test" component={TestScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
