export default function SettingsPage() {
  return (
    <>
      <div className="admin-head"><h1>Settings</h1></div>
      <div className="card">
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "0 0 1rem" }}>Branch</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: ".5rem 1.5rem", fontSize: ".9rem" }}>
          <span className="eyebrow">Name</span><span>Khalifa Foods · DHA Lahore</span>
          <span className="eyebrow">Address</span><span>18-F Commercial, PCHS, New Gourmet Bakery, DHA Lahore</span>
          <span className="eyebrow">Phone</span><span className="mono">0323-4748660</span>
          <span className="eyebrow">Currency</span><span>PKR</span>
          <span className="eyebrow">Tax rate</span><span>0 %</span>
          <span className="eyebrow">Timezone</span><span>Asia/Karachi</span>
        </div>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, margin: "0 0 1rem" }}>Printer</h3>
        <p style={{ color: "var(--ink-3)" }}>Configure once the exact model is confirmed by owner.</p>
      </div>
    </>
  );
}
