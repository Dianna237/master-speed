"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NetworkService from "../services/NetworkService";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import type { SpeedTestResult } from "../types";
import { saveTestResult } from "@/services/DatabaseService";

export default function TestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<SpeedTestResult | null>(null);

  const runTest = async () => {
    try {
      setIsRunning(true);
      setResults(null);

      // Step 1: Ping test
      setCurrentStep("Measuring latency...");
      setProgress(0.1);
      const { latency, jitter } = await NetworkService.measureLatency();
      setProgress(0.3);

      // Step 2: Download test
      setCurrentStep("Testing download speed...");
      setProgress(0.4);
      const download = await NetworkService.measureDownloadSpeed();
      setProgress(0.6);

      // Step 3: Upload test
      setCurrentStep("Testing upload speed...");
      setProgress(0.7);
      const upload = await NetworkService.measureUploadSpeed();
      setProgress(0.9);

      // Step 4: Packet loss test
      setCurrentStep("Measuring packet loss...");
      const packetLoss = await NetworkService.estimatePacketLoss();
      setProgress(1.0);

      // Compile results
      const testResults: SpeedTestResult = {
        latency,
        jitter,
        download,
        upload,
        packetLoss,
      };

      setResults(testResults);

      // Get IP and location info
      const ipInfo = await NetworkService.getIPInfo();
      const locationData = await NetworkService.getGPSLocation();

      // Save to database
      await saveTestResult({
        timestamp: Date.now(),
        latency,
        jitter,
        download,
        upload,
        packetLoss,
        ipAddress: ipInfo.ip,
        location: locationData
          ? `${locationData.latitude},${locationData.longitude}`
          : ipInfo.loc || "Unknown",
        provider: ipInfo.org || "Unknown",
        notes: "",
      });

      setCurrentStep("Test completed");
    } catch (error) {
      console.error("Error running test:", error);
      Alert.alert(
        "Test Error",
        "An error occurred while running the network test."
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        {!isRunning && !results ? (
          <View style={styles.startContainer}>
            <Text style={styles.startText}>
              Run a network test to measure your connection quality
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={runTest}
              disabled={isRunning}
            >
              <Ionicons name="speedometer" size={40} />
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        ) : isRunning ? (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentStep}</Text>
            <ProgressBar progress={progress} />
            <ActivityIndicator
              style={styles.spinner}
              size="large"
              color="#007AFF"
            />
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Latency:</Text>
              <Text style={styles.resultValue}>
                {results?.latency.toFixed(1)} ms
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Jitter:</Text>
              <Text style={styles.resultValue}>
                {results?.jitter.toFixed(1)} ms
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Download:</Text>
              <Text style={styles.resultValue}>
                {results?.download.toFixed(1)} Mbps
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Upload:</Text>
              <Text style={styles.resultValue}>
                {results?.upload.toFixed(1)} Mbps
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Packet Loss:</Text>
              <Text style={styles.resultValue}>
                {results?.packetLoss.toFixed(1)}%
              </Text>
            </View>

            <TouchableOpacity style={styles.newTestButton} onPress={runTest}>
              <Text style={styles.newTestButtonText}>Run New Test</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
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
    // flex: 1,
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
    // color: "#ffffff",
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
  resultsContainer: {
    padding: 20,
    width: "100%",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  resultLabel: {
    fontWeight: "500",
  },
  resultValue: {
    fontWeight: "600",
  },
  newTestButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  newTestButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
