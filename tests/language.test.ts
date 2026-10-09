import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  languages,
  resolveLanguage,
  readPreference,
  savePreference,
  storageKey,
} from "../src/language.ts";

test("browser matching supports region variants, priority and fallback", () => {
  assert.equal(resolveLanguage("auto", ["fr-FR", "ja-JP", "en-US"]), "ja");
  assert.equal(resolveLanguage("auto", ["zh-Hant-TW"]), "zh-Hans");
  assert.equal(resolveLanguage("auto", ["ko_KR"]), "ko");
  assert.equal(resolveLanguage("auto", ["EN-gb"]), "en");
  assert.equal(resolveLanguage("auto", ["fr"]), "en");
  assert.equal(resolveLanguage("auto", []), "en");
  assert.equal(resolveLanguage("zh-Hans", ["en-US"]), "zh-Hans");
});
test("manual choice persists and auto clears it; blocked storage is safe", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map<string, string>();
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key),
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    savePreference("ko");
    assert.equal(readPreference(), "ko");
    savePreference("auto");
    assert.equal(readPreference(), "auto");
    assert.equal(values.has(storageKey), false);
    values.set(storageKey, "invalid");
    assert.equal(readPreference(), "auto");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("Storage unavailable");
      },
    });
    assert.equal(readPreference(), "auto");
    assert.doesNotThrow(() => savePreference("ja"));
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
test("all four translations have the same nonempty messages", () => {
  const dictionaries = languages.map((language) =>
    JSON.parse(
      readFileSync(
        new URL(`../src/locales/${language}.json`, import.meta.url),
        "utf8",
      ),
    ),
  );
  const keys = Object.keys(dictionaries[0]).sort();
  for (const dictionary of dictionaries) {
    assert.deepEqual(Object.keys(dictionary).sort(), keys);
    for (const value of Object.values(dictionary))
      assert.ok(typeof value === "string" && value.trim().length > 0);
  }
});
