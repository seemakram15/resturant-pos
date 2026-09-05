"use client";

import Link from "next/link";
import { use } from "react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n";
import { itemImage, dealImage, CATEGORY_IMAGES } from "@/lib/food-images";

export default function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const l = locale as Locale;
  const t = makeT(l);
  const ur = l === "ur";
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());

  if (lines.length === 0) {
    return (
      <div className="container section cart-empty-wrap">
        <div className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
            </svg>
          </div>
          <h2>{ur ? "کارٹ خالی ہے" : "Your cart is empty"}</h2>
          <p>{ur ? "کوئی ڈش شامل کریں اور ادائیگی سے پہلے یہاں دیکھیں۔" : "Add a dish or two — you'll see them here before checkout."}</p>
          <Link href={`/${l}/menu`} className="btn primary big shine">
            <span>{t("cart.empty_cta")}</span><span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const imageFor = (line: (typeof lines)[number]) =>
    line.image ?? (line.kind === "combo" ? dealImage("family", line.refId) : itemImage(null, "deals"));

  return (
    <div className="container section cart-shell">
      <div className="cart-head">
        <div>
          <div className="eyebrow">{ur ? "چیک آؤٹ سے پہلے" : "Before checkout"}</div>
          <h1>{t("cart.title")}</h1>
          <p className="cart-head-sub">{count} {count === 1 ? (ur ? "آئٹم" : "item") : (ur ? "آئٹمز" : "items")} · {ur ? "کیش آن ڈلیوری قبول" : "cash on delivery accepted"}</p>
        </div>
        <button className="cart-clear" onClick={clear} type="button">
          {ur ? "سب ہٹائیں" : "Clear cart"}
        </button>
      </div>

      <div className="cart-grid v2">
        <ul className="cart-lines v2">
          {lines.map((line) => (
            <li key={line.id} className="cart-row">
              <span className="cart-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageFor(line)} alt="" loading="lazy" />
                <span className={`kind-tag ${line.kind}`}>
                  {line.kind === "combo" ? (ur ? "ڈیل" : "Deal") : (ur ? "آئٹم" : "Item")}
                </span>
              </span>

              <div className="cart-info">
                <div className="cart-name">{ur && line.name_ur ? line.name_ur : line.name_en}</div>
                <div className="cart-unit">{formatPKR(line.unitPrice)} {ur ? "فی" : "each"}</div>
                <button className="cart-remove" onClick={() => remove(line.id)} type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  {t("cart.remove")}
                </button>
              </div>

              <div className="cart-qty" role="group" aria-label={t("cart.line_qty")}>
                <button onClick={() => setQty(line.id, line.qty - 1)} aria-label="Decrease">−</button>
                <span className="n">{line.qty}</span>
                <button onClick={() => setQty(line.id, line.qty + 1)} aria-label="Increase">+</button>
              </div>

              <div className="cart-amount">
                <span className="rs">Rs</span>
                <span className="v">{formatPKR(line.unitPrice * line.qty, { withSymbol: false })}</span>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary v2">
          <div className="cs-badge" aria-hidden="true">
            <img src={CATEGORY_IMAGES.deals} alt="" loading="lazy" />
          </div>
          <h3>{ur ? "آرڈر کی خلاصہ" : "Order summary"}</h3>
          <p className="cs-tagline">{ur ? "کوئی چھپی ہوئی فیس نہیں۔" : "No hidden fees. Cash on delivery."}</p>

          <div className="summary-row">
            <span>{t("cart.subtotal")}</span>
            <span className="mono">{formatPKR(subtotal)}</span>
          </div>
          <div className="summary-row muted">
            <span>{t("cart.delivery_fee")}</span>
            <span>{ur ? "چیک آؤٹ پر" : "Set at checkout"}</span>
          </div>
          <div className="summary-row muted">
            <span>{ur ? "ٹیکس" : "Tax"}</span>
            <span>—</span>
          </div>
          <div className="summary-row total">
            <span>{t("cart.total")}</span>
            <span>{formatPKR(subtotal)}</span>
          </div>

          <Link href={`/${l}/checkout`} className="btn primary big block shine cart-checkout">
            <span>{t("cart.checkout")}</span><span className="arr" aria-hidden="true">→</span>
          </Link>

          <ul className="cs-perks">
            <li><span aria-hidden="true">🔥</span> {ur ? "30 منٹ میں گرم ڈلیوری" : "Hot in 30 min"}</li>
            <li><span aria-hidden="true">✓</span> {ur ? "کیش آن ڈلیوری" : "Pay on arrival"}</li>
            <li><span aria-hidden="true">★</span> {ur ? "4.8 گاہک ریٹنگ" : "4.8 avg rating"}</li>
          </ul>

          <Link href={`/${l}/menu`} className="cs-continue">
            ← {ur ? "مزید شامل کریں" : "Add more items"}
          </Link>
        </aside>
      </div>
    </div>
  );
}
