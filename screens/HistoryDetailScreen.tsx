import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/services/TranslationService";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

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
  const navigation = useNavigation();
  const params = route.params || {};
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    navigation.setOptions({ title: t("test_detail") });
  }, [navigation, t]);

  const textColor = colors.text;
  const cardBackgroundColor = colors.card;
  const iconColor = colors.lighterGrey;

  const {
    latency = "0",
    download = "0",
    upload = "0",
    jitter = "0",
    ipAddress = "N/A",
    provider = "N/A",
    location = t("unknown"),
    packetLoss = "0",
    downloadHistory = "[]",
    uploadHistory = "[]",
  } = params;

  const downloadData = JSON.parse(downloadHistory);
  const uploadData = JSON.parse(uploadHistory);

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) =>
      isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
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
            {t("no_historical_data", { title })}
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
            {t("performance_metrics")}
          </ThemedText>
          <DetailRow
            icon="pulse-outline"
            label={t("latency")}
            value={`${parseFloat(latency).toFixed(1)} ms`}
            color={textColor}
          />
          <DetailRow
            icon="arrow-down-circle-outline"
            label={t("download_speed")}
            value={`${parseFloat(download).toFixed(2)} Mbps`}
            color={textColor}
          />
          <DetailRow
            icon="arrow-up-circle-outline"
            label={t("upload_speed")}
            value={`${parseFloat(upload).toFixed(2)} Mbps`}
            color={textColor}
          />
          <DetailRow
            icon="timer-outline"
            label={t("jitter")}
            value={`${parseFloat(jitter).toFixed(1)} ms`}
            color={textColor}
          />
          <DetailRow
            icon="analytics-outline"
            label={t("packet_loss")}
            value={`${parseFloat(packetLoss).toFixed(1)}%`}
            color={textColor}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: textColor }]}
          >
            {t("connection_details")}
          </ThemedText>
          <DetailRow
            icon="earth-outline"
            label={t("ip_address")}
            value={ipAddress}
            color={textColor}
          />
          <DetailRow
            icon="business-outline"
            label={t("service_provider")}
            value={provider}
            color={textColor}
          />
          <DetailRow
            icon="location-outline"
            label={t("location")}
            value={location}
            color={textColor}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          {renderChart(t("download_history"), downloadData, colors.primary)}
        </View>
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          {renderChart(t("upload_history"), uploadData, colors.green)}
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
