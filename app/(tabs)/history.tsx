import { getTestHistory } from "@/utils/history";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

type TestResult = {
  date: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    getTestHistory().then(setHistory);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={history}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Date: {new Date(item.date).toLocaleString()}</Text>
            <Text>Download: {item.downloadSpeed} Mbps</Text>
            <Text>Upload: {item.uploadSpeed} Mbps</Text>
            <Text>Ping: {item.ping} ms</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.subtitle}>No test results yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 24,
  },
  item: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    width: 300,
  },
});
