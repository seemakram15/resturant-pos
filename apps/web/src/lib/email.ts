import { formatPKR } from "./format";

// Brevo (Sendinblue) transactional API — https://developers.brevo.com/reference/sendtransacemail
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const brevoKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL ?? "orders@khalifafoods.com";
const fromName = process.env.BREVO_FROM_NAME ?? "Khalifa Foods";
const adminEmail = process.env.ORDERS_ADMIN_EMAIL ?? "seemakram15@gmail.com";

async function sendBrevo(payload: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!brevoKey) {
    console.log("[email] BREVO_API_KEY not set, would send:", { to: payload.to, subject: payload.subject });
    return { skipped: true as const };
  }
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: payload.to }],
      replyTo: payload.replyTo ? { email: payload.replyTo } : undefined,
      subject: payload.subject,
      htmlContent: payload.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`brevo ${res.status}: ${body}`);
  }
  return res.json() as Promise<{ messageId: string }>;
}

export type OrderConfirmationArgs = {
  to: string;
  name: string;
  phone?: string;
  billNo: number;
  total: number;
  channel: "pickup" | "delivery";
  address?: { street: string; area: string; landmark?: string } | null;
  pickupTime?: string | null;
  notes?: string | null;
  lines: Array<{ name: string; qty: number; amount: number }>;
  orderUrl: string;
};

/** Contact-form message to the admin inbox. */
export async function sendContactMessage(args: {
  name: string; email: string; phone?: string; subject: string; message: string;
}) {
  return sendBrevo({
    to: adminEmail,
    replyTo: args.email,
    subject: `✉ Contact form · ${args.subject}`,
    html: renderContactHtml(args),
  });
}

/** Sends BOTH the customer confirmation AND the admin notification via Brevo. */
export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  return Promise.allSettled([
    sendBrevo({
      to: args.to,
      subject: `Order confirmed · Bill #${args.billNo} · Khalifa Foods`,
      html: renderCustomerHtml(args),
    }),
    sendBrevo({
      to: adminEmail,
      replyTo: args.to,
      subject: `🔔 New ${args.channel} order · Bill #${args.billNo} · ${formatPKR(args.total)}`,
      html: renderAdminHtml(args),
    }),
  ]);
}

/* ────────────────────────────────────────────────────────────────
   Customer confirmation
   ──────────────────────────────────────────────────────────────── */
function renderCustomerHtml(a: OrderConfirmationArgs) {
  const rows = a.lines.map((l) => `
    <tr>
      <td style="padding:10px 0;color:#3A342D;font-size:14px;line-height:1.4">
        <span style="display:inline-block;min-width:26px;color:#C2410C;font-weight:600">${l.qty}×</span>
        ${escapeHtml(l.name)}
      </td>
      <td style="padding:10px 0;text-align:right;color:#141210;font-family:'SFMono-Regular','Consolas',monospace;font-size:14px;white-space:nowrap">
        ${formatPKR(l.amount)}
      </td>
    </tr>`).join("");

  const eta = a.channel === "delivery" ? "30–45 minutes" : "15–20 minutes";
  const heading = a.channel === "delivery" ? "We're firing up your order" : "We'll have it hot at pickup";

  return baseShell(`
    <tr>
      <td style="background:linear-gradient(135deg,#C2410C 0%,#E0450A 100%);color:#FFFEFB;padding:36px 32px">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;opacity:.9;font-family:'SFMono-Regular','Consolas',monospace">
          Khalifa Foods · Order confirmed
        </div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;margin-top:10px;font-weight:600;letter-spacing:-0.5px">
          ${heading}
        </div>
        <div style="margin-top:14px;font-size:14px;opacity:.92">
          Bill <strong style="font-family:'SFMono-Regular',monospace;font-weight:700">#${a.billNo}</strong>
          <span style="opacity:.6;margin:0 8px">·</span>
          ETA <strong>${eta}</strong>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px 8px">
        <p style="margin:0 0 14px;font-size:16px;color:#141210">Assalam-o-alaikum ${escapeHtml(a.name)},</p>
        <p style="margin:0 0 24px;color:#3A342D;font-size:14px;line-height:1.55">
          We've received your ${a.channel} order and started prepping it. Here's your receipt below —
          if anything looks off, reply to this email and we'll fix it right away.
        </p>

        <div style="background:#FBF5EA;border:1px solid #F0E4CE;border-radius:12px;padding:18px 20px;margin-bottom:24px">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8B6D2E;font-family:'SFMono-Regular',monospace;margin-bottom:6px">
            ${a.channel === "delivery" ? "Delivering to" : "Ready for pickup"}
          </div>
          <div style="font-size:14px;color:#141210;line-height:1.5">
            ${a.channel === "delivery" && a.address
              ? `${escapeHtml(a.address.street)}, ${escapeHtml(a.address.area)}${a.address.landmark ? ` · ${escapeHtml(a.address.landmark)}` : ""}`
              : `Khalifa Foods, 18-F Commercial PCHS, DHA Lahore`}
          </div>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4DBC9;border-bottom:1px solid #E4DBC9;margin-bottom:20px">
          ${rows}
          <tr>
            <td style="padding:16px 0 4px;font-family:Georgia,serif;font-weight:600;font-size:17px;color:#141210">Total</td>
            <td style="padding:16px 0 4px;text-align:right;font-weight:700;font-size:18px;font-family:Georgia,serif;color:#C2410C">
              ${formatPKR(a.total)}
            </td>
          </tr>
        </table>

        <p style="text-align:center;margin:24px 0 12px">
          <a href="${escapeAttr(a.orderUrl)}" style="background:#C2410C;color:#FFFEFB;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;font-size:15px;box-shadow:0 8px 20px -8px rgba(194,65,12,.5)">
            Track your order →
          </a>
        </p>

        <p style="margin:20px 0 4px;color:#6B6157;font-size:13px;text-align:center">
          Payment: <strong>cash on ${a.channel === "delivery" ? "delivery" : "pickup"}</strong>
        </p>
      </td>
    </tr>
  `);
}

