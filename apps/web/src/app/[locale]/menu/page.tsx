import { makeT, type Locale } from "@/lib/i18n";
import { getAllCombos, getCategories, getItemsByCategory } from "@/lib/menu-queries";
import { MenuBrowser } from "@/components/menu-browser";

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
  const [combos, categories, itemsByCat] = await Promise.all([
    getAllCombos(),
    getCategories(),
    getItemsByCategory(),
  ]);

  return (
    <div className="container section">
      <div className="section-head">
        <div className="eyebrow">{t("brand.tagline")}</div>
        <h2>{t("menu.title")}</h2>
        <p>{t("menu.subtitle")}</p>
      </div>

      <MenuBrowser
        locale={l}
        combos={combos}
        categories={categories}
        itemsByCat={itemsByCat}
      />
    </div>
  );
}
