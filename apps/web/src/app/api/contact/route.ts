import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

// Strip C0 controls (including CR/LF that could inject email headers).
const CTRL_RE = /[\x00-\x1F\x7F]/g;
// Same but keep \n and \t so multi-line message bodies survive.
const CTRL_KEEP_NL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function asString(v: unknown): string {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(CTRL_RE, "").trim();
}

function asMessage(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n?/g, "\n").replace(CTRL_KEEP_NL_RE, "").trim();
}

export async function POST(req: Request) {
  let raw: unknown;
  try { raw = await req.json(); }
  catch { return new NextResponse("invalid json", { status: 400 }); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return new NextResponse("bad payload", { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  // Honeypot — only trigger on a real non-empty string so type-confused
  // payloads (arrays/objects/numbers) don't silently short-circuit.
  if (typeof body.hp === "string" && body.hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name);
  const email = asString(body.email).toLowerCase();
  const phone = asString(body.phone);
  const subject = asString(body.subject) || "New message";
  const message = asMessage(body.message);

  if (!name) return new NextResponse("name required", { status: 400 });
  if (name.length > 120) return new NextResponse("name too long", { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return new NextResponse("bad email", { status: 400 });
  if (email.length > 254) return new NextResponse("email too long", { status: 400 });
  if (phone && phone.length > 30) return new NextResponse("bad phone", { status: 400 });
  if (subject.length > 200) return new NextResponse("subject too long", { status: 400 });
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
