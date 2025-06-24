import DefaultHeader from "@/components/DefaultHeader";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Card } from "../components/Card";
import { useThemeStore } from "../store/themeStore";
import { getColors } from "@/theme/colors";
import spacing from "@/theme/spacing";

const SettingsScreen = () => {
  const { isDark, setTheme } = useThemeStore();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark" ? "dark" : "light");

  const handleThemeChange = (value: boolean) => {
    setTheme(value ? "dark" : "light");
  };

  const clearAllData = async () => {
    try {
      // Close the database
      // SQLite.openDatabaseSync("networktest.db").closeAsync(); // This line might cause issues if not handled carefully with open connections

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
    <>
      <DefaultHeader />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Card>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={handleThemeChange}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDark ? "#007AFF" : "#f4f3f4"}
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
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 0,
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
