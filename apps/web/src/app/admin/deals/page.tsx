import { getAllCombos } from "@/lib/menu-queries";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const combos = await getAllCombos();
  const groups: Record<string, typeof combos> = {};
  for (const c of combos) (groups[c.category] ??= []).push(c);

  return (
    <>
      <div className="admin-head">
        <h1>Deals</h1>
        <button className="btn">New deal</button>
      </div>
      {Object.entries(groups).map(([cat, list]) => (
        <div key={cat} style={{ marginBottom: "2rem" }}>
          <div className="eyebrow" style={{ marginBottom: ".5rem" }}>{cat} · {list.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "1rem" }}>
            {list.map((c) => (
              <div key={c.slug} className="card">
                <div style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "1.1rem" }}>{c.name_en}</div>
                {c.name_ur && <div style={{ fontFamily: "var(--urdu)", direction: "rtl", color: "var(--ink-3)", fontSize: ".85rem" }}>{c.name_ur}</div>}
                <p style={{ color: "var(--ink-3)", fontSize: ".82rem", margin: ".5rem 0" }}>{c.description_en}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.25rem" }}>{formatPKR(c.price)}</span>
                  <span className="badge">{c.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
