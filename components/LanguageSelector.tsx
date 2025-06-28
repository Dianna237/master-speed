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
import { languageNames } from "@/store/languageStore";
import { useLanguageStore } from "@/store/languageStore";

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageSelect: (language: keyof typeof languageNames) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  onLanguageSelect,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language: currentLanguage } = useLanguageStore();

  const handleLanguageSelect = (
    selectedLanguage: keyof typeof languageNames
  ) => {
    onLanguageSelect(selectedLanguage);
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
                  {t("select_language")}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.languageOption,
                      {
                        backgroundColor:
                          currentLanguage === code
                            ? colors.primary + "20"
                            : "transparent",
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      handleLanguageSelect(code as keyof typeof languageNames)
                    }
                  >
                    <View style={styles.languageInfo}>
                      <Text
                        style={[styles.languageName, { color: colors.text }]}
                      >
                        {name}
                      </Text>
                      <Text
                        style={[
                          styles.languageCode,
                          { color: colors.lighterGrey },
                        ]}
                      >
                        {code.toUpperCase()}
                      </Text>
                    </View>
                    {currentLanguage === code && (
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
  languageList: {
    padding: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  languageCode: {
    fontSize: 12,
    fontWeight: "400",
  },
});
