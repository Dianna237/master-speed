"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../components/Card";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

export default function SettingsScreen() {
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleThemeChange = (value: boolean) => {
    // setTheme(value ? "dark" : "light")
  };

  const clearAllData = async () => {
    try {
      // Close the database
      SQLite.openDatabaseSync("networktest.db").closeAsync();

      // Delete the database file
      await FileSystem.deleteAsync(
        `${FileSystem.documentDirectory}SQLite/networktest.db`,
        { idempotent: true }
      );

      Alert.alert(
        "Data Cleared",
        "All test data has been cleared. Please restart the app for changes to take effect."
      );
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert("Error", "Failed to clear data");
    }
  };

  const confirmClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all test data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearAllData },
      ]
    );
  };

  return (
    <ScrollView
    // style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}
    >
      <Text
      // style={[styles.title, { color: isDark ? "#ffffff" : "#000000" }]}
      >
        Settings
      </Text>

      <Card>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            // value={isDark}
            onValueChange={handleThemeChange}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            // thumbColor={isDark ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Test Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Use Location</Text>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={locationEnabled ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={confirmClearData}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContainer}>
          <Text style={styles.appName}>Network Monitor</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A mobile app for measuring network quality metrics including
            latency, jitter, download/upload speeds, and packet loss.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    opacity: 0.7,
    marginBottom: 12,
  },
  appDescription: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
});
