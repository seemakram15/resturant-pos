import en from "./en.json";
import ur from "./ur.json";

export const messages = { en, ur } as const;
export type Locale = keyof typeof messages;
export const locales: Locale[] = ["en", "ur"];
export const defaultLocale: Locale = "en";

export function isRtl(locale: Locale) {
  return locale === "ur";
}
