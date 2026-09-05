import { makeT, type Locale } from "@/lib/i18n";
import { getAllCombos, getCategories, getItemsByCategory } from "@/lib/menu-queries";
import { MenuBrowser } from "@/components/menu-browser";
import { HERO_IMAGE } from "@/lib/food-images";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale as Locale);
  return { title: t("menu.title") };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = makeT(l);
  const ur = l === "ur";
  const [combos, categories, itemsByCat] = await Promise.all([
    getAllCombos(),
    getCategories(),
    getItemsByCategory(),
  ]);
  const totalItems = Object.values(itemsByCat).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      {/* Menu hero — compact, image-backed */}
      <section className="menu-hero">
        <div className="menu-hero-bg" aria-hidden="true" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="menu-hero-veil" aria-hidden="true" />
        <div className="container menu-hero-inner">
          <span className="pill eyebrow-pill glass">
            <span className="dot" /> {ur ? "خلیفہ مینو" : "Khalifa menu"}
          </span>
          <h1>{t("menu.title")}</h1>
          <p>{t("menu.subtitle")}</p>
          <div className="menu-hero-stats">
            <span><strong>{combos.length}</strong> {ur ? "ڈیلز" : "deals"}</span>
            <span className="dot-sep" aria-hidden="true">·</span>
            <span><strong>{totalItems}</strong> {ur ? "ڈشز" : "dishes"}</span>
            <span className="dot-sep" aria-hidden="true">·</span>
            <span><strong>{categories.length}</strong> {ur ? "کیٹگریز" : "categories"}</span>
          </div>
        </div>
      </section>

      <div className="container menu-shell">
        <MenuBrowser
          locale={l}
          combos={combos}
          categories={categories}
          itemsByCat={itemsByCat}
        />
      </div>
    </>
  );
}
