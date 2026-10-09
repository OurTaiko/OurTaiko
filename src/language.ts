export const languages = ["zh-Hans", "en", "ja", "ko"] as const;
export type Language = (typeof languages)[number];
export type Preference = Language | "auto";
export const storageKey = "ourtaiko.home.language";
export function isLanguage(value: unknown): value is Language {
  return languages.includes(value as Language);
}
export function resolveLanguage(
  preference: Preference,
  browserLanguages: readonly string[],
): Language {
  if (isLanguage(preference)) return preference;
  for (const value of browserLanguages) {
    const base = value.trim().toLowerCase().replaceAll("_", "-").split("-")[0];
    if (base === "zh") return "zh-Hans";
    if (isLanguage(base)) return base;
  }
  return "en";
}
export function readPreference(): Preference {
  try {
    const saved = localStorage.getItem(storageKey);
    return isLanguage(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}
export function savePreference(value: Preference) {
  try {
    if (value === "auto") localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, value);
  } catch {
    /* Switching remains available when storage is disabled. */
  }
}
