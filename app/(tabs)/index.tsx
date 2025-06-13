import { saveTestResult } from "@/utils/history";
import { runSpeedTest } from "@/utils/speedTest";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type SpeedTestResult = {
  ping: number;
  jitter: number;
  loss: number;
  downloadSpeed: string;
  uploadSpeed: string;
};

export default function TestScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    const res = await runSpeedTest();
    setResult(res);
    await saveTestResult({
      date: new Date().toISOString(),
      ping: res.ping,
      jitter: res.jitter,
      loss: res.loss,
      downloadSpeed: parseFloat(res.downloadSpeed),
      uploadSpeed: parseFloat(res.uploadSpeed)
    });
    setLoading(false);
  };
  const handleDownload = () => {
    // Placeholder for download/export logic
    alert("Download clicked!");
  };
  const handleUpload = () => {
    // Placeholder for upload/import logic
    alert("Upload clicked!");
  };
  const handleLanguage = () => {
    // Placeholder for language selection
    alert("Language selection!");
  };

  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        {/* <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        /> */}
        <Text style={styles.appName}>MASTER TEST</Text>
      </View>
      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0084FF" />
        ) : (
          <Text style={styles.startText}>START</Text>
        )}
      </TouchableOpacity>
      {/* Show result */}
      {result && (
        <View style={styles.resultBox}>
          <Text>Download: {result.downloadSpeed} Mbps</Text>
          <Text>Upload: {result.uploadSpeed} Mbps</Text>
          <Text>Ping: {result.ping} ms</Text>
          <Text>Jitter: {result.jitter} ms</Text>
          <Text>Loss: {result.loss} %</Text>
        </View>
      )}
      {/* Download/Upload Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Text style={styles.actionIcon}>⬇️</Text>
          <Text style={styles.actionLabel}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleUpload}>
          <Text style={styles.actionIcon}>⬆️</Text>
          <Text style={styles.actionLabel}>Upload</Text>
        </TouchableOpacity>
      </View>
      {/* Globe Icon */}
      <TouchableOpacity style={styles.globeButton} onPress={handleLanguage}>
        <Text style={styles.globeIcon}>🌐</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 48,
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    letterSpacing: 4,
    color: "#0084FF",
    fontWeight: "bold",
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
  startText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
  },
  resultBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 48,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: { 
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  globeButton: {
    position: "absolute",
    left: 24,
    bottom: 24,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 30,
  },
  globeIcon: {
    fontSize: 28,
  },
});
