import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; phone?: string; subject?: string; message?: string; hp?: string };
  try { body = await req.json(); }
  catch { return new NextResponse("invalid json", { status: 400 }); }

  // Honeypot — bots fill it, humans don't see it.
  if (body.hp) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim() || "New message";
  const message = (body.message ?? "").trim();

  if (!name) return new NextResponse("name required", { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new NextResponse("bad email", { status: 400 });
  if (message.length < 10) return new NextResponse("message too short", { status: 400 });
  if (message.length > 4000) return new NextResponse("message too long", { status: 400 });

  try {
    await sendContactMessage({ name, email, phone: phone || undefined, subject, message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact email failed", e);
    return new NextResponse("email failed", { status: 502 });
  }
}
