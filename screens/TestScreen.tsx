"use client";

import { Card } from "@/components/Card";
import DefaultBody from "@/components/DefaultBody";
import DefaultHeader from "@/components/DefaultHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { saveTestResult } from "@/services/DatabaseService";
import SpeedTest from "@cloudflare/speedtest";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getGPSLocation,
  getIPInfo,
  startSpeedTest,
  stopSpeedTest,
} from "../services/NetworkService";
import type { SpeedTestResult } from "../types";

export default function TestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<SpeedTestResult | null>(null);

  function setResult(obj) {
    const resTxt = JSON.stringify(obj, null, 2);

    console.log("***********************", resTxt);

    // resEl.textContent = "";
    // resEl.appendChild(resTxt);
  }

  const engine = new SpeedTest({
    autoStart: false,
  });

  engine.onResultsChange = ({ type }) => {
    !engine.isFinished && setResult(engine.results.raw);
    console.log(type);
  };
  engine.onFinish = (results) => {
    setResult(results.getSummary());
    console.log(results.getSummary());
    console.log(results.getScores());
  };

  engine.onError = (e) => console.log(e);

  const runTest = async () => {
    try {
      setIsRunning(true);
      setResults(null);
      setProgress(0.0);
      setCurrentStep("Starting Cloudflare speed test...");

      await startSpeedTest((latestResult) => {
        setResults(latestResult);

        // Update progress based on test stage
        if (latestResult.download > 0 && latestResult.upload === 0) {
          setProgress(0.5);
          setCurrentStep("Measuring download speed...");
        } else if (latestResult.upload > 0) {
          setProgress(0.9);
          setCurrentStep("Measuring upload speed...");
        } else {
          setProgress(0.2);
          setCurrentStep("Measuring latency and jitter...");
        }
      });

      setProgress(1.0);
      setCurrentStep("Test completed");

      // Get IP and location info after test completes
      const ipInfo = await getIPInfo();
      const locationData = await getGPSLocation();

      // Save to database only if results are available
      if (results) {
        await saveTestResult({
          timestamp: Date.now(),
          latency: results.latency,
          jitter: results.jitter || 0,
          download: results.download,
          upload: results.upload,
          packetLoss: results.packetLoss,
          ipAddress: ipInfo.ip,
          location: locationData
            ? `${locationData.latitude},${locationData.longitude}`
            : ipInfo.loc || "Unknown",
          provider: ipInfo.org || "Unknown",
          notes: "Cloudflare Speed Test",
        });
        console.log("=======================", results);
      }
    } catch (error) {
      console.error("Error running test:", error);
      Alert.alert(
        "Test Error",
        `An error occurred: ${(error as Error).message}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const stopTest = () => {
    stopSpeedTest();
    setIsRunning(false);
    setCurrentStep("Test stopped");
    setProgress(0.0);
  };

  return (
    <>
      <DefaultHeader />
      <DefaultBody>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => engine.play()}>
            <Text style={{ backgroundColor: "red" }}>press me</Text>
          </TouchableOpacity>
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
                <TouchableOpacity style={styles.stopButton} onPress={stopTest}>
                  <Text style={styles.stopButtonText}>Stop Test</Text>
                </TouchableOpacity>
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
                    {results?.jitter?.toFixed(1) ?? "N/A"} ms
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
                    {results?.packetLoss?.toFixed(1) ?? "N/A"}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.newTestButton}
                  onPress={runTest}
                >
                  <Text style={styles.newTestButtonText}>Run New Test</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
      </DefaultBody>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 5,
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
