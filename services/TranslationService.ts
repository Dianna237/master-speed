import { useLanguageStore } from "../store/languageStore";

// Import translation files
import enTranslations from "../translations/en.json";
import frTranslations from "../translations/fr.json";

// Define supported languages and their translation files
const translations: Record<string, any> = {
  en: enTranslations,
  fr: frTranslations,
};

// Default language
const DEFAULT_LANGUAGE = "en";

// Translation function
export function useTranslation() {
  const { language } = useLanguageStore();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentTranslations =
      translations[language] || translations[DEFAULT_LANGUAGE];
    let translation = currentTranslations[key] || key;

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(
          `{{${paramKey}}}`,
          String(paramValue)
        );
      });
    }

    return translation;
  };

  return { t, language };
}

// Get all available languages
export function getAvailableLanguages() {
  return Object.keys(translations);
}

// Get translation for a specific language
export function getTranslation(lang: string, key: string): string {
  const currentTranslations =
    translations[lang] || translations[DEFAULT_LANGUAGE];
  return currentTranslations[key] || key;
}

// Check if a language is supported
export function isLanguageSupported(lang: string): boolean {
  return lang in translations;
}
