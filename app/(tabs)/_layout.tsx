import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import Octicons from "@expo/vector-icons/Octicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Test",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SimpleLineIcons name="speedometer" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Octicons name="history" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Setting",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Octicons name="gear" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
