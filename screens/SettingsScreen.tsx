import DefaultHeader from "@/components/DefaultHeader";
// import { NotificationDisplay } from "@/components/NotificationDisplay";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useState, useRef, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import { Card } from "../components/Card";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore, languageNames } from "../store/languageStore";
import { useNotificationStore } from "../store/notificationStore";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "../services/TranslationService";
import spacing from "@/theme/spacing";
import { Toast } from "@/components/Toast";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";

const themeOptions = [
  { key: "light", icon: "sunny", label: "light" },
  { key: "dark", icon: "moon", label: "dark" },
  { key: "system", icon: "settings", label: "system" },
];

const SettingsScreen = () => {
  const { themeMode, setThemeMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, message: "", type: "success" });
  const {
    permissionStatus,
    isLoading,
    requestPermissions,
    cancelAllNotifications,
  } = useNotificationStore();
  const pillAnim = useRef(
    new Animated.Value(themeOptions.findIndex((o) => o.key === themeMode))
  ).current;
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    Animated.timing(pillAnim, {
      toValue: themeOptions.findIndex((o) => o.key === themeMode),
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [themeMode]);

  // const handleThemeModeChange = (mode: "light" | "dark" | "system") => {
  //   setThemeMode(mode);
  // };

  const handleLanguageChange = (newLanguage: keyof typeof languageNames) => {
    if (newLanguage === language) return;
    setLanguage(newLanguage);
    setToast({
      visible: true,
      message: t("language_changed_message", {
        language: languageNames[newLanguage],
      }),
      type: "success",
    });
  };

  const handleNotificationPermission = async () => {
    if (permissionStatus?.granted) {
      Alert.alert(
        t("notifications_enabled"),
        t("notifications_enabled_message"),
        [{ text: t("ok") }]
      );
    } else {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert(
          t("notifications_enabled"),
          t("notifications_enabled_message"),
          [{ text: t("ok") }]
        );
      } else {
        Alert.alert(t("permission_denied"), t("permission_denied_message"), [
          { text: t("ok") },
        ]);
      }
    }
  };

  const handleClearNotifications = async () => {
    Alert.alert(t("clear_notifications"), t("clear_notifications_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("clear"),
        style: "destructive",
        onPress: async () => {
          await cancelAllNotifications();
          Alert.alert(t("cleared"), t("notifications_cleared"));
        },
      },
    ]);
  };

  const clearAllData = async () => {
    try {
      await FileSystem.deleteAsync(
        `${FileSystem.documentDirectory}SQLite/networktest.db`,
        { idempotent: true }
      );

      Alert.alert(t("data_cleared"), t("data_cleared_message"));
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert(t("error"), t("clear_data_error"));
    }
  };

  const confirmClearData = () => {
    Alert.alert(t("clear_all_data"), t("clear_all_data_confirm"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("clear"), style: "destructive", onPress: clearAllData },
    ]);
  };

  const getNotificationStatusText = () => {
    if (isLoading) return t("loading");
    if (permissionStatus?.granted) return t("enabled");
    if (permissionStatus?.granted === false) return t("disabled");
    return t("not_set");
  };

  const getNotificationStatusColor = () => {
    if (permissionStatus?.granted) return "#4CAF50";
    if (permissionStatus?.granted === false) return "#F44336";
    return "#FF9800";
  };

  const getThemeModeText = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
  };

  const currentThemeOption = themeOptions.find((o) => o.key === themeMode);

  return (
    <>
      <DefaultHeader />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t("settings")}
        </Text>

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("appearance")}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t("theme_mode")}
            </Text>
            <TouchableOpacity
              style={[styles.themeDropdown, { borderColor: colors.border }]}
              onPress={() => setShowThemeModal(true)}
            >
              <Ionicons
                name={currentThemeOption?.icon as any}
                size={16}
                color={colors.text}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.themeDropdownText, { color: colors.text }]}>
                {t(currentThemeOption?.label || "system")}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.lighterGrey}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </Card>

        <ThemeSelector
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          onThemeSelect={(theme) => setThemeMode(theme)}
          currentTheme={themeMode}
        />

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("language")}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t("app_language")}
            </Text>
            <TouchableOpacity
              style={[styles.languageSelector, { borderColor: colors.border }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={[styles.languageText, { color: colors.text }]}>
                {languageNames[language]}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.lighterGrey}
              />
            </TouchableOpacity>
          </View>
        </Card>

        <LanguageSelector
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          onLanguageSelect={(lang) => {
            if (lang !== language) {
              handleLanguageChange(lang);
            }
          }}
        />

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("notifications")}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t("test_notifications")}
            </Text>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  { color: getNotificationStatusColor() },
                ]}
              >
                {getNotificationStatusText()}
              </Text>
              <TouchableOpacity
                style={[
                  styles.permissionButton,
                  { backgroundColor: getNotificationStatusColor() },
                ]}
                onPress={handleNotificationPermission}
                disabled={isLoading}
              >
                <Ionicons name="notifications" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {permissionStatus?.granted && (
            <TouchableOpacity
              style={[
                styles.clearNotificationsButton,
                { borderTopColor: colors.border },
              ]}
              onPress={handleClearNotifications}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.lighterGrey}
              />
              <Text
                style={[
                  styles.clearNotificationsText,
                  { color: colors.lighterGrey },
                ]}
              >
                {t("clear_pending_notifications")}
              </Text>
            </TouchableOpacity>
          )}

          {/* {expoPushToken && (
            <View
              style={[
                styles.pushTokenContainer,
                { borderTopColor: colors.border },
              ]}
            >
              <Text
                style={[styles.pushTokenLabel, { color: colors.lighterGrey }]}
              >
                {t("push_token")}:
              </Text>
              <Text
                style={[
                  styles.pushTokenText,
                  { color: colors.text, backgroundColor: colors.background },
                ]}
                numberOfLines={2}
              >
                {expoPushToken}
              </Text>
            </View>
          )} */}
        </Card>

        {/* Notification Display */}
        {/* <NotificationDisplay /> */}

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("test_settings")}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t("use_location")}
            </Text>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={locationEnabled ? "#ffffff" : colors.lighterGrey}
            />
          </View>
        </Card>

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("help_support")}
          </Text>
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.helpText, { color: colors.text }]}>
              {t("how_to_use")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.lighterGrey}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.helpText, { color: colors.text }]}>
              {t("user_guide")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.lighterGrey}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={[styles.helpText, { color: colors.text }]}>
              {t("contact_support")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.lighterGrey}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
            <Text style={[styles.helpText, { color: colors.text }]}>
              {t("rate_app")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.lighterGrey}
            />
          </TouchableOpacity>
        </Card>

        <Card style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("data_management")}
          </Text>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.danger }]}
            onPress={confirmClearData}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
            <Text style={styles.dangerButtonText}>{t("clear_all_data")}</Text>
          </TouchableOpacity>
        </Card>

        <Card style={{ ...styles.card, backgroundColor: colors.card, marginBottom: 40 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about")}
          </Text>
          <View style={styles.aboutContainer}>
            <Text style={[styles.appName, { color: colors.text }]}>
              {t("app_name")}
            </Text>
            <Text style={[styles.appVersion, { color: colors.lighterGrey }]}>
              {t("version")} 1.0.0
            </Text>
            <Text
              style={[styles.appDescription, { color: colors.lighterGrey }]}
            >
              {t("app_description")}
            </Text>
          </View>
        </Card>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((t) => ({ ...t, visible: false }))}
        />
      </ScrollView>
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  themeDropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    backgroundColor: "transparent",
  },
  themeDropdownText: {
    fontSize: 14,
    fontWeight: "500",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  permissionButton: {
    padding: 6,
    borderRadius: 4,
  },
  clearNotificationsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  clearNotificationsText: {
    fontSize: 14,
    marginLeft: 6,
  },
  pushTokenContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pushTokenLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  pushTokenText: {
    fontSize: 10,
    fontFamily: "monospace",
    padding: 4,
    borderRadius: 4,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  helpText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    opacity: 0.7,
    marginBottom: 12,
  },
  appDescription: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
});
