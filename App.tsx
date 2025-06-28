import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./components/ThemeProvider";
import { useNotificationStore } from "./store/notificationStore";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

// Screens
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TestScreen from "./screens/HomeScreen";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { initialize, setNotification } = useNotificationStore();

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

  return (
    <NavigationContainer>
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
