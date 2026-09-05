"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n";

type Method = "pickup" | "delivery";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const l = locale as Locale;
  const t = makeT(l);
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [method, setMethod] = useState<Method>("delivery");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      channel: method,
      customer_name: String(form.get("name") ?? ""),
      customer_phone: String(form.get("phone") ?? ""),
      customer_email: String(form.get("email") ?? ""),
      pickup_time: method === "pickup" ? String(form.get("pickup_time") ?? "") : null,
      delivery_address: method === "delivery"
        ? {
            street: String(form.get("street") ?? ""),
            area: String(form.get("area") ?? ""),
            landmark: String(form.get("landmark") ?? ""),
          }
        : null,
      notes: String(form.get("notes") ?? ""),
      lines: lines.map((l) => ({
        kind: l.kind,
        refId: l.refId,
        name: l.name_en,
        qty: l.qty,
        unit_price: l.unitPrice,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const { orderId, billNo } = await res.json();
      clear();
      router.push(`/${l}/order/${orderId}?bill=${billNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container section">
        <div className="empty card">
          <p>{t("cart.empty")}</p>
          <Link href={`/${l}/menu`} className="btn big">{t("cart.empty_cta")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head">
        <h2>{t("checkout.title")}</h2>
        <p>{t("checkout.subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="checkout-grid">
        <div>
          <div className="card">
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "0 0 .5rem" }}>
              {l === "ur" ? "کیسے چاہیں؟" : "How would you like it?"}
            </h3>
            <div className="method-picker">
              <button type="button" className={`method-card ${method === "pickup" ? "active" : ""}`} onClick={() => setMethod("pickup")}>
                <h4>{t("checkout.method.pickup")}</h4>
                <p className="method-desc">{t("checkout.method.pickup_desc")}</p>
              </button>
              <button type="button" className={`method-card ${method === "delivery" ? "active" : ""}`} onClick={() => setMethod("delivery")}>
                <h4>{t("checkout.method.delivery")}</h4>
                <p className="method-desc">{t("checkout.method.delivery_desc")}</p>
              </button>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="name">{t("checkout.field.name")}</label>
                <input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="phone">{t("checkout.field.phone")}</label>
                <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="03XX-XXXXXXX" />
              </div>
              <div className="field field-full">
                <label htmlFor="email">{t("checkout.field.email")}</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
            </div>

            {method === "pickup" ? (
              <div className="field field-full">
                <label htmlFor="pickup_time">{t("checkout.field.pickup_time")}</label>
                <select id="pickup_time" name="pickup_time" defaultValue="asap">
                  <option value="asap">{t("checkout.field.pickup_asap")}</option>
                  <option value="15">In 15 minutes</option>
                  <option value="30">In 30 minutes</option>
                  <option value="60">In 1 hour</option>
                </select>
              </div>
            ) : (
              <>
                <div className="field field-full">
                  <label htmlFor="street">{t("checkout.field.street")}</label>
                  <input id="street" name="street" required autoComplete="street-address" />
                </div>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="area">{t("checkout.field.area")}</label>
                    <input id="area" name="area" required placeholder="e.g. DHA Phase 5" />
                  </div>
                  <div className="field">
                    <label htmlFor="landmark">{t("checkout.field.landmark")}</label>
                    <input id="landmark" name="landmark" placeholder={l === "ur" ? "قریبی نشانی" : "Nearest landmark"} />
                  </div>
                </div>
              </>
            )}

            <div className="field field-full">
              <label htmlFor="notes">{t("checkout.field.notes")}</label>
              <textarea id="notes" name="notes" placeholder={l === "ur" ? "پہنچنے سے پہلے کال کریں…" : "e.g. call before entering"} />
            </div>

            {error && (
              <div style={{ background: "var(--accent-wash)", color: "var(--stop)", padding: ".75rem 1rem", borderRadius: "var(--radius-md)", marginTop: "1rem", fontSize: ".9rem" }}>
                {error}
              </div>
            )}
          </div>
        </div>

        <aside className="cart-summary">
          <h3>{l === "ur" ? "آرڈر کی تفصیل" : "Order summary"}</h3>
          {lines.map((line) => (
            <div key={line.id} className="summary-row" style={{ fontSize: ".9rem" }}>
              <span>
                {line.qty} × {l === "ur" && line.name_ur ? line.name_ur : line.name_en}
              </span>
              <span className="mono">{formatPKR(line.unitPrice * line.qty)}</span>
            </div>
          ))}
          <div className="summary-row" style={{ fontSize: ".85rem", color: "var(--ink-3)", marginTop: ".5rem" }}>
            <span>{t("cart.tax")}</span>
            <span>{formatPKR(0)}</span>
          </div>
          <div className="summary-row total">
            <span>{t("cart.total")}</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <button type="submit" className="btn block big" style={{ marginTop: "1rem" }} disabled={busy}>
            {busy ? t("checkout.placing") : t("checkout.place_order")}
          </button>
          <p style={{ fontSize: ".78rem", color: "var(--ink-3)", marginTop: ".75rem", textAlign: "center" }}>
            {l === "ur" ? "کیش آن ڈلیوری / پک اپ پر ادائیگی" : "Payment: cash on delivery / at pickup"}
          </p>
        </aside>
      </form>
    </div>
  );
}
