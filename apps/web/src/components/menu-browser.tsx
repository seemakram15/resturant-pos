"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n";
import { dealImage, itemImage } from "@/lib/food-images";
import type { Combo, Item, Category } from "@/lib/menu-queries";

const DEAL_GROUPS: Array<{ key: string; label_en: string; label_ur: string }> = [
  { key: "technologia", label_en: "Technologia deals", label_ur: "ٹیکنولوجیا ڈیلز" },
  { key: "twins", label_en: "Twins deals", label_ur: "ٹوئنز ڈیلز" },
  { key: "family", label_en: "Family deals", label_ur: "فیملی ڈیلز" },
  { key: "pizza", label_en: "Pizza deals", label_ur: "پیزا ڈیلز" },
];

const CAT_ICON: Record<string, string> = {
  deals: "★",
  burgers: "🍔", pizza: "🍕", shawarma: "🌯", sandwiches: "🥪",
  appetizers: "🍗", steaks: "🥩", chicken: "🍗", "paratha-wraps": "🌯",
  sides: "🍟", pasta: "🍝", drinks: "🥤",
};

const DIET_TAGS = [
  { key: "spicy",   label_en: "Spicy",    label_ur: "مسالہ دار", icon: "🌶" },
  { key: "grilled", label_en: "Grilled",  label_ur: "گرلڈ",      icon: "🔥" },
  { key: "beef",    label_en: "Beef",     label_ur: "بیف",       icon: "🥩" },
  { key: "luxury",  label_en: "Luxury",   label_ur: "لگژری",     icon: "✦"  },
];

type Sort = "popular" | "price-asc" | "price-desc" | "name";

type AddArg = {
  kind: "item" | "combo";
  refId: string;
  name_en: string;
  name_ur?: string | null;
  unitPrice: number;
};

function AddControl({ line, label, onFlash }: { line: AddArg; label: string; onFlash: (n: string) => void }) {
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const existing = lines.find((l) => l.kind === line.kind && l.refId === line.refId);
  if (!existing) {
    return (
      <button
        className="btn add-btn subtle"
        onClick={() => { add(line); onFlash(line.name_en); }}
      >
        + {label}
      </button>
    );
  }
  return (
    <div className="qty-stepper" role="group" aria-label={line.name_en}>
      <button aria-label="Decrease" onClick={() => setQty(existing.id, existing.qty - 1)}>−</button>
      <span className="n">{existing.qty}</span>
      <button aria-label="Increase" onClick={() => setQty(existing.id, existing.qty + 1)}>+</button>
    </div>
  );
}

