import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import common from "./locales/common";
import {
  readPreference,
  resolveLanguage,
  savePreference,
  storageKey,
} from "./language";
import type { Language, Preference } from "./language";

export type Messages = Record<string, string>;
export type Bundle<M extends Messages> = Record<Language, M>;
export type CommonKey = keyof (typeof common)["zh-Hans"];

const ogLocale: Record<Language, string> = {
  "zh-Hans": "zh_CN",
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
};

type Context = {
  t: (key: string) => string;
  language: Language;
  preference: Preference;
  selectLanguage: (value: Preference) => void;
};
const LanguageContext = createContext<Context | null>(null);

function browserLanguages() {
  return navigator.languages?.length
    ? [...navigator.languages]
    : [navigator.language];
}

/** Provides one page's messages (merged over the shared ones) in the chosen language. */
export function LanguageProvider({
  messages,
  children,
}: {
  messages: Bundle<Messages>;
  children: ReactNode;
}) {
  const [preference, setPreference] = useState<Preference>(readPreference);
  const [browser, setBrowser] = useState(browserLanguages);
  const language = resolveLanguage(preference, browser);
  const dictionary: Messages = { ...common[language], ...messages[language] };
  const t = (key: string) => dictionary[key] ?? key;

  useEffect(() => {
    const onLanguage = () => setBrowser(browserLanguages());
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
    const page = messages[language];
    document.documentElement.lang = language;
    document.title = page["page.title"];
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ])
      document
        .querySelector(selector)
        ?.setAttribute("content", page["page.description"]);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", page["page.title"]);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", ogLocale[language]);
  }, [language, messages]);

  const selectLanguage = (value: Preference) => {
    savePreference(value);
    setPreference(value);
  };
  return (
    <LanguageContext value={{ t, language, preference, selectLanguage }}>
      {children}
    </LanguageContext>
  );
}

/** `K` names the page's keys so a misspelt key fails type checking. */
export function useLanguage<K extends string = CommonKey>() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context as Omit<Context, "t"> & {
    t: (key: K | CommonKey) => string;
  };
}
