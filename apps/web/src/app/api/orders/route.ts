import { NextResponse } from "next/server";
import { serviceClient, TENANT_ID, BRANCH_ID } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

type Payload = {
  channel: "pickup" | "delivery";
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_time: string | null;
  delivery_address: { street: string; area: string; landmark?: string } | null;
  notes?: string;
  lines: Array<{
    kind: "item" | "combo";
    refId: string;
    name: string;
    qty: number;
    unit_price: number;
  }>;
};

function bad(msg: string, status = 400) {
  return new NextResponse(msg, { status });
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return bad("invalid json");
  }

  // Basic validation
  if (!body.channel || !["pickup", "delivery"].includes(body.channel)) return bad("bad channel");
  if (!body.customer_name?.trim()) return bad("name required");
  if (!/^0?\d{10,11}$|^\+?\d{10,15}$/.test(body.customer_phone.replace(/[\s-]/g, ""))) return bad("bad phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) return bad("bad email");
  if (!Array.isArray(body.lines) || body.lines.length === 0) return bad("cart empty");
  if (body.channel === "delivery" && (!body.delivery_address?.street || !body.delivery_address.area))
    return bad("delivery address required");

  const subtotal = body.lines.reduce(
    (sum, l) => sum + Math.max(0, Math.round(l.unit_price)) * Math.max(1, Math.floor(l.qty)),
    0
  );
  if (subtotal <= 0) return bad("bad total");

  // If Supabase isn't configured yet, still return a mock success so the UI works
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      orderId: `demo-${Date.now()}`,
      billNo: 13831,
      demo: true,
    });
  }

  const sb = serviceClient();

  // Bill number from sequence
  const { data: billNoData, error: billErr } = await sb.rpc("next_bill_no", {
    p_tenant: TENANT_ID,
    p_branch: BRANCH_ID,
  });
  if (billErr) return bad(`bill: ${billErr.message}`, 500);
  const billNo = billNoData as number;

  // Optional: upsert customer
  const { data: cust } = await sb
    .from("customers")
    .upsert(
      {
        tenant_id: TENANT_ID,
        name: body.customer_name,
        phone: body.customer_phone,
        email: body.customer_email,
        addresses:
          body.delivery_address
            ? [body.delivery_address]
            : [],
      },
      { onConflict: "tenant_id,phone" }
    )
    .select("id")
    .single();

  const { data: order, error: orderErr } = await sb
    .from("orders")
    .insert({
      tenant_id: TENANT_ID,
      branch_id: BRANCH_ID,
      bill_no: billNo,
      channel: body.channel,
      status: "received",
      customer_id: cust?.id,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      delivery_address: body.delivery_address,
      pickup_time: body.pickup_time && body.pickup_time !== "asap" ? new Date(Date.now() + Number(body.pickup_time) * 60_000).toISOString() : null,
      subtotal,
      tax: 0,
      discount: 0,
      total: subtotal,
      notes: body.notes ?? null,
    })
    .select("id")
    .single();

  if (orderErr || !order) return bad(`order: ${orderErr?.message}`, 500);

  // Line items — resolve refIds against items/combos
  const lineRows = await Promise.all(
    body.lines.map(async (line) => {
      let item_id: string | null = null;
      let combo_id: string | null = null;
      if (line.kind === "combo") {
        const { data } = await sb.from("combos").select("id").eq("slug", line.refId).maybeSingle();
        combo_id = data?.id ?? null;
      } else {
        item_id = line.refId; // client sends UUID for items
      }
      return {
        order_id: order.id,
        item_id,
        combo_id,
        name_snapshot: line.name,
        qty: line.qty,
        unit_price: line.unit_price,
        line_total: line.unit_price * line.qty,
      };
    })
  );

  const { error: linesErr } = await sb.from("order_lines").insert(lineRows);
  if (linesErr) return bad(`lines: ${linesErr.message}`, 500);

  // Fire-and-forget confirmation email
  sendOrderConfirmationEmail({
    to: body.customer_email,
    name: body.customer_name,
    billNo,
    total: subtotal,
    channel: body.channel,
    lines: body.lines.map((l) => ({ name: l.name, qty: l.qty, amount: l.unit_price * l.qty })),
    orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/en/order/${order.id}`,
  }).catch((e) => console.error("email failed", e));

  return NextResponse.json({ orderId: order.id, billNo });
}
