export default function StockPage() {
  return (
    <>
      <div className="admin-head">
        <h1>Stock</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn ghost">Stock take</button>
          <button className="btn">Add ingredient</button>
        </div>
      </div>
      <div className="card empty">
        <div className="icon">📦</div>
        <p style={{ color: "var(--ink-3)" }}>
          Add ingredients and recipes, and every sale of a menu item will deduct the raw stock automatically. Coming next iteration.
        </p>
      </div>
    </>
  );
}
