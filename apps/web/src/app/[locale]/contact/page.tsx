import { makeT, type Locale } from "@/lib/i18n";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = makeT(l);

  return (
    <div className="container section" style={{ maxWidth: "48rem" }}>
      <div className="section-head">
        <h2>{t("nav.contact")}</h2>
      </div>

      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(14rem,1fr))", gap: "1.5rem" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: ".35rem" }}>{l === "ur" ? "پتہ" : "Address"}</div>
            <p style={{ margin: 0 }}>18-F Commercial, PCHS<br />New Gourmet Bakery<br />DHA Lahore</p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: ".35rem" }}>{l === "ur" ? "فون" : "Phone"}</div>
            <p style={{ margin: 0 }}>
              <a href="tel:+923234748660" style={{ color: "var(--accent)" }}>0323-4748660</a>
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: ".35rem" }}>WhatsApp</div>
            <p style={{ margin: 0 }}>
              <a href="https://wa.me/923234748660" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>
                Send us a message
              </a>
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: ".35rem" }}>{t("footer.hours")}</div>
            <p style={{ margin: 0 }}>12 PM – 2 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
