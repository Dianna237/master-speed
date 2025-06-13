import { saveTestResult } from "@/utils/history";
import { runSpeedTest } from "@/utils/speedTest";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SpeedTestResult = {
  ping: number;
  downloadSpeed: string;
  uploadSpeed: string;
};

export default function TestScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  const handleStart = async () => {
    setLoading(true);
    const res = await runSpeedTest();
    setResult(res);
    await saveTestResult({
      date: new Date().toISOString(),
      ping: res.ping,
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
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
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
    marginBottom: 32,
  },
  startText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
  },
  resultBox: {
    marginBottom: 24,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 16,
    color: "#222",
  },
  globeButton: {
    position: "absolute",
    left: 24,
    bottom: 24,
  },
  globeIcon: {
    fontSize: 28,
  },
});
