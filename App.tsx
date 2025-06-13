import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { ThemeProvider } from "./context/ThemeContext"

// Screens
import DashboardScreen from "./screens/DashboardScreen"
import TestScreen from "./screens/TestScreen"
import HistoryScreen from "./screens/HistoryScreen"
import SettingsScreen from "./screens/SettingsScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName

                if (route.name === "Dashboard") {
                  iconName = focused ? "speedometer" : "speedometer-outline"
                } else if (route.name === "Test") {
                  iconName = focused ? "pulse" : "pulse-outline"
                } else if (route.name === "History") {
                  iconName = focused ? "time" : "time-outline"
                } else if (route.name === "Settings") {
                  iconName = focused ? "settings" : "settings-outline"
                }

                return <Ionicons name={iconName} size={size} color={color} />
              },
              tabBarActiveTintColor: "#007AFF",
              tabBarInactiveTintColor: "gray",
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Test" component={TestScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
