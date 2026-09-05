import Link from "next/link";
import { makeT, type Locale } from "@/lib/i18n";
import { formatPKR } from "@/lib/format";
import { getFeaturedDeals, getCategories } from "@/lib/menu-queries";
import { dealImage, CATEGORY_IMAGES, HERO_IMAGE, HERO_IMAGE_2 } from "@/lib/food-images";

export const revalidate = 300; // 5-minute ISR

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = makeT(l);
  const [deals, categories] = await Promise.all([getFeaturedDeals(6), getCategories()]);
  const showcase = categories.filter((c) => c.slug !== "deals").slice(0, 6);

  return (
    <>
      {/* ── Cinematic hero ──────────────────────────────────────────── */}
      <section className="hero-cinematic">
        <div className="hero-stage" aria-hidden="true">
          {/* eslint-disable @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt="" fetchPriority="high" />
          <img src={HERO_IMAGE_2} alt="" />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <div className="container hero-content">
          <div className="eyebrow">{t("hero.eyebrow")}</div>
          <h1>
            {l === "ur" ? (
              <>بھرپور ذائقہ،<br /><em>خالص اجزاء</em></>
            ) : (
              <>Bold flavor,<br /><em>honest ingredients.</em></>
            )}
          </h1>
          <p className="sub">{t("hero.subtitle")}</p>
          <div className="hero-cta">
            <Link href={`/${l}/menu`} className="btn big">{t("hero.cta_order")} →</Link>
            <Link href={`/${l}/contact`} className="btn ghost big">{t("nav.contact")}</Link>
          </div>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          {l === "ur" ? "نیچے دیکھیں" : "Scroll"}
        </div>
      </section>

      {/* ── Info strip (floats over hero) ───────────────────────────── */}
      <div className="container">
        <div className="info-strip">
          <div className="item">
            <span className="k">{t("footer.hours")}</span>
            <span className="v">12 PM – 2 AM</span>
          </div>
          <div className="item">
            <span className="k">{t("footer.call")}</span>
            <span className="v"><a href="tel:+923234748660" style={{ color: "var(--accent)" }}>0323-4748660</a></span>
          </div>
          <div className="item">
            <span className="k">{l === "ur" ? "پتہ" : "Address"}</span>
            <span className="v">DHA Lahore, PCHS</span>
          </div>
          <div className="item">
            <span className="k">{l === "ur" ? "ادائیگی" : "Payment"}</span>
            <span className="v">{l === "ur" ? "کیش آن ڈلیوری" : "Cash on delivery"}</span>
          </div>
        </div>
      </div>

      {/* ── Category showcase ───────────────────────────────────────── */}
      <section className="section container">
        <div className="section-head center">
          <div className="eyebrow">{l === "ur" ? "مینو" : "Explore the menu"}</div>
          <h2>{l === "ur" ? "ہر ذائقے کے لیے کچھ" : "Something for every craving"}</h2>
          <p>{l === "ur" ? "زمرے کے حساب سے دیکھیں — برگر، چکن، شاورما، پیزا اور مزید۔" : "Browse by category — burgers, chicken, shawarma, pizza and more."}</p>
        </div>
        <div className="cat-showcase">
          {showcase.map((c) => (
            <Link key={c.slug} href={`/${l}/menu`} className="cat-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CATEGORY_IMAGES[c.slug] ?? CATEGORY_IMAGES.deals} alt={c.name_en} loading="lazy" />
              <span className="label">
                {l === "ur" && c.name_ur ? c.name_ur : c.name_en}
                <small>{c.name_en}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured deals ──────────────────────────────────────────── */}
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">{t("menu.categories.deals")}</div>
            <h2>{l === "ur" ? "آج کے مقبول ڈیلز" : "Today's most-loved deals"}</h2>
            <p>{l === "ur" ? "چوبیس ڈیلز میں سے چند خاص — حقیقی بھوک کے لیے بنے۔" : "A handful from our 24 curated combos — built for real appetites."}</p>
          </div>

          <div className="deals">
            {deals.map((d) => (
              <Link key={d.slug} href={`/${l}/menu`} className="deal-card" style={{ textDecoration: "none" }}>
                <div className="deal-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dealImage(d.category, d.slug)} alt={d.name_en} loading="lazy" />
                  <span className="cat-badge">{d.category}</span>
                </div>
                <div className="deal-body">
                  <div className="name">{d.name_en}</div>
                  {d.name_ur && <div className="name-ur">{d.name_ur}</div>}
                  <div className="desc">{d.description_en}</div>
                  <div className="price-row">
                    <span className="price"><span className="rs">Rs</span>{formatPKR(d.price, { withSymbol: false })}</span>
                    <span className="pill solid">{l === "ur" ? "دیکھیں" : "See more"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
            <Link href={`/${l}/menu`} className="btn big">
              {l === "ur" ? "پورا مینو دیکھیں →" : "See the full menu →"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
