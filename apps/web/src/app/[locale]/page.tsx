import Link from "next/link";
import { makeT, type Locale } from "@/lib/i18n";
import { formatPKR } from "@/lib/format";
import { getFeaturedDeals, getCategories } from "@/lib/menu-queries";
import { dealImage, CATEGORY_IMAGES, HERO_IMAGE, HERO_IMAGE_2 } from "@/lib/food-images";
import { ExploreStrip } from "@/components/explore-strip";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";

export const revalidate = 300;

const HERO_SLIDES = [
  HERO_IMAGE,
  HERO_IMAGE_2,
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1600&q=80",
];

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = makeT(l);
  const [deals, categories] = await Promise.all([getFeaturedDeals(6), getCategories()]);
  const showcase = categories.filter((c) => c.slug !== "deals");
  const ur = l === "ur";

  const testimonials = [
    { name: "Ayesha K.", role: ur ? "DHA فیز 5" : "DHA Phase 5", quote: ur ? "بہترین ذائقہ اور تیز ڈلیوری۔ فیملی کا نیا فیورٹ بن گیا۔" : "Best flavor in DHA — the burgers hit like a real restaurant. Fast delivery too." },
    { name: "Bilal R.", role: ur ? "کیویلری" : "Cavalry", quote: ur ? "پیزا واقعی لاجواب، ٹاپنگز فریش اور تہہ کرسپی۔" : "The pizza is genuinely outstanding — crust like a wood oven, toppings never skimped." },
    { name: "Sana M.", role: ur ? "ماڈل ٹاؤن" : "Model Town", quote: ur ? "فیملی ڈیل نے پارٹی بچا لی۔ سب کچھ گرم اور تازہ آیا۔" : "Ordered a Family Deal for 6 — everyone got what they wanted, all hot on arrival." },
  ];

  const steps = [
    { n: "01", title: ur ? "چنیں" : "Choose", body: ur ? "24 ڈیلز اور 70+ ڈشز میں سے منتخب کریں۔" : "Pick from 24 curated deals and 70+ dishes." },
    { n: "02", title: ur ? "آرڈر" : "Order", body: ur ? "کارٹ میں شامل، ایڈریس دیں، تصدیق کریں۔" : "Add to cart, drop your address, confirm in seconds." },
    { n: "03", title: ur ? "لطف اٹھائیں" : "Enjoy", body: ur ? "30 منٹ میں دروازے پر — تازہ اور گرم۔" : "30-minute delivery to your door — hot and fresh." },
  ];

  const dishes = [
    { key: "burgers",  label: ur ? "برگرز" : "Signature Burgers", tag: ur ? "10+ اقسام" : "10+ styles",   desc: ur ? "ہاتھ سے بنی بیف اور چکن پیٹی۔" : "Hand-pressed beef & chicken patties.",              img: CATEGORY_IMAGES.burgers },
    { key: "pizza",    label: ur ? "پیزا" : "Wood-Oven Pizza",    tag: ur ? "S · M · L" : "S · M · L",     desc: ur ? "پتلی، کرسپی تہہ، مکمل ٹاپنگز۔" : "Blistered crust, generous toppings.",             img: CATEGORY_IMAGES.pizza },
    { key: "shawarma", label: ur ? "شاورما" : "Arabic Shawarma",   tag: ur ? "بیف · چکن" : "beef · chicken", desc: ur ? "دن بھر گرل، جادوئی گارلک ساس۔" : "All-day rotisserie, garlic sauce that hits.",     img: CATEGORY_IMAGES.shawarma },
    { key: "chicken",  label: ur ? "چکن" : "Broast & Wings",       tag: ur ? "9 پیس ڈیلز" : "9-pc deals",   desc: ur ? "کرسپی باہر، جوسی اندر۔" : "Crackle on the outside, juicy inside.",                  img: CATEGORY_IMAGES.appetizers },
    { key: "steaks",   label: ur ? "اسٹیکس" : "Grilled Steaks",     tag: ur ? "پیری پیری" : "peri · arabic",  desc: ur ? "چار کول گرل، تازہ فرائز کے ساتھ۔" : "Charcoal-grilled, served with hot fries.",     img: CATEGORY_IMAGES.steaks },
    { key: "paratha-wraps", label: ur ? "پراٹھا ریپ" : "Paratha Wraps", tag: ur ? "5 اقسام" : "5 varieties", desc: ur ? "گرم پراٹھا، بھرپور فلنگ۔" : "Griddled paratha, loaded fillings.",                    img: CATEGORY_IMAGES["paratha-wraps"] },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — cinematic Ken-Burns slideshow, staggered reveal, floating chips
          ═══════════════════════════════════════════════════════════════ */}
      <section className="hero-vx" aria-label="Khalifa Foods">
        <div className="hero-vx-stage" aria-hidden="true">
          {HERO_SLIDES.map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={src} src={src} alt="" fetchPriority={i === 0 ? "high" : undefined} style={{ animationDelay: `${i * 6}s` }} />
          ))}
          <div className="hero-vx-noise" />
        </div>
        <div className="hero-vx-veil" aria-hidden="true" />
        <div className="hero-vx-glow" aria-hidden="true" />

        <div className="container hero-vx-inner">
          <div className="hero-vx-copy">
            <Reveal variant="fade" delay={0}>
              <span className="pill eyebrow-pill glass">
                <span className="dot" aria-hidden="true" />
                {t("hero.eyebrow")}
              </span>
            </Reveal>
            <Reveal variant="up" delay={120}>
              <h1 className="hero-vx-title">
                {ur ? (
                  <>بھرپور ذائقہ،<br /><em>خالص اجزاء</em></>
                ) : (
                  <>Bold flavor,<br /><em>honest ingredients.</em></>
                )}
              </h1>
            </Reveal>
            <Reveal variant="up" delay={220}>
              <p className="sub">{t("hero.subtitle")}</p>
            </Reveal>
            <Reveal variant="up" delay={320}>
              <div className="hero-actions">
                <Link href={`/${l}/menu`} className="btn primary big shine">
                  <span>{t("hero.cta_order")}</span>
                  <span className="arr" aria-hidden="true">→</span>
                </Link>
                <Link href={`/${l}/contact`} className="btn glass big">{t("nav.contact")}</Link>
              </div>
            </Reveal>
            <Reveal variant="up" delay={420}>
              <ul className="hero-trust glass-list" aria-label="Highlights">
                <li><span className="ico" aria-hidden="true">★</span><span><strong>4.8</strong> · {ur ? "خوش گاہک" : "loved by locals"}</span></li>
                <li><span className="ico" aria-hidden="true">⏱</span><span><strong>30 min</strong> · {ur ? "تیز ڈلیوری" : "fast delivery"}</span></li>
                <li><span className="ico" aria-hidden="true">✓</span><span><strong>100% halal</strong> · {ur ? "روزانہ تازہ" : "fresh daily"}</span></li>
              </ul>
            </Reveal>
          </div>

          <aside className="hero-vx-badges" aria-hidden="true">
            <div className="hero-chip rating-chip glass float-b">
              <span className="stars">★★★★★</span>
              <span className="sub">2.3k+ {ur ? "آرڈرز" : "orders"}</span>
            </div>
            <div className="hero-chip meta-chip glass float-c">
              <span className="ico" aria-hidden="true">🔥</span>
              <span className="txt">{ur ? "تازہ گرل" : "Fresh off the grill"}</span>
            </div>
          </aside>
        </div>

        <div className="scroll-hint" aria-hidden="true">{ur ? "نیچے دیکھیں" : "Scroll"}</div>
      </section>

      {/* Marquee (own band, not overlapping hero or info strip) */}
      <div className="brand-marquee" aria-hidden="true">
        <div className="brand-marquee-track">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="brand-marquee-row">
              <span>Khalifa Special Burgers</span><span>·</span>
              <span>Wood-Oven Pizza</span><span>·</span>
              <span>Peri Peri Steaks</span><span>·</span>
              <span>Loaded Fries</span><span>·</span>
              <span>Family Deals from Rs 1,199</span><span>·</span>
              <span>30-min Delivery in DHA</span><span>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INFO STRIP — quick contact facts
          ═══════════════════════════════════════════════════════════════ */}
      <div className="container">
        <Reveal variant="up">
          <div className="info-strip v3">
            <div className="item"><span className="k">{t("footer.hours")}</span><span className="v">12 PM – 2 AM</span></div>
            <div className="item"><span className="k">{t("footer.call")}</span><span className="v"><a href="tel:+923234748660">0323-4748660</a></span></div>
            <div className="item"><span className="k">{ur ? "پتہ" : "Address"}</span><span className="v">DHA Lahore, PCHS</span></div>
            <div className="item"><span className="k">{ur ? "ادائیگی" : "Payment"}</span><span className="v">{ur ? "کیش آن ڈلیوری" : "Cash on delivery"}</span></div>
          </div>
        </Reveal>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STATS — count-up on scroll
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section container">
        <div className="stat-row">
          <Reveal variant="up" delay={0}><div className="stat"><span className="stat-n"><Counter to={2300} suffix="+" /></span><span className="stat-t">{ur ? "خوش گاہک" : "Happy orders"}</span></div></Reveal>
          <Reveal variant="up" delay={80}><div className="stat"><span className="stat-n"><Counter to={4.8} decimals={1} /></span><span className="stat-t">{ur ? "ریٹنگ" : "Rating"}</span></div></Reveal>
          <Reveal variant="up" delay={160}><div className="stat"><span className="stat-n"><Counter to={30} suffix=" min" /></span><span className="stat-t">{ur ? "اوسط ڈلیوری" : "Avg. delivery"}</span></div></Reveal>
          <Reveal variant="up" delay={240}><div className="stat"><span className="stat-n"><Counter to={24} /></span><span className="stat-t">{ur ? "خصوصی ڈیلز" : "Curated deals"}</span></div></Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          EXPLORE — full category list, horizontal strip
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section container">
        <Reveal variant="up">
          <div className="section-head split">
            <div>
              <div className="eyebrow">{ur ? "مینو" : "Explore the menu"}</div>
              <h2>{ur ? "ہر ذائقے کے لیے کچھ" : "Something for every craving"}</h2>
            </div>
            <Link href={`/${l}/menu`} className="view-all">{ur ? "سب دیکھیں" : "View all"} →</Link>
          </div>
        </Reveal>
        <Reveal variant="fade" delay={120}>
          <ExploreStrip
            items={showcase.map((c) => ({
              slug: c.slug,
              href: `/${l}/menu`,
              img: CATEGORY_IMAGES[c.slug] ?? CATEGORY_IMAGES.deals,
              label: ur && c.name_ur ? c.name_ur : c.name_en,
              sub: c.name_en,
            }))}
          />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SIGNATURE — bento grid of hero dishes
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section container">
        <Reveal variant="up">
          <div className="section-head center">
            <div className="eyebrow">{ur ? "دستخطی ڈشز" : "Signature dishes"}</div>
            <h2>{ur ? "شہر بھر میں مشہور" : "The dishes people come back for"}</h2>
            <p>{ur ? "ہاتھ سے بنی پیٹیز، تازہ سبزیاں، لکڑی کے تنور میں پکا پیزا۔" : "Hand-pressed patties, fresh produce, wood-oven pizza — nothing from a freezer."}</p>
          </div>
        </Reveal>
        <div className="dish-grid">
          {dishes.map((d, i) => (
            <Reveal key={d.key} variant="up" delay={i * 70} className="dish-card">
              <Link href={`/${l}/menu`} className="dish-link" aria-label={d.label}>
                <span className="dish-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.img} alt="" loading="lazy" />
                  <span className="dish-tag">{d.tag}</span>
                </span>
                <span className="dish-body">
                  <span className="dish-title-row">
                    <h3>{d.label}</h3>
                    <span className="dish-arrow" aria-hidden="true">→</span>
                  </span>
                  <p>{d.desc}</p>
                  <span className="dish-cta">{ur ? "مینو دیکھیں" : "See on menu"}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED DEALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section alt">
        <div className="container">
          <Reveal variant="up">
            <div className="section-head split">
              <div>
                <div className="eyebrow">{t("menu.categories.deals")}</div>
                <h2>{ur ? "آج کے مقبول ڈیلز" : "Today's most-loved deals"}</h2>
                <p>{ur ? "چوبیس ڈیلز میں سے چند خاص — حقیقی بھوک کے لیے بنے۔" : "A handful from our 24 curated combos — built for real appetites."}</p>
              </div>
              <Link href={`/${l}/menu`} className="view-all">{ur ? "سب دیکھیں" : "View all"} →</Link>
            </div>
          </Reveal>

          <div className="deals">
            {deals.map((d, i) => (
              <Reveal key={d.slug} variant="up" delay={i * 70}>
                <Link href={`/${l}/menu`} className="deal-card" style={{ textDecoration: "none" }}>
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
                      <span className="pill solid">{ur ? "دیکھیں" : "See more"} →</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal variant="up" delay={120}>
            <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
              <Link href={`/${l}/menu`} className="btn primary big shine">
                <span>{ur ? "پورا مینو دیکھیں" : "See the full menu"}</span>
                <span className="arr" aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3-step timeline
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section container">
        <Reveal variant="up">
          <div className="section-head center">
            <div className="eyebrow">{ur ? "طریقہ کار" : "How it works"}</div>
            <h2>{ur ? "تین آسان قدم" : "Three easy steps to a hot meal"}</h2>
          </div>
        </Reveal>
        <div className="steps">
          {steps.map((s, i) => (
            <Reveal key={s.n} variant="up" delay={i * 100} className="step-card">
              <div className="step-n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="step-line" aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section alt">
        <div className="container">
          <Reveal variant="up">
            <div className="section-head center">
              <div className="eyebrow">{ur ? "گاہکوں کی رائے" : "What people say"}</div>
              <h2>{ur ? "لاہور کا اعتماد" : "Trusted across Lahore"}</h2>
            </div>
          </Reveal>
          <div className="testimonials">
            {testimonials.map((tm, i) => (
              <Reveal key={tm.name} variant="up" delay={i * 100} className="testimonial-card">
                <div className="quote-mark" aria-hidden="true">"</div>
                <p className="q">{tm.quote}</p>
                <div className="who">
                  <span className="avatar" aria-hidden="true">{tm.name.charAt(0)}</span>
                  <div>
                    <div className="name">{tm.name}</div>
                    <div className="role">{tm.role}</div>
                  </div>
                  <div className="stars" aria-label="5 stars">★★★★★</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FINALE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="cta-finale">
        <div
          className="cta-finale-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="cta-finale-veil" aria-hidden="true" />
        <div className="container cta-finale-inner">
          <Reveal variant="up">
            <div className="eyebrow eyebrow-light">{ur ? "آج ہی آرڈر" : "Order tonight"}</div>
            <h2>{ur ? "بھوک لگی؟ ہم پکا رہے ہیں۔" : "Hungry? We're already firing up the grill."}</h2>
            <p>{ur ? "30 منٹ میں گرم کھانا آپ کے دروازے پر۔" : "Hot food at your door in 30 minutes — cash on delivery."}</p>
            <div className="hero-actions center">
              <Link href={`/${l}/menu`} className="btn primary big shine">
                <span>{t("hero.cta_order")}</span><span className="arr" aria-hidden="true">→</span>
              </Link>
              <a href="tel:+923234748660" className="btn glass big">
                {ur ? "کال کریں" : "Call to order"} · 0323-4748660
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
