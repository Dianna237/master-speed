import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface MetricCardProps {
  title: string
  value: string
  unit: string
  icon: string
}

export function MetricCard({ title, value, unit, icon }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 2,
  },
})
