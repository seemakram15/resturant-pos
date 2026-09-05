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

type AddArg = {
  kind: "item" | "combo";
  refId: string;
  name_en: string;
  name_ur?: string | null;
  unitPrice: number;
};

/** Add button that turns into a +/- stepper once the item is in the cart. */
function AddControl({ line, label, onFlash }: { line: AddArg; label: string; onFlash: (n: string) => void }) {
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const existing = lines.find((l) => l.kind === line.kind && l.refId === line.refId);

  if (!existing) {
    return (
      <button
        className={`btn add-btn ${line.kind === "item" ? "subtle" : ""}`}
        onClick={() => {
          add(line);
          onFlash(line.name_en);
        }}
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
  const [active, setActive] = useState<string>("deals");
  const [flash, setFlash] = useState<string | null>(null);

  const cats = useMemo(
    () => [{ id: "deals", slug: "deals", name_en: "Deals", name_ur: "ڈیلز", sort_order: 0 }, ...categories.filter((c) => c.slug !== "deals")],
    [categories]
  );

  function pop(name: string) {
    setFlash(name);
    setTimeout(() => setFlash(null), 1400);
  }

  return (
    <>
      <nav className="chips" aria-label="Menu categories">
        {cats.map((c) => (
          <button key={c.slug} className={`chip ${active === c.slug ? "active" : ""}`} onClick={() => setActive(c.slug)}>
            {locale === "ur" && c.name_ur ? c.name_ur : c.name_en}
          </button>
        ))}
      </nav>

      {flash && (
        <div className="toast">✓ {t("menu.added")}: {flash}</div>
      )}

      {active === "deals" ? (
        DEAL_GROUPS.map((g) => {
          const items = combos.filter((c) => c.category === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} style={{ marginBottom: "3rem" }}>
              <h3 className="menu-group-head">{locale === "ur" ? g.label_ur : g.label_en}</h3>
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
            {(itemsByCat[active] ?? []).map((i) => (
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
          {(itemsByCat[active] ?? []).length === 0 && (
            <div className="empty">
              <div className="icon">🍽️</div>
              <p style={{ color: "var(--ink-3)" }}>
                {locale === "ur" ? "اس زمرے میں ابھی کچھ نہیں۔" : "Nothing in this category yet."}
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
