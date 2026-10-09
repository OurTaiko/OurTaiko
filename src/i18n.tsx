import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import zh from "./locales/zh-Hans.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import {
  readPreference,
  resolveLanguage,
  savePreference,
  storageKey,
} from "./language";
import type { Language, Preference } from "./language";
export type MessageKey = keyof typeof zh;
const messages: Record<Language, Record<MessageKey, string>> = {
  "zh-Hans": zh,
  en,
  ja,
  ko,
};
const LanguageContext = createContext<{
  t: (key: MessageKey) => string;
  preference: Preference;
  selectLanguage: (value: Preference) => void;
} | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference>(readPreference);
  const [browserLanguages, setBrowserLanguages] = useState(() =>
    navigator.languages?.length
      ? [...navigator.languages]
      : [navigator.language],
  );
  const language = resolveLanguage(preference, browserLanguages);
  const t = (key: MessageKey) => messages[language][key];
  useEffect(() => {
    const onLanguage = () =>
      setBrowserLanguages(
        navigator.languages?.length
          ? [...navigator.languages]
          : [navigator.language],
      );
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        setPreference(readPreference());
    };
    window.addEventListener("languagechange", onLanguage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("languagechange", onLanguage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = messages[language]["page.title"];
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ])
      document
        .querySelector(selector)
        ?.setAttribute("content", messages[language]["page.description"]);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", messages[language]["page.title"]);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute(
        "content",
        { "zh-Hans": "zh_CN", en: "en_US", ja: "ja_JP", ko: "ko_KR" }[language],
      );
  }, [language]);
  const selectLanguage = (value: Preference) => {
    savePreference(value);
    setPreference(value);
  };
  return (
    <LanguageContext value={{ t, preference, selectLanguage }}>
      {children}
    </LanguageContext>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}
