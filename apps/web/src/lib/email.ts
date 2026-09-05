import { Resend } from "resend";
import { formatPKR } from "./format";

const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL
  ? `${process.env.RESEND_FROM_NAME ?? "Khalifa Foods"} <${process.env.RESEND_FROM_EMAIL}>`
  : null;

const resend = key ? new Resend(key) : null;

export type OrderConfirmationArgs = {
  to: string;
  name: string;
  billNo: number;
  total: number;
  channel: "pickup" | "delivery";
  lines: Array<{ name: string; qty: number; amount: number }>;
  orderUrl: string;
};

export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  if (!resend || !from) {
    console.log("[email] Resend not configured, would send:", args);
    return { skipped: true };
  }
  return resend.emails.send({
    from,
    to: args.to,
    subject: `Order confirmed · Bill #${args.billNo} · Khalifa Foods`,
    html: renderOrderConfirmationHtml(args),
  });
}

function renderOrderConfirmationHtml(a: OrderConfirmationArgs) {
  const rows = a.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 0;color:#3A342D">${l.qty} × ${escapeHtml(l.name)}</td>
        <td style="padding:8px 0;text-align:right;color:#141210;font-family:'Courier New',monospace">${formatPKR(l.amount)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F2E9;font-family:'Helvetica Neue',Arial,sans-serif;color:#141210">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2E9;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFEFB;border:1px solid #E4DBC9;border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:#C2410C;color:#FFFEFB;padding:28px 32px">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85">Khalifa Foods · Healthy Ingredients Healthy Life</div>
            <div style="font-family:Georgia,serif;font-size:26px;margin-top:6px">Order received — Bill #${a.billNo}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <p style="margin:0 0 12px">Assalam-o-alaikum ${escapeHtml(a.name)},</p>
            <p style="margin:0 0 20px;color:#3A342D">
              We've received your ${a.channel} order. We'll ${a.channel === "delivery" ? "have it at your address" : "have it ready for pickup"} soon.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4DBC9;border-bottom:1px solid #E4DBC9;margin:16px 0">
              ${rows}
              <tr>
                <td style="padding:12px 0;font-weight:600;font-size:16px">Total</td>
                <td style="padding:12px 0;text-align:right;font-weight:600;font-size:16px;font-family:'Courier New',monospace">${formatPKR(a.total)}</td>
              </tr>
            </table>

            <p style="text-align:center;margin:28px 0 16px">
              <a href="${a.orderUrl}" style="background:#C2410C;color:#FFFEFB;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                Track your order →
              </a>
            </p>

            <p style="margin:20px 0 0;color:#6B6157;font-size:13px">
              Payment: cash on ${a.channel === "delivery" ? "delivery" : "pickup"} · Rs ${formatPKR(a.total, { withSymbol: false })}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#EFE7D6;color:#6B6157;font-size:12px;text-align:center">
            18-F Commercial, PCHS, New Gourmet Bakery, DHA Lahore · <a href="tel:+923234748660" style="color:#C2410C">0323-4748660</a><br/>
            <span style="font-family:serif;direction:rtl">شکریہ آپکا آنا</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]!));
}
