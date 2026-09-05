"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n";
import { use } from "react";

export default function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const l = locale as Locale;
  const t = makeT(l);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (lines.length === 0) {
    return (
      <div className="container section">
        <div className="empty card">
          <div className="icon">🛒</div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>{t("cart.empty")}</h2>
          <Link href={`/${l}/menu`} className="btn big" style={{ marginTop: "1rem" }}>
            {t("cart.empty_cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head">
        <h2>{t("cart.title")}</h2>
      </div>

      <div className="cart-grid">
        <div className="cart-lines">
          {lines.map((line) => (
            <div key={line.id} className="cart-line">
              <div className="info">
                <div className="name">{l === "ur" && line.name_ur ? line.name_ur : line.name_en}</div>
                <div className="unit">{formatPKR(line.unitPrice)} × {line.qty}</div>
              </div>
              <div className="qty-input" role="group" aria-label={t("cart.line_qty")}>
                <button onClick={() => setQty(line.id, line.qty - 1)} aria-label="Decrease">−</button>
                <span className="num">{line.qty}</span>
                <button onClick={() => setQty(line.id, line.qty + 1)} aria-label="Increase">+</button>
              </div>
              <div className="amount">{formatPKR(line.unitPrice * line.qty)}</div>
              <button
                onClick={() => remove(line.id)}
                style={{ background: "transparent", border: "none", color: "var(--ink-3)", fontSize: ".82rem", textDecoration: "underline", padding: 0, gridColumn: "1 / -1", justifySelf: "start" }}
              >
                {t("cart.remove")}
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>{t("cart.title")}</h3>
          <div className="summary-row">
            <span>{t("cart.subtotal")}</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="summary-row" style={{ fontSize: ".85rem", color: "var(--ink-3)" }}>
            <span>{t("cart.delivery_fee")}</span>
            <span>{l === "ur" ? "چیک آؤٹ پر" : "Set at checkout"}</span>
          </div>
          <div className="summary-row total">
            <span>{t("cart.total")}</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <Link href={`/${l}/checkout`} className="btn block big" style={{ marginTop: "1rem" }}>
            {t("cart.checkout")} →
          </Link>
        </aside>
      </div>
    </div>
  );
}
