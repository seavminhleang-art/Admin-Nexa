import workspaceEn from "./locales/workspace/en.json";
import workspaceKm from "./locales/workspace/km.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en.json";
import khTranslation from "./locales/kh.json";
import enCommunityTranslation from "./Components/locales/en.json";
import kmCommunityTranslation from "./Components/locales/km.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      workspace: workspaceEn,
      translation: { ...enTranslation, ...enCommunityTranslation },
    },
    km: {
      workspace: workspaceKm,
      translation: { ...khTranslation, ...kmCommunityTranslation },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
