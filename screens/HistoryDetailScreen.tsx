import { RouteProp, useRoute } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Dimensions,
  useColorScheme,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getColors } from "@/theme/colors";

type RootStackParamList = {
  HistoryDetail: {
    id: string;
    latency?: string;
    download?: string;
    upload?: string;
    jitter?: string;
    ipAddress?: string;
    provider?: string;
    location?: string;
    packetLoss?: string;
    downloadHistory?: string;
    uploadHistory?: string;
  };
};

type HistoryDetailRouteProp = RouteProp<RootStackParamList, "HistoryDetail">;

// Mock data structure until we add a charting library
const DetailRow = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color={color} style={styles.icon} />
    <Text style={[styles.label, { color }]}>{label}</Text>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

export default function HistoryDetailScreen() {
  const route = useRoute<HistoryDetailRouteProp>();
  const params = route.params || {};
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark" ? "dark" : "light");

  const textColor = colors.text;
  const cardBackgroundColor = colors.card;
  const iconColor = colors.lighterGrey;

  const {
    id,
    latency = "0",
    download = "0",
    upload = "0",
    jitter = "0",
    ipAddress = "N/A",
    provider = "N/A",
    location = "Unknown",
    packetLoss = "0",
    downloadHistory = "[]",
    uploadHistory = "[]",
  } = params;

  const downloadData = JSON.parse(downloadHistory);
  const uploadData = JSON.parse(uploadHistory);

  console.log(uploadData, upload);

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) =>
      colorScheme === "dark"
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderChart = (title: string, data: number[], color: string) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.graphPlaceholder}>
          <Ionicons name="stats-chart-outline" size={48} color={iconColor} />
          <Text style={[styles.placeholderText, { color: iconColor }]}>
            No historical data for {title}.
          </Text>
        </View>
      );
    }
    return (
      <View>
        <ThemedText
          type="subtitle"
          style={[styles.cardTitle, { color: textColor }]}
        >
          {title}
        </ThemedText>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data, color: () => color }],
          }}
          width={Dimensions.get("window").width - 64}
          height={250}
          chartConfig={chartConfig}
          withDots={true}
        />
      </View>
    );
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <ThemedText
          type="title"
          style={[styles.title, { color: textColor }]}
        ></ThemedText>

        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: textColor }]}
          >
            Performance Metrics
          </ThemedText>
          <DetailRow
            icon="pulse-outline"
            label="Latency"
            value={`${parseFloat(latency).toFixed(1)} ms`}
            color={textColor}
          />
          <DetailRow
            icon="arrow-down-circle-outline"
            label="Download Speed"
            value={`${parseFloat(download).toFixed(2)} Mbps`}
            color={textColor}
          />
          <DetailRow
            icon="arrow-up-circle-outline"
            label="Upload Speed"
            value={`${parseFloat(upload).toFixed(2)} Mbps`}
            color={textColor}
          />
          <DetailRow
            icon="timer-outline"
            label="Jitter"
            value={`${parseFloat(jitter).toFixed(1)} ms`}
            color={textColor}
          />
          <DetailRow
            icon="analytics-outline"
            label="Packet Loss"
            value={`${parseFloat(packetLoss).toFixed(1)}%`}
            color={textColor}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: textColor }]}
          >
            Connection Details
          </ThemedText>
          <DetailRow
            icon="earth-outline"
            label="IP Address"
            value={ipAddress}
            color={textColor}
          />
          <DetailRow
            icon="business-outline"
            label="Service Provider"
            value={provider}
            color={textColor}
          />
          <DetailRow
            icon="location-outline"
            label="Location"
            value={location}
            color={textColor}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          {renderChart("Download History (Mbps)", downloadData, colors.primary)}
        </View>
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          {renderChart("Upload History (Mbps)", uploadData, colors.green)}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    paddingHorizontal: 16,
    // paddingTop: 16,
    paddingBottom: 4,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  graphPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  placeholderText: {
    marginTop: 8,
  },
});
