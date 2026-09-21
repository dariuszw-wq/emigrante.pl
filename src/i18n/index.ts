import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pl from "./locales/pl.json";
import en from "./locales/en.json";
import uk from "./locales/uk.json";
import ru from "./locales/ru.json";
import es from "./locales/es.json";

export const LANGS = ["pl", "en", "uk", "ru", "es"] as const;
export type Lang = (typeof LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
      uk: { translation: uk },
      ru: { translation: ru },
      es: { translation: es },
    },
    fallbackLng: "pl",
    supportedLngs: [...LANGS],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnObjects: true,
  });

// Synchronizacja <html lang> i meta z bieżącym językiem
const syncDocument = (lng: string) => {
  document.documentElement.lang = lng;
  document.title = i18n.t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", i18n.t("meta.description"));
};
i18n.on("languageChanged", syncDocument);
syncDocument(i18n.language);

export default i18n;
