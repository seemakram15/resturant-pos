import Link from "next/link";
import { makeT, type Locale } from "@/lib/i18n";
import { serverClient, TENANT_ID } from "@/lib/supabase";
import { formatPKR, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ bill?: string }>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: SearchParams;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  const l = locale as Locale;
  const t = makeT(l);

  type OrderRow = {
    id: string;
    bill_no: number;
    channel: string;
    status: string;
    total: number;
    customer_name: string | null;
    customer_email: string | null;
    created_at: string;
  };
  let order: OrderRow | null = null;

  try {
    const sb = await serverClient();
    const { data } = await sb
      .from("orders")
      .select("id, bill_no, channel, status, total, customer_name, customer_email, created_at")
      .eq("tenant_id", TENANT_ID)
      .eq("id", id)
      .maybeSingle();
    if (data) order = data as unknown as OrderRow;
  } catch {}

  const isDemo = id.startsWith("demo-");
  const billNo = order?.bill_no ?? Number(sp.bill ?? 13831);
  const statusKey = order?.status ?? "received";

  return (
    <div className="container section">
      <div className="success card" style={{ maxWidth: "42rem", margin: "0 auto" }}>
        <div className="icon">✓</div>
        <h1>{t("checkout.success_title")}</h1>
        <p style={{ color: "var(--ink-3)", maxWidth: "28rem", margin: "0 auto" }}>
          {t("checkout.success_body")}
        </p>
        <div className="bill">Bill #{billNo}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(10rem,1fr))", gap: "1rem", margin: "1rem 0 2rem", textAlign: "left" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: ".25rem" }}>{l === "ur" ? "حالت" : "Status"}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem" }}>{t(`order.status.${statusKey}`)}</div>
          </div>
          {order && (
            <>
              <div>
                <div className="eyebrow" style={{ marginBottom: ".25rem" }}>{l === "ur" ? "کل" : "Total"}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem" }}>{formatPKR(order.total)}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: ".25rem" }}>{l === "ur" ? "قسم" : "Type"}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.1rem" }}>{order.channel}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: ".25rem" }}>{l === "ur" ? "وقت" : "Time"}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.05rem" }}>{formatDateTime(order.created_at)}</div>
              </div>
            </>
          )}
        </div>

        {isDemo && (
          <div className="pill warn" style={{ margin: "0 auto 1rem" }}>DEMO — connect Supabase to persist</div>
        )}

        <Link href={`/${l}`} className="btn ghost">{t("common.back")} →</Link>
      </div>
    </div>
  );
}
