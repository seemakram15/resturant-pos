import { serverClient, TENANT_ID } from "@/lib/supabase";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadTopItems() {
  try {
    const sb = await serverClient();
    const { data } = await sb
      .from("order_lines")
      .select("name_snapshot, qty, line_total, orders!inner(tenant_id, created_at)")
      .eq("orders.tenant_id", TENANT_ID)
      .gte("orders.created_at", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString());
    const map = new Map<string, { qty: number; revenue: number }>();
    for (const r of data ?? []) {
      const k = r.name_snapshot;
      const prev = map.get(k) ?? { qty: 0, revenue: 0 };
      map.set(k, {
        qty: prev.qty + Number(r.qty ?? 0),
        revenue: prev.revenue + Number(r.line_total ?? 0),
      });
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export default async function ReportsPage() {
  const top = await loadTopItems();
  return (
    <>
      <div className="admin-head">
        <h1>Reports</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn ghost">30 days</button>
          <button className="btn">Export</button>
        </div>
      </div>
      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>Top items · last 30 days</h3>
      {top.length === 0 ? (
        <div className="card empty">
          <div className="icon">📊</div>
          <p style={{ color: "var(--ink-3)" }}>Not enough data yet — place a few orders to see the numbers.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Item</th><th>Qty sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {top.map((r) => (
              <tr key={r.name}>
                <td style={{ fontFamily: "var(--serif)" }}>{r.name}</td>
                <td className="mono">{r.qty}</td>
                <td className="mono">{formatPKR(r.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
