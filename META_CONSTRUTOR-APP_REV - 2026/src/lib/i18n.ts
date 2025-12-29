import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';
import esES from '@/locales/es-ES.json';
import frFR from '@/locales/fr-FR.json';
import ptPT from '@/locales/pt-PT.json';
import deDE from '@/locales/de-DE.json';
import itIT from '@/locales/it-IT.json';
import jaJP from '@/locales/ja-JP.json';
import zhCN from '@/locales/zh-CN.json';
import arSA from '@/locales/ar-SA.json';
import ruRU from '@/locales/ru-RU.json';

// Language resources
const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'pt-PT': { translation: ptPT },
  'de-DE': { translation: deDE },
  'it-IT': { translation: itIT },
  'ja-JP': { translation: jaJP },
  'zh-CN': { translation: zhCN },
  'ar-SA': { translation: arSA },
  'ru-RU': { translation: ruRU },
};

// Supported languages configuration
export const supportedLanguages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
];

// Initialize i18next
i18n
  .use(LanguageDetector) // Auto-detect browser language
  .use(initReactI18next) // React integration
  .init({
    resources,
    fallbackLng: 'pt-BR', // Default language
    debug: false, // Set to true for development debugging
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Save preference in localStorage
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Support for language variants
    load: 'currentOnly',
    
    // Namespace configuration (optional, for future organization)
    ns: ['translation'],
    defaultNS: 'translation',

    react: {
      useSuspense: true, // Enable suspense for loading
    },
  });

// RTL languages configuration
export const isRTL = (language: string) => {
  return ['ar-SA'].includes(language);
};

// Apply RTL direction to document
export const applyLanguageDirection = (language: string) => {
  const dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

// Listen for language changes and apply direction
i18n.on('languageChanged', (lng) => {
  applyLanguageDirection(lng);
});

// Apply initial direction
applyLanguageDirection(i18n.language);

export default i18n;
