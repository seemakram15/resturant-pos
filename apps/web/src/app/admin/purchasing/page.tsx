export default function PurchasingPage() {
  return (
    <>
      <div className="admin-head">
        <h1>Purchasing</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn ghost">Suppliers</button>
          <button className="btn">New PO</button>
        </div>
      </div>
      <div className="card empty">
        <div className="icon">🧾</div>
        <p style={{ color: "var(--ink-3)" }}>
          Track supplier orders, goods received notes and invoices. Schema is in place; UI lands next iteration.
        </p>
      </div>
    </>
  );
}
