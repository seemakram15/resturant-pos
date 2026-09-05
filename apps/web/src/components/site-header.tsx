"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { makeT, altLocale, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = useCart((s) => s.count());

  const otherLocale = altLocale(locale);
  const swappedPath =
    pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${otherLocale}`) ||
    `/${otherLocale}`;

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href={`/${locale}`} className="brand-lockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" className="logo-img" width={40} height={40} />
          <span className="brand-text">
            <span className="mark">{locale === "ur" ? "خلیفہ فوڈز" : "Khalifa Foods"}</span>
            <span className="tag">{t("brand.tagline")}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <Link href={`/${locale}`}>{t("nav.home")}</Link>
          <Link href={`/${locale}/menu`}>{t("nav.menu")}</Link>
          <Link href={`/${locale}/contact`}>{t("nav.contact")}</Link>
        </nav>

        <div className="header-actions">
          <Link href={swappedPath} className="locale-toggle" prefetch={false}>
            {otherLocale.toUpperCase()}
          </Link>
          <Link href={`/${locale}/cart`} className="btn subtle cart-btn" aria-label={t("nav.cart")}>
            {t("nav.cart")}
            {mounted && count > 0 && <span className="badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
