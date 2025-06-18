"use client";

import DefaultBody from "@/components/DefaultBody";
import DefaultHeader from "@/components/DefaultHeader";
import { getTestResults } from "@/services/DatabaseService";
import { getIPInfo } from "@/services/NetworkService";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "../components/Card";
import { MetricCard } from "../components/MetricCard";
import type { TestResult } from "../types";

export default function DashboardScreen() {
  const [latestTest, setLatestTest] = useState<TestResult | null>(null);
  const [ipInfo, setIpInfo] = useState({
    ip: "Loading...",
    provider: "Unknown",
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get latest test result
      const results = await getTestResults();
      if (results.length > 0) {
        setLatestTest(results[0]);
      }

      // Get IP info
      const ipData = await getIPInfo();
      setIpInfo({
        ip: ipData.ip,
        provider: ipData.org || "Unknown",
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <>
      <DefaultHeader />
      <DefaultBody>
        <ScrollView
          style={[styles.container]}
          // , { backgroundColor: isDark ? "#121212" : "#f5f5f5" }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card>
            <Text style={styles.sectionTitle}>Connection Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IP Address:</Text>
              <Text style={styles.infoValue}>{ipInfo.ip}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Provider:</Text>
              <Text style={styles.infoValue}>{ipInfo.provider}</Text>
            </View>
          </Card>

          <Text
            style={[styles.sectionHeader]}
            // { color: isDark ? "#ffffff" : "#000000" }
          >
            Latest Test Results
          </Text>

          {latestTest ? (
            <View style={styles.metricsContainer}>
              <MetricCard
                title="Latency"
                value={`${latestTest.latency.toFixed(1)}`}
                unit="ms"
                icon="pulse"
              />
              <MetricCard
                title="Download"
                value={`${latestTest.download.toFixed(1)}`}
                unit="Mbps"
                icon="arrow-down"
              />
              <MetricCard
                title="Upload"
                value={`${latestTest.upload.toFixed(1)}`}
                unit="Mbps"
                icon="arrow-up"
              />
              <MetricCard
                title="Jitter"
                value={`${latestTest.jitter.toFixed(1)}`}
                unit="ms"
                icon="analytics"
              />
              <MetricCard
                title="Packet Loss"
                value={`${latestTest.packetLoss.toFixed(1)}`}
                unit="%"
                icon="warning"
              />
              <MetricCard
                title="Last Test"
                value={new Date(latestTest.timestamp).toLocaleTimeString()}
                unit=""
                icon="time"
              />
            </View>
          ) : (
            <Card>
              <Text style={styles.noDataText}>
                No test data available. Run a test to see results.
              </Text>
            </Card>
          )}
        </ScrollView>
      </DefaultBody>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "500",
  },
  infoValue: {
    opacity: 0.8,
  },
  noDataText: {
    textAlign: "center",
    opacity: 0.6,
    padding: 16,
  },
});
