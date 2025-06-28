import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "@/services/TranslationService";

const themeOptions = [
  { key: "light", icon: "sunny", label: "light" },
  { key: "dark", icon: "moon", label: "dark" },
  { key: "system", icon: "settings", label: "system" },
];

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onThemeSelect: (theme: "light" | "dark" | "system") => void;
  currentTheme: "light" | "dark" | "system";
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  visible,
  onClose,
  onThemeSelect,
  currentTheme,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleThemeSelect = (selectedTheme: "light" | "dark" | "system") => {
    onThemeSelect(selectedTheme);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {t("theme_mode")}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.themeList}
                showsVerticalScrollIndicator={false}
              >
                {themeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor:
                          currentTheme === option.key
                            ? colors.primary + "20"
                            : "transparent",
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleThemeSelect(option.key as any)}
                  >
                    <View style={styles.themeInfo}>
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={colors.text}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.themeName, { color: colors.text }]}>
                        {t(option.label)}
                      </Text>
                    </View>
                    {currentTheme === option.key && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  themeList: {
    padding: 8,
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
