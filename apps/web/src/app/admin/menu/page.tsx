import { getAllCombos, getItemsByCategory } from "@/lib/menu-queries";
import { formatPKR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminMenu() {
  const [combos, itemsByCat] = await Promise.all([
    getAllCombos(),
    getItemsByCategory(),
  ]);

  const totalItems = Object.values(itemsByCat).flat().length;

  return (
    <>
      <div className="admin-head">
        <h1>Menu</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn ghost">Add item</button>
          <button className="btn">Add deal</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat"><div className="lbl">Deals</div><div className="val">{combos.length}</div></div>
        <div className="stat"><div className="lbl">À la carte items</div><div className="val">{totalItems}</div></div>
        <div className="stat"><div className="lbl">Categories</div><div className="val">{Object.keys(itemsByCat).length}</div></div>
      </div>

      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "2rem 0 1rem" }}>Deals</h3>
      <table className="admin-table">
        <thead><tr><th>Deal</th><th>Category</th><th>Contents</th><th>Price</th></tr></thead>
        <tbody>
          {combos.map((c) => (
            <tr key={c.slug}>
              <td style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>{c.name_en}</td>
              <td className="mono">{c.category}</td>
              <td style={{ color: "var(--ink-3)", fontSize: ".85rem" }}>{c.description_en}</td>
              <td className="mono">{formatPKR(c.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "2rem 0 1rem" }}>À la carte items</h3>
      {Object.entries(itemsByCat).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: "1.5rem" }}>
          <div className="eyebrow" style={{ marginBottom: ".5rem" }}>{cat}</div>
          <table className="admin-table">
            <thead><tr><th>Item</th><th>SKU</th><th>Price</th><th>Tags</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontFamily: "var(--serif)" }}>{i.name_en}</td>
                  <td className="mono">{i.sku ?? "—"}</td>
                  <td className="mono">{formatPKR(i.base_price)}</td>
                  <td style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>{i.tags?.join(", ") ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
