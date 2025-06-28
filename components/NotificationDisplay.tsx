import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNotificationStore } from "../store/notificationStore";
import { useTheme } from "./ThemeProvider";

export const NotificationDisplay: React.FC = () => {
  const { notification } = useNotificationStore();
  const { colors } = useTheme();

  if (!notification) {
    return null;
  }

  const { title, body, data } = notification.request.content;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Latest Notification
      </Text>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.notificationBody, { color: colors.lighterGrey }]}>
          {body}
        </Text>
        {data && (
          <Text
            style={[styles.notificationData, { color: colors.lighterGrey }]}
          >
            Data: {JSON.stringify(data)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  notificationContent: {
    gap: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  notificationBody: {
    fontSize: 12,
  },
  notificationData: {
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 4,
  },
});
