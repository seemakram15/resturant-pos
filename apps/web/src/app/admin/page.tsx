import { serverClient, TENANT_ID } from "@/lib/supabase";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const sb = await serverClient();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [{ count: todayCount = 0 }, { data: sales }, { count: pending = 0 }, { count: lowStock = 0 }] = await Promise.all([
      sb.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).gte("created_at", today.toISOString()),
      sb.from("orders").select("total").eq("tenant_id", TENANT_ID).gte("created_at", today.toISOString()),
      sb.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).in("status", ["received", "preparing"]),
      sb.from("stock_ledger").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).lt("delta", 0),
    ]);
    const revenue = (sales ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0);
    return { todayCount: todayCount ?? 0, revenue, pending: pending ?? 0, lowStock: lowStock ?? 0 };
  } catch {
    return { todayCount: 0, revenue: 0, pending: 0, lowStock: 0, demo: true } as const;
  }
}

export default async function AdminDashboard() {
  const s = await loadStats();
  return (
    <>
      <div className="admin-head">
        <h1>Dashboard</h1>
        <div className="eyebrow">Today · {new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="lbl">Orders today</div>
          <div className="val">{s.todayCount}</div>
        </div>
        <div className="stat">
          <div className="lbl">Revenue today</div>
          <div className="val">{formatPKR(s.revenue)}</div>
        </div>
        <div className="stat">
          <div className="lbl">Pending</div>
          <div className="val">{s.pending}</div>
        </div>
        <div className="stat">
          <div className="lbl">Low-stock alerts</div>
          <div className="val">{s.lowStock}</div>
        </div>
      </div>

      {"demo" in s && s.demo && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="eyebrow" style={{ color: "var(--warn)" }}>Demo mode</div>
          <p style={{ margin: ".5rem 0 0", color: "var(--ink-3)" }}>
            Supabase not connected. Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
            and <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>, then run <code>supabase db reset</code>.
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "0 0 1rem" }}>Quick actions</h3>
        <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
          <a className="btn" href="/admin/orders">View orders</a>
          <a className="btn ghost" href="/admin/menu">Edit menu</a>
          <a className="btn ghost" href="/admin/stock">Stock take</a>
          <a className="btn ghost" href="/admin/reports">Today's Z-report</a>
        </div>
      </div>
    </>
  );
}
