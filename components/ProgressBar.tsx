import { View, StyleSheet } from "react-native"

interface ProgressBarProps {
  progress: number // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${clampedProgress * 100}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: "#E9E9EB",
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  progress: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
})