/* ────────────────────────────────────────────────────────────────
   Admin notification (fires to seemakram15@gmail.com by default)
   ──────────────────────────────────────────────────────────────── */
function renderAdminHtml(a: OrderConfirmationArgs) {
  const rows = a.lines.map((l) => `
    <tr>
      <td style="padding:8px 0;color:#3A342D;font-size:14px">
        <span style="display:inline-block;min-width:26px;color:#C2410C;font-weight:600">${l.qty}×</span>
        ${escapeHtml(l.name)}
      </td>
      <td style="padding:8px 0;text-align:right;color:#141210;font-family:'SFMono-Regular',monospace;font-size:14px">
        ${formatPKR(l.amount)}
      </td>
    </tr>`).join("");

  const addr = a.channel === "delivery" && a.address
    ? `${escapeHtml(a.address.street)}, ${escapeHtml(a.address.area)}${a.address.landmark ? ` · <em>${escapeHtml(a.address.landmark)}</em>` : ""}`
    : a.channel === "pickup" ? `Pickup${a.pickupTime ? ` · ${escapeHtml(a.pickupTime)}` : " · ASAP"}` : "—";

  return baseShell(`
    <tr>
      <td style="background:#141210;color:#FFC59B;padding:28px 32px">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-family:'SFMono-Regular',monospace;opacity:.85">
          New order · action needed
        </div>
        <div style="font-family:Georgia,serif;font-size:28px;line-height:1.15;margin-top:8px;color:#FFFEFB;font-weight:600">
          Bill #${a.billNo} · ${formatPKR(a.total)}
        </div>
        <div style="margin-top:12px;font-size:13px;color:#FFC59B;font-family:'SFMono-Regular',monospace">
          ${a.channel.toUpperCase()} · ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
          <tr>
            <td style="width:33%;padding:12px;background:#FBF5EA;border-radius:10px;vertical-align:top">
              <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8B6D2E;font-family:'SFMono-Regular',monospace">Customer</div>
              <div style="margin-top:4px;color:#141210;font-size:14px;font-weight:600">${escapeHtml(a.name)}</div>
              ${a.phone ? `<div style="margin-top:2px;color:#3A342D;font-size:13px"><a href="tel:${escapeAttr(a.phone)}" style="color:#C2410C;text-decoration:none">${escapeHtml(a.phone)}</a></div>` : ""}
              <div style="margin-top:2px;color:#6B6157;font-size:12px">${escapeHtml(a.to)}</div>
            </td>
            <td style="width:8px"></td>
            <td style="width:66%;padding:12px;background:#FBF5EA;border-radius:10px;vertical-align:top">
              <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8B6D2E;font-family:'SFMono-Regular',monospace">
                ${a.channel === "delivery" ? "Delivery address" : "Pickup details"}
              </div>
              <div style="margin-top:4px;color:#141210;font-size:14px;line-height:1.5">${addr}</div>
            </td>
          </tr>
        </table>

        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6157;font-family:'SFMono-Regular',monospace;margin-bottom:6px">Order lines</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4DBC9;border-bottom:1px solid #E4DBC9">
          ${rows}
          <tr>
            <td style="padding:14px 0 4px;font-family:Georgia,serif;font-weight:600;font-size:16px;color:#141210">Total (${a.lines.length} line${a.lines.length === 1 ? "" : "s"})</td>
            <td style="padding:14px 0 4px;text-align:right;font-weight:700;font-size:17px;font-family:Georgia,serif;color:#C2410C">${formatPKR(a.total)}</td>
          </tr>
        </table>

        ${a.notes ? `
          <div style="margin-top:20px;padding:14px 16px;background:#FEF6E7;border-left:3px solid #E0A835;border-radius:6px">
            <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8B6D2E;font-family:'SFMono-Regular',monospace">Notes from customer</div>
            <div style="margin-top:4px;color:#141210;font-size:14px;line-height:1.5">${escapeHtml(a.notes)}</div>
          </div>` : ""}

        <p style="text-align:center;margin:24px 0 8px">
          <a href="${escapeAttr(a.orderUrl)}" style="background:#141210;color:#FFFEFB;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px">
            Open in admin →
          </a>
        </p>
      </td>
    </tr>
  `);
}

