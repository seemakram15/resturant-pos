import Link from "next/link";
import { makeT, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href={`/${locale}`} className="brand-lockup">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="" className="logo-img" width={40} height={40} />
              <span className="brand-text">
                <span className="mark">{locale === "ur" ? "خلیفہ فوڈز" : "Khalifa Foods"}</span>
                <span className="tag">{t("brand.tagline")}</span>
              </span>
            </Link>
            <p>
              {locale === "ur"
                ? "تازہ اجزاء، بھرپور ذائقہ، اور ہر آرڈر پر خلوص۔ ڈی ایچ اے لاہور میں آپ کی خدمت میں۔"
                : "Fresh ingredients, bold flavor, and honest cooking on every order. Serving DHA Lahore, hot off the counter."}
            </p>
            <div className="social-row">
              <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">◍</a>
              <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">f</a>
              <a href="https://wa.me/923234748660" target="_blank" rel="noopener" aria-label="WhatsApp">✆</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t("nav.menu")}</h4>
            <Link href={`/${locale}/menu`}>{t("nav.menu")}</Link>
            <Link href={`/${locale}/cart`}>{t("nav.cart")}</Link>
            <Link href={`/${locale}/contact`}>{t("nav.contact")}</Link>
          </div>

          <div className="footer-col">
            <h4>{t("footer.hours")}</h4>
            <p>{locale === "ur" ? "روزانہ" : "Daily"}<br />12:00 PM – 2:00 AM</p>
            <p>{locale === "ur" ? "کیش آن ڈلیوری / پک اپ" : "Cash on delivery / pickup"}</p>
          </div>

          <div className="footer-col">
            <h4>{t("nav.contact")}</h4>
            <p>18-F Commercial, PCHS<br />New Gourmet Bakery, DHA Lahore</p>
            <a href="tel:+923234748660">☎ 0323-4748660</a>
            <a href="mailto:orders@khalifafoods.com">orders@khalifafoods.com</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t("footer.rights")}</span>
          <span>Powered by Khalifa OS</span>
        </div>
      </div>
    </footer>
  );
}