export function MenuBrowser({
  locale,
  combos,
  categories,
  itemsByCat,
}: {
  locale: Locale;
  combos: Combo[];
  categories: Category[];
  itemsByCat: Record<string, Item[]>;
}) {
  const t = makeT(locale);
  const ur = locale === "ur";
  const [active, setActive] = useState<string>("deals");
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<Sort>("popular");
  const [tags, setTags] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const cats = useMemo(
    () => [{ id: "deals", slug: "deals", name_en: "Deals", name_ur: "ڈیلز", sort_order: 0 }, ...categories.filter((c) => c.slug !== "deals")],
    [categories]
  );

  // Category counts (respect only search + tag filters, not the active chip)
  const counts = useMemo(() => {
    const c: Record<string, number> = { deals: 0 };
    const q = query.trim().toLowerCase();
    c.deals = combos.filter((k) =>
      (!q || (k.name_en + " " + (k.description_en ?? "")).toLowerCase().includes(q))
    ).length;
    for (const cat of categories.filter((x) => x.slug !== "deals")) {
      const list = itemsByCat[cat.slug] ?? [];
      c[cat.slug] = list.filter((it) => {
        if (q && !(it.name_en + " " + (it.name_ur ?? "")).toLowerCase().includes(q)) return false;
        if (tags.length && !tags.every((t) => it.tags?.includes(t))) return false;
        return true;
      }).length;
    }
    return c;
  }, [combos, categories, itemsByCat, query, tags]);

  function toggleTag(k: string) {
    setTags((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]));
  }
  function reset() { setQuery(""); setTags([]); setSort("popular"); setActive("deals"); }
  function pop(name: string) { setFlash(name); setTimeout(() => setFlash(null), 1400); }

  // Filter + sort helpers ------------------------------------------------
  const q = query.trim().toLowerCase();

  const filteredCombos = useMemo(() => {
    let list = combos.slice();
    if (q) list = list.filter((k) => (k.name_en + " " + (k.description_en ?? "")).toLowerCase().includes(q));
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name")       list.sort((a, b) => a.name_en.localeCompare(b.name_en));
    return list;
  }, [combos, q, sort]);

  const filteredItems = useMemo(() => {
    if (active === "deals") return [] as Item[];
    let list = (itemsByCat[active] ?? []).slice();
    if (q) list = list.filter((i) => (i.name_en + " " + (i.name_ur ?? "")).toLowerCase().includes(q));
    if (tags.length) list = list.filter((i) => tags.every((t) => i.tags?.includes(t)));
    if (sort === "price-asc")  list.sort((a, b) => a.base_price - b.base_price);
    if (sort === "price-desc") list.sort((a, b) => b.base_price - a.base_price);
    if (sort === "name")       list.sort((a, b) => a.name_en.localeCompare(b.name_en));
    return list;
  }, [itemsByCat, active, q, tags, sort]);

  const activeCount = active === "deals" ? filteredCombos.length : filteredItems.length;
  const noResults = activeCount === 0 && (q || tags.length);
  const activeFilterCount = (q ? 1 : 0) + tags.length + (sort !== "popular" ? 1 : 0);

  return (
    <>
      {/* ── Filter bar (sticky) ────────────────────────────────────── */}
      <div className="menu-filterbar" role="search">
        <div className="mfb-row mfb-primary">
          <label className="mfb-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ur ? "برگرز، پیزا، شاورما تلاش کریں…" : "Search burgers, pizza, deals…"}
              aria-label={ur ? "تلاش" : "Search menu"}
            />
            {query && (
              <button className="mfb-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>
            )}
          </label>

          <div className="mfb-sort">
            <span className="mfb-label">{ur ? "ترتیب" : "Sort"}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={ur ? "ترتیب" : "Sort"}>
              <option value="popular">{ur ? "مقبول" : "Popular"}</option>
              <option value="price-asc">{ur ? "قیمت: کم → زیادہ" : "Price: low → high"}</option>
              <option value="price-desc">{ur ? "قیمت: زیادہ → کم" : "Price: high → low"}</option>
              <option value="name">{ur ? "نام (A–Z)" : "Name (A–Z)"}</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button className="mfb-reset" onClick={reset} aria-label="Reset filters">
              {ur ? "ری سیٹ" : "Reset"} ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="mfb-row mfb-tags" role="group" aria-label={ur ? "ٹیگ فلٹرز" : "Tag filters"}>
          {DIET_TAGS.map((tg) => (
            <button
              key={tg.key}
              type="button"
              className={`tag-toggle ${tags.includes(tg.key) ? "on" : ""}`}
              onClick={() => toggleTag(tg.key)}
              aria-pressed={tags.includes(tg.key)}
            >
              <span className="tt-ico" aria-hidden="true">{tg.icon}</span>
              <span>{ur ? tg.label_ur : tg.label_en}</span>
            </button>
          ))}
        </div>

        <nav className="chips scroll-x" aria-label="Menu categories">
          {cats.map((c) => (
            <button
              key={c.slug}
              className={`chip ${active === c.slug ? "active" : ""}`}
              onClick={() => setActive(c.slug)}
              aria-pressed={active === c.slug}
            >
              <span className="chip-ico" aria-hidden="true">{CAT_ICON[c.slug] ?? "•"}</span>
              <span>{ur && c.name_ur ? c.name_ur : c.name_en}</span>
              <span className="chip-count">{counts[c.slug] ?? 0}</span>
            </button>
          ))}
        </nav>

        <div className="mfb-meta">
          <span>{activeCount} {ur ? "آئٹمز" : "items"}</span>
          {(q || tags.length > 0) && (
            <span className="mfb-active-filters">
              {q && <span className="filter-pill">"{query}"</span>}
              {tags.map((tg) => (
                <span key={tg} className="filter-pill">
                  {DIET_TAGS.find((d) => d.key === tg)?.[ur ? "label_ur" : "label_en"]}
                  <button onClick={() => toggleTag(tg)} aria-label="Remove filter">×</button>
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      {flash && <div className="toast">✓ {t("menu.added")}: {flash}</div>}

      {/* ── Content ───────────────────────────────────────────────── */}
      {noResults ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>{ur ? "کوئی نتیجہ نہیں" : "Nothing matches yet"}</h3>
          <p>{ur ? "تلاش تبدیل کریں یا فلٹرز ری سیٹ کریں۔" : "Try a different word or reset the filters."}</p>
          <button className="btn primary" onClick={reset}>{ur ? "فلٹرز ری سیٹ کریں" : "Reset filters"}</button>
        </div>
      ) : active === "deals" ? (
        DEAL_GROUPS.map((g) => {
          const items = filteredCombos.filter((c) => c.category === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} style={{ marginBottom: "3rem" }}>
              <h3 className="menu-group-head">{ur ? g.label_ur : g.label_en}</h3>
              <div className="deals">
                {items.map((d) => (
                  <article key={d.slug} className="deal-card">
                    <div className="deal-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.photo_url ?? dealImage(d.category, d.slug)} alt={d.name_en} loading="lazy" />
                      <span className="cat-badge">{g.key}</span>
                    </div>
                    <div className="deal-body">
                      <div className="name">{d.name_en}</div>
                      {d.name_ur && <div className="name-ur">{d.name_ur}</div>}
                      <div className="desc">{d.description_en}</div>
                      <div className="price-row">
                        <span className="price"><span className="rs">Rs</span>{formatPKR(d.price, { withSymbol: false })}</span>
                        <AddControl
                          line={{ kind: "combo", refId: d.slug, name_en: d.name_en, name_ur: d.name_ur, unitPrice: d.price }}
                          label={t("menu.add_to_cart")}
                          onFlash={pop}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <section>
          <div className="items">
            {filteredItems.map((i) => (
              <article key={i.id} className="item-card">
                <div className="item-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.photo_url ?? itemImage(i.sku, active)} alt={i.name_en} loading="lazy" />
                </div>
                <div className="item-body">
                  <div className="name">{i.name_en}</div>
                  {i.name_ur && <div className="name-ur">{i.name_ur}</div>}
                  {i.tags?.length ? (
                    <div className="item-tags">
                      {i.tags.map((tag) => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="price-row">
                    <span className="price"><span className="rs">Rs</span>{formatPKR(i.base_price, { withSymbol: false })}</span>
                    <AddControl
                      line={{ kind: "item", refId: i.id, name_en: i.name_en, name_ur: i.name_ur, unitPrice: i.base_price }}
                      label={t("menu.add_to_cart")}
                      onFlash={pop}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
