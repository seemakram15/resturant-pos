import { serverClient, TENANT_ID, BRANCH_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadTables() {
  try {
    const sb = await serverClient();
    const { data } = await sb
      .from("dining_tables")
      .select("id, label, seats, status, x_pos, y_pos")
      .eq("tenant_id", TENANT_ID)
      .eq("branch_id", BRANCH_ID)
      .order("label");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function TablesPage() {
  const tables = await loadTables();
  return (
    <>
      <div className="admin-head">
        <h1>Tables</h1>
        <button className="btn">Add table</button>
      </div>
      {tables.length === 0 ? (
        <div className="card empty">
          <div className="icon">🪑</div>
          <p style={{ color: "var(--ink-3)" }}>Seed the database to populate 10 default tables (T-01 to T-10).</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))", gap: "1rem" }}>
          {tables.map((t) => (
            <div key={t.id} className="card" style={{ textAlign: "center", padding: "1.25rem 1rem" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 500 }}>{t.label}</div>
              <div style={{ fontSize: ".82rem", color: "var(--ink-3)", margin: ".25rem 0 .5rem" }}>Seats {t.seats}</div>
              <span className={`badge ${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
