import DefaultHeader from "@/components/DefaultHeader";
import {
  deleteTestResult as deleteTestResultFromDB,
  exportAsCSV,
  getTestResults,
  TestResult,
} from "@/services/DatabaseService";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Card } from "../components/Card";
import { Link } from "expo-router";
import { getColors } from "@/theme/colors";
import spacing from "@/theme/spacing";

export default function HistoryScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      const results = await getTestResults();
      setTestResults(results);
    } catch (error) {
      console.error("Error loading test results:", error);
      Alert.alert("Error", "Failed to load test history");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestResult = async (id: number) => {
    try {
      await deleteTestResultFromDB(id);
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
          onPress: () => handleDeleteTestResult(id),
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

      const csvContent = await exportAsCSV();
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DefaultHeader />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Test History
          </Text>
          <TouchableOpacity style={styles.exportButton} onPress={exportResults}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <Text style={[styles.exportText, { color: colors.primary }]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
        {testResults.length === 0 ? (
          <Card style={{ backgroundColor: colors.card }}>
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.lighterGrey}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No test results yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.lighterGrey }]}
              >
                Run a network test to see your history
              </Text>
            </View>
          </Card>
        ) : (
          <FlatList
            data={testResults}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: `/history/${item.id}`,
                  params: { ...item },
                }}
                asChild
              >
                <TouchableOpacity>
                  <Card
                    style={{ backgroundColor: colors.card, marginBottom: 12 }}
                  >
                    <View style={styles.resultHeader}>
                      <Text style={[styles.resultDate, { color: colors.text }]}>
                        {new Date(item.timestamp).toLocaleDateString()}{" "}
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </Text>
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          onPress={() => confirmDelete(item.id)}
                          style={styles.trashIcon}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.danger}
                          />
                        </TouchableOpacity>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.lighterGrey}
                        />
                      </View>
                    </View>
                    <View style={styles.metricsContainer}>
                      <View style={styles.metricItem}>
                        <Text
                          style={[
                            styles.metricLabel,
                            { color: colors.lighterGrey },
                          ]}
                        >
                          Latency
                        </Text>
                        <Text
                          style={[styles.metricValue, { color: colors.text }]}
                        >
                          {(item.latency ?? 0).toFixed(1)} ms
                        </Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text
                          style={[
                            styles.metricLabel,
                            { color: colors.lighterGrey },
                          ]}
                        >
                          Download
                        </Text>
                        <Text
                          style={[styles.metricValue, { color: colors.text }]}
                        >
                          {(item.download ?? 0).toFixed(1)} Mbps
                        </Text>
                      </View>
                      <View style={styles.metricItem}>
                        <Text
                          style={[
                            styles.metricLabel,
                            { color: colors.lighterGrey },
                          ]}
                        >
                          Upload
                        </Text>
                        <Text
                          style={[styles.metricValue, { color: colors.text }]}
                        >
                          {(item.upload ?? 0).toFixed(1)} Mbps
                        </Text>
                      </View>
                    </View>
                    <View style={styles.locationContainer}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={colors.lighterGrey}
                      />
                      <Text
                        style={[
                          styles.locationText,
                          { color: colors.lighterGrey },
                        ]}
                        numberOfLines={1}
                      >
                        {item.location || "Unknown location"}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Link>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            onRefresh={loadTestResults}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 0,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  trashIcon: {
    marginRight: 8,
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
