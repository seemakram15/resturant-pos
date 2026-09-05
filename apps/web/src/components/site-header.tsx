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
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  const count = useCart((s) => s.count());

  const otherLocale = altLocale(locale);
  const swappedPath =
    pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${otherLocale}`) ||
    `/${otherLocale}`;

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  const NavLinks = () => (
    <>
      <Link href={`/${locale}`} className={isActive(`/${locale}`) ? "on" : ""}>{t("nav.home")}</Link>
      <Link href={`/${locale}/menu`} className={isActive(`/${locale}/menu`) ? "on" : ""}>{t("nav.menu")}</Link>
      <Link href={`/${locale}/contact`} className={isActive(`/${locale}/contact`) ? "on" : ""}>{t("nav.contact")}</Link>
    </>
  );

  return (
    <header className="site-header v2">
      <div className="container site-header-inner">
        <Link href={`/${locale}`} className="brand-lockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" className="logo-img" width={40} height={40} />
          <span className="brand-text">
            <span className="mark">{locale === "ur" ? "خلیفہ فوڈز" : "Khalifa Foods"}</span>
            <span className="tag">{t("brand.tagline")}</span>
          </span>
        </Link>

        <nav className="nav-pill" aria-label="Primary">
          <NavLinks />
        </nav>

        <div className="header-actions">
          <Link href={swappedPath} className="locale-toggle" prefetch={false} aria-label={`Switch language to ${otherLocale.toUpperCase()}`}>
            {otherLocale.toUpperCase()}
          </Link>
          <Link href={`/${locale}/signin`} className="link-signin">
            {locale === "ur" ? "لاگ ان" : "Sign in"}
          </Link>
          <Link href={`/${locale}/signup`} className="btn signup-btn">
            {locale === "ur" ? "اکاؤنٹ بنائیں" : "Sign up"}
          </Link>
          <Link href={`/${locale}/cart`} className="icon-btn cart-icon" aria-label={t("nav.cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
            </svg>
            {mounted && count > 0 && <span className="badge">{count}</span>}
          </Link>
          <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-panel">
          <div className="container mobile-nav">
            <NavLinks />
            <div className="mobile-actions">
              <Link href={`/${locale}/signin`} className="btn ghost">{locale === "ur" ? "لاگ ان" : "Sign in"}</Link>
              <Link href={`/${locale}/signup`} className="btn">{locale === "ur" ? "اکاؤنٹ بنائیں" : "Sign up"}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
