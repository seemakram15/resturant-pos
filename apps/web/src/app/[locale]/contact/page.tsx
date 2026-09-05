import { makeT, type Locale } from "@/lib/i18n";
import { ContactForm } from "@/components/contact-form";
import { HERO_IMAGE_2 } from "@/lib/food-images";

export const metadata = { title: "Contact" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = makeT(l);
  const ur = l === "ur";

  const channels = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      ),
      kicker: ur ? "کال کریں" : "Call us",
      title: "0323-4748660",
      href: "tel:+923234748660",
      sub: ur ? "روزانہ 12 PM – 2 AM" : "Daily 12 PM – 2 AM",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.34.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.31-1.7a11.9 11.9 0 0 0 5.75 1.5h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42z"/></svg>
      ),
      kicker: "WhatsApp",
      title: ur ? "ابھی پیغام کریں" : "Chat instantly",
      href: "https://wa.me/923234748660",
      sub: ur ? "زیادہ تر جواب چند منٹ میں" : "We usually reply within minutes",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
      ),
      kicker: "Email",
      title: "orders@khalifafoods.com",
      href: "mailto:orders@khalifafoods.com",
      sub: ur ? "24 گھنٹے میں جواب" : "Within 24 hours",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ),
      kicker: ur ? "آئیں" : "Visit us",
      title: "18-F Commercial, PCHS",
      href: "https://maps.app.goo.gl/55WZ4w5QYM6hFgDn9",
      sub: "DHA Lahore",
    },
  ];

  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero-bg" aria-hidden="true" style={{ backgroundImage: `url(${HERO_IMAGE_2})` }} />
        <div className="contact-hero-veil" aria-hidden="true" />
        <div className="container contact-hero-inner">
          <span className="pill eyebrow-pill glass">
            <span className="dot" /> {ur ? "خلیفہ فوڈز · رابطہ" : "Khalifa Foods · Contact"}
          </span>
          <h1>{ur ? "بات کرتے ہیں۔" : "Let's talk."}</h1>
          <p>{ur ? "کوئی سوال، کیٹرنگ آرڈر یا فیڈ بیک؟ ہم سننا چاہتے ہیں۔" : "A question, a bulk order, feedback — we'd love to hear from you."}</p>
        </div>
      </section>

      <div className="container contact-shell">
        <div className="contact-grid">
          <aside className="contact-side">
            <div className="contact-side-head">
              <div className="eyebrow">{ur ? "بہترین طریقے سے پہنچیں" : "Reach us the fast way"}</div>
              <h2>{ur ? "ہم روزانہ آن لائن ہیں" : "We're online, every day."}</h2>
              <p>{ur ? "کال، واٹس ایپ یا ای میل — جو آپ کو آسان لگے۔" : "Pick the channel you prefer. All of them reach a real person."}</p>
            </div>

            <ul className="contact-channels">
              {channels.map((c) => (
                <li key={c.title}>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
                    <span className="cc-icon" aria-hidden="true">{c.icon}</span>
                    <span className="cc-body">
                      <span className="cc-kicker">{c.kicker}</span>
                      <span className="cc-title">{c.title}</span>
                      <span className="cc-sub">{c.sub}</span>
                    </span>
                    <span className="cc-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="contact-map">
              <iframe
                title="Khalifa Fast Food · DHA Lahore"
                src="https://www.google.com/maps?q=Khalifa+Fast+Food+DHA+Lahore&ll=31.4549687,74.3664228&z=17&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </aside>

          <section className="contact-card">
            <header className="contact-card-head">
              <h2>{ur ? "پیغام بھیجیں" : "Send us a message"}</h2>
              <p>{ur ? "چند تفصیلات دیں، ہم جواب دیں گے۔" : "Fill in a few details and we'll get right back to you."}</p>
            </header>
            <ContactForm locale={l} />
          </section>
        </div>
      </div>

      <span className="sr-only">{t("nav.contact")}</span>
    </>
  );
}
