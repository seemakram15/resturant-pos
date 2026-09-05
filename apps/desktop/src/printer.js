// Thermal printer output — plain-text version until owner supplies the printer
// model, then swap in node-thermal-printer with proper ESC/POS + Nastaliq
// bitmap.

function line(char = "-", n = 32) { return char.repeat(n); }
function center(s, n = 32) { const p = Math.max(0, Math.floor((n - s.length) / 2)); return " ".repeat(p) + s; }
function padRight(l, r, n = 32) { return l + " ".repeat(Math.max(1, n - l.length - r.length)) + r; }

function formatReceipt(o) {
  const rows = [];
  rows.push(center("KHALIFA FOODS"));
  rows.push(center("Healthy Ingredients · Healthy Life"));
  rows.push(center("18-F Commercial, PCHS · DHA Lahore"));
  rows.push(center("0323-4748660"));
  rows.push(line("="));
  rows.push(padRight(`${(o.channel || "").toUpperCase()}${o.table ? " · " + o.table : ""}`, `Bill ${o.billNo}`));
  rows.push(padRight(`Cashier: ${o.cashier ?? "-"}`, new Date().toLocaleString()));
  rows.push(line("-"));
  rows.push(padRight("ITEM", "QTY  AMT"));
  rows.push(line("-"));
  for (const l of o.lines ?? []) {
    rows.push(padRight(l.name.slice(0, 22), `${l.qty.toString().padStart(2)} ${Math.round(l.unit_price * l.qty).toString().padStart(5)}`));
    if (l.modifiers) for (const m of l.modifiers) rows.push(`  + ${m}`);
  }
  rows.push(line("-"));
  rows.push(padRight("Subtotal", `Rs ${Math.round(o.subtotal ?? 0)}`));
  if (o.discount) rows.push(padRight("Discount", `- ${Math.round(o.discount)}`));
  rows.push(padRight(`Tax (${((o.tax_rate_bps ?? 0) / 100).toFixed(0)}%)`, `${Math.round(o.tax ?? 0)}`));
  rows.push(line("="));
  rows.push(padRight("TOTAL", `Rs ${Math.round(o.total ?? 0)}`));
  rows.push(line("="));
  if (o.tendered != null) rows.push(padRight("Cash", `${Math.round(o.tendered)}`));
  if (o.change != null)   rows.push(padRight("Change", `${Math.round(o.change)}`));
  rows.push("");
  rows.push(center("Thank you — come again"));
  rows.push(center("شکریہ آپکا آنا"));
  rows.push("");
  return rows.join("\n");
}

async function printReceipt(payload) {
  const output = formatReceipt(payload);
  // Placeholder — in production this streams to node-thermal-printer.
  // For now, log the receipt so it's testable end-to-end from the UI.
  console.log("\n[receipt]\n" + output + "\n");
  return { ok: true, preview: output };
}

module.exports = { printReceipt, formatReceipt };
