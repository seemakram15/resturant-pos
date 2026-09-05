import { notFound } from "next/navigation";
import { locales, isRtl, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const l = locale as Locale;

  return (
    <div lang={l} dir={isRtl(l) ? "rtl" : "ltr"}>
      <SiteHeader locale={l} />
      <main>{children}</main>
      <SiteFooter locale={l} />
    </div>
  );
}
