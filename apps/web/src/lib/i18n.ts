import { messages, type Locale, locales, defaultLocale, isRtl } from "@khalifa/i18n";

export { locales, defaultLocale, isRtl };
export type { Locale };

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages[defaultLocale];
}

/** Deep-key lookup: t("hero.title") */
export function makeT(locale: Locale) {
  const dict = getMessages(locale) as Record<string, unknown>;
  return (key: string): string => {
    const parts = key.split(".");
    let node: unknown = dict;
    for (const p of parts) {
      if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[p];
      } else {
        return key;
      }
    }
    return typeof node === "string" ? node : key;
  };
}

export function altLocale(locale: Locale): Locale {
  return locale === "en" ? "ur" : "en";
}
