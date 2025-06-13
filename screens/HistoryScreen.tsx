"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";
import { Card } from "../components/Card";
import type { TestResult } from "../types";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function HistoryScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      const results = await DatabaseService.getTestResults();
      setTestResults(results);
    } catch (error) {
      console.error("Error loading test results:", error);
      Alert.alert("Error", "Failed to load test history");
    } finally {
      setLoading(false);
    }
  };

  const deleteTestResult = async (id: number) => {
    try {
      await DatabaseService.deleteTestResult(id);
      setTestResults(testResults.filter((result) => result.id !== id));
    } catch (error) {
      console.error("Error deleting test result:", error);
      Alert.alert("Error", "Failed to delete test result");
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Test Result",
      "Are you sure you want to delete this test result?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTestResult(id),
        },
      ]
    );
  };

  const exportResults = async () => {
    try {
      if (testResults.length === 0) {
        Alert.alert("No Data", "There are no test results to export");
        return;
      }

      const csvContent = await DatabaseService.exportAsCSV();
      const fileUri = `${FileSystem.documentDirectory}network_test_results.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error exporting results:", error);
      Alert.alert("Export Error", "Failed to export test results");
    }
  };

  const renderTestResult = ({ item }: { item: TestResult }) => {
    const date = new Date(item.timestamp);

    return (
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultDate}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Latency</Text>
            <Text style={styles.metricValue}>{item.latency.toFixed(1)} ms</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Download</Text>
            <Text style={styles.metricValue}>
              {item.download.toFixed(1)} Mbps
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Upload</Text>
            <Text style={styles.metricValue}>
              {item.upload.toFixed(1)} Mbps
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#8E8E93" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location || "Unknown location"}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View
    // style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}
    >
      <View style={styles.header}>
        <Text
        //  style={[styles.title, { color: isDark ? "#ffffff" : "#000000" }]}
        >
          Test History
        </Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportResults}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {testResults.length === 0 ? (
        <Card>
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyText}>No test results yet</Text>
            <Text style={styles.emptySubtext}>
              Run a network test to see your history
            </Text>
          </View>
        </Card>
      ) : (
        <FlatList
          data={testResults}
          renderItem={renderTestResult}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={loadTestResults}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportText: {
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 16,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultDate: {
    fontWeight: "600",
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 8,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
  },
});
