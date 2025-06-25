import { Card } from "@/components/Card";
import DefaultHeader from "@/components/DefaultHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { saveTestResult } from "@/services/DatabaseService";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { getIPInfo } from "../services/NetworkService";
import {
  startCustomSpeedTest,
  stopCustomSpeedTest,
} from "../services/NewNetworkService";
import type { SpeedTestResult } from "../types";
import { getColors } from "@/theme/colors";

export default function HomeScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark" ? "dark" : "light");

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);
    setProgress(0);
    setCurrentStep("Starting test...");

    startCustomSpeedTest(
      (progress) => {
        switch (progress.stage) {
          case "latency":
            setCurrentStep("Measuring latency and jitter...");
            setProgress(0.2);
            break;
          case "download":
            setCurrentStep("Measuring download speed...");
            setProgress(0.5);
            break;
          case "upload":
            setCurrentStep("Measuring upload speed...");
            setProgress(0.8);
            break;
        }
      },
      async (finalResult) => {
        setResults(finalResult);
        setCurrentStep("Test completed");
        setProgress(1);
        setIsRunning(false);
      }
    );
  };

  const stopTest = () => {
    stopCustomSpeedTest();
    setIsRunning(false);
    setCurrentStep("Test stopped");
    setProgress(0);
  };

  const getQualityColor = () => {
    const latency = results?.latency || 0;
    const packetLoss = results?.packetLoss || 0;

    if (latency < 50 && packetLoss < 1) return "#4CAF50"; // Excellent
    if (latency < 100 && packetLoss < 5) return "#8BC34A"; // Good
    if (latency < 200 && packetLoss < 10) return "#FFC107"; // Fair
    return "#F44336"; // Poor
  };

  const getQualityText = () => {
    const latency = results?.latency || 0;
    const packetLoss = results?.packetLoss || 0;

    if (latency < 50 && packetLoss < 1) return "Excellent";
    if (latency < 100 && packetLoss < 5) return "Good";
    if (latency < 200 && packetLoss < 10) return "Fair";
    return "Poor";
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DefaultHeader />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isRunning && !results ? (
          <Card style={{ backgroundColor: colors.card }}>
            <View style={styles.startContainerCentered}>
              <Text style={[styles.startText, { color: colors.text }]}>
                Run a network test to measure your connection quality
              </Text>
              <TouchableOpacity
                style={[styles.startButton, { borderColor: colors.primary }]}
                onPress={runTest}
                disabled={isRunning}
              >
                <Ionicons name="speedometer" size={40} color={colors.primary} />
                <Text style={[styles.startButtonText, { color: colors.text }]}>
                  Start Test
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : isRunning ? (
          <Card style={{ backgroundColor: colors.card }}>
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {currentStep}
              </Text>
              <ProgressBar progress={progress} color={colors.primary} />
              <ActivityIndicator
                style={styles.spinner}
                size="large"
                color={colors.primary}
              />
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: colors.danger }]}
                onPress={stopTest}
              >
                <Text style={styles.stopButtonText}>Stop Test</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <View style={{ flex: 1, width: "100%" }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Card style={{ backgroundColor: colors.card }}>
                <View style={styles.resultsContainer}>
                  <Text style={[styles.resultsTitle, { color: colors.text }]}>
                    Network Performance Results
                  </Text>

                  {/* Main Metrics Grid */}
                  <View style={styles.metricsGrid}>
                    {/* Download Speed */}
                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: colors.background,
                          shadowColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.metricIcon,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <Ionicons
                          name="download"
                          size={24}
                          color={colors.green}
                        />
                      </View>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {results?.download.toFixed(1)}
                      </Text>
                      <Text
                        style={[
                          styles.metricUnit,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Mbps
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Download Speed
                      </Text>
                    </View>

                    {/* Upload Speed */}
                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: colors.background,
                          shadowColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.metricIcon,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <Ionicons
                          name="cloud-upload"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {results?.upload.toFixed(1)}
                      </Text>
                      <Text
                        style={[
                          styles.metricUnit,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Mbps
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Upload Speed
                      </Text>
                    </View>

                    {/* Latency */}
                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: colors.background,
                          shadowColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.metricIcon,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <Ionicons name="time" size={24} color={colors.option} />
                      </View>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {results?.jitter?.toFixed(1)}
                      </Text>
                      <Text
                        style={[
                          styles.metricUnit,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        ms
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Latency
                      </Text>
                    </View>

                    {/* Jitter */}
                    <View
                      style={[
                        styles.metricCard,
                        {
                          backgroundColor: colors.background,
                          shadowColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.metricIcon,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <Ionicons
                          name="pulse"
                          size={24}
                          color={colors.accent}
                        />
                      </View>
                      <Text
                        style={[styles.metricValue, { color: colors.text }]}
                      >
                        {results?.latency?.toFixed(1) ?? "N/A"}
                      </Text>
                      <Text
                        style={[
                          styles.metricUnit,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        ms
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Jitter
                      </Text>
                    </View>
                  </View>

                  {/* Packet Loss Indicator */}
                  <View
                    style={[
                      styles.packetLossContainer,
                      { backgroundColor: colors.optionBg },
                    ]}
                  >
                    <View style={styles.packetLossHeader}>
                      <Ionicons
                        name="warning"
                        size={20}
                        color={colors.danger}
                      />
                      <Text
                        style={[
                          styles.packetLossLabel,
                          { color: colors.danger },
                        ]}
                      >
                        Packet Loss
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.packetLossBar,
                        { backgroundColor: colors.lightAsh },
                      ]}
                    >
                      <View
                        style={[
                          styles.packetLossFill,
                          {
                            backgroundColor: colors.danger,
                            width: `${Math.min(
                              results?.packetLoss || 0,
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.packetLossValue, { color: colors.danger }]}
                    >
                      {results?.packetLoss?.toFixed(2) ?? "0.00"}%
                    </Text>
                  </View>

                  {/* Connection Quality Assessment */}
                  <View
                    style={[
                      styles.qualityContainer,
                      { backgroundColor: colors.lightGreen },
                    ]}
                  >
                    <Text
                      style={[styles.qualityTitle, { color: colors.green }]}
                    >
                      Connection Quality
                    </Text>
                    <View style={styles.qualityIndicator}>
                      <View
                        style={[
                          styles.qualityDot,
                          { backgroundColor: getQualityColor() },
                        ]}
                      />
                      <Text
                        style={[styles.qualityText, { color: colors.green }]}
                      >
                        {getQualityText()}
                      </Text>
                    </View>
                  </View>

                  {/* Bandwidth Summary */}
                  <View
                    style={[
                      styles.bandwidthContainer,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Text
                      style={[styles.bandwidthTitle, { color: colors.text }]}
                    >
                      Bandwidth Summary
                    </Text>
                    <View style={styles.bandwidthRow}>
                      <Text
                        style={[
                          styles.bandwidthLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Total Bandwidth:
                      </Text>
                      <Text
                        style={[styles.bandwidthValue, { color: colors.text }]}
                      >
                        {(
                          (results?.download || 0) + (results?.upload || 0)
                        ).toFixed(1)}{" "}
                        Mbps
                      </Text>
                    </View>
                    <View style={styles.bandwidthRow}>
                      <Text
                        style={[
                          styles.bandwidthLabel,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        Download/Upload Ratio:
                      </Text>
                      <Text
                        style={[styles.bandwidthValue, { color: colors.text }]}
                      >
                        {results?.upload
                          ? (results.download / results.upload).toFixed(2)
                          : "N/A"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.newTestButton,
                      {
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                      },
                    ]}
                    onPress={runTest}
                  >
                    <Ionicons name="refresh" size={20} color={"white"} />
                    <Text
                      style={[styles.newTestButtonText, { color: "white" }]}
                    >
                      Run New Test
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // padding: 12,
    // flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 48,
    marginBottom: 48,
  },
  startContainer: {
    alignItems: "center",
    padding: 20,
    width: "100%",
    justifyContent: "center",
    flex: 1,
  },
  startText: {
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.7,
  },
  startButton: {
    borderWidth: 4,
    borderColor: "#0084FF",
    borderRadius: 100,
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  startButtonText: {
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  progressContainer: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  progressText: {
    marginBottom: 16,
    fontSize: 16,
  },
  spinner: {
    marginTop: 20,
  },
  stopButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  resultsContainer: {
    paddingHorizontal: 2,
    width: "100%",
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#1a1a1a",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888",
    textAlign: "center",
  },
  packetLossContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  packetLossHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  packetLossLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginLeft: 8,
  },
  packetLossBar: {
    height: 8,
    backgroundColor: "#FFE0B2",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  packetLossFill: {
    height: "100%",
    backgroundColor: "#F44336",
    borderRadius: 4,
  },
  packetLossValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
    textAlign: "center",
  },
  qualityContainer: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  qualityIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  qualityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  bandwidthContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bandwidthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  bandwidthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  bandwidthLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  bandwidthValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  newTestButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  newTestButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  startContainerCentered: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: 1,
    paddingVertical: 40,
  },
});
