import { serverClient, TENANT_ID } from "@/lib/supabase";
import { formatPKR, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

async function loadOrders() {
  try {
    const sb = await serverClient();
    const { data } = await sb
      .from("orders")
      .select("id, bill_no, channel, status, customer_name, customer_phone, total, created_at")
      .eq("tenant_id", TENANT_ID)
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function OrdersPage() {
  const rows = await loadOrders();
  return (
    <>
      <div className="admin-head">
        <h1>Orders</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn ghost">Filter</button>
          <button className="btn">Export CSV</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card empty">
          <div className="icon">📋</div>
          <p style={{ color: "var(--ink-3)" }}>
            No orders yet. Once customers place orders they'll appear here in real time.
          </p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Bill</th><th>Channel</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="mono">#{o.bill_no}</td>
                <td>{o.channel}</td>
                <td>{o.customer_name ?? "—"}</td>
                <td className="mono">{o.customer_phone ?? "—"}</td>
                <td>{formatPKR(Number(o.total))}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td className="mono" style={{ color: "var(--ink-3)", fontSize: ".82rem" }}>{formatDateTime(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