/* ────────────────────────────────────────────────────────────────
   Shared email shell
   ──────────────────────────────────────────────────────────────── */
function baseShell(inner: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F2E9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;color:#141210">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2E9;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFEFB;border:1px solid #E4DBC9;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px -12px rgba(20,18,16,.12)">
        ${inner}
        <tr>
          <td style="padding:22px 32px;background:#EFE7D6;color:#6B6157;font-size:12px;text-align:center;line-height:1.6">
            <strong style="color:#141210;font-family:Georgia,serif;font-size:15px;font-weight:600">Khalifa Foods</strong><br/>
            18-F Commercial, PCHS · New Gourmet Bakery · DHA Lahore<br/>
            <a href="tel:+923234748660" style="color:#C2410C;text-decoration:none;font-weight:600">0323-4748660</a>
            <span style="color:#B8AC98;margin:0 6px">·</span>
            <a href="mailto:orders@khalifafoods.com" style="color:#C2410C;text-decoration:none">orders@khalifafoods.com</a>
            <div style="margin-top:12px;font-family:Georgia,serif;color:#8B6D2E;direction:rtl;font-size:14px">شکریہ آپکا آنا</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderContactHtml(a: { name: string; email: string; phone?: string; subject: string; message: string }) {
  return baseShell(`
    <tr>
      <td style="background:#141210;color:#FFC59B;padding:28px 32px">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-family:'SFMono-Regular',monospace;opacity:.85">New contact message</div>
        <div style="font-family:Georgia,serif;font-size:26px;line-height:1.2;margin-top:8px;color:#FFFEFB;font-weight:600">${escapeHtml(a.subject)}</div>
        <div style="margin-top:12px;font-size:13px;color:#FFC59B;font-family:'SFMono-Regular',monospace">
          ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
          <tr>
            <td style="padding:12px;background:#FBF5EA;border-radius:10px">
              <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#8B6D2E;font-family:'SFMono-Regular',monospace">From</div>
              <div style="margin-top:4px;color:#141210;font-size:14px;font-weight:600">${escapeHtml(a.name)}</div>
              <div style="margin-top:2px;color:#3A342D;font-size:13px">
                <a href="mailto:${escapeAttr(a.email)}" style="color:#C2410C;text-decoration:none">${escapeHtml(a.email)}</a>
                ${a.phone ? ` · <a href="tel:${escapeAttr(a.phone)}" style="color:#C2410C;text-decoration:none">${escapeHtml(a.phone)}</a>` : ""}
              </div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6B6157;font-family:'SFMono-Regular',monospace;margin-bottom:6px">Message</div>
        <div style="padding:16px 18px;background:#FFFEFB;border:1px solid #E4DBC9;border-radius:10px;color:#141210;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(a.message)}</div>
        <p style="text-align:center;margin:20px 0 4px">
          <a href="mailto:${escapeAttr(a.email)}?subject=${encodeURIComponent("Re: " + a.subject)}" style="background:#C2410C;color:#FFFEFB;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px">
            Reply to ${escapeHtml(a.name)} →
          </a>
        </p>
      </td>
    </tr>
  `);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]!));
}
function escapeAttr(s: string) { return escapeHtml(s); }
