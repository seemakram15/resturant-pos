"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Status = "idle" | "sending" | "ok" | "err";

const SUBJECTS_EN = ["General question", "Order issue", "Catering / bulk order", "Feedback", "Partnership"];
const SUBJECTS_UR = ["عام سوال", "آرڈر کا مسئلہ", "کیٹرنگ / بلک آرڈر", "فیڈ بیک", "پارٹنرشپ"];

export function ContactForm({ locale }: { locale: Locale }) {
  const ur = locale === "ur";
  const [status, setStatus] = useState<Status>("idle");
  const [errText, setErrText] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending"); setErrText(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      hp: String(fd.get("company") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("ok");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("err");
      setErrText(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const subjects = ur ? SUBJECTS_UR : SUBJECTS_EN;

  return (
    <form onSubmit={onSubmit} className="contact-form" noValidate={false}>
      {/* Honeypot — hidden from users, catches bots */}
      <label className="hp" aria-hidden="true">
        <span>Company</span>
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>{ur ? "پورا نام" : "Full name"}</span>
          <input name="name" type="text" autoComplete="name" required placeholder={ur ? "مثلاً وسیم اکرم" : "e.g. Waseem Akram"} />
        </label>
        <label className="field">
          <span>{ur ? "ای میل" : "Email"}</span>
          <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>{ur ? "فون (اختیاری)" : "Phone (optional)"}</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="0323-1234567" />
        </label>
        <label className="field">
          <span>{ur ? "موضوع" : "Subject"}</span>
          <select name="subject" defaultValue={subjects[0]} required>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>{ur ? "پیغام" : "Message"}</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder={ur ? "ہمیں بتائیں کیسے مدد کریں…" : "Tell us how we can help…"}
        />
      </label>

      <div className="contact-actions">
        <button type="submit" className="btn primary big" disabled={status === "sending"}>
          {status === "sending" ? (ur ? "بھیج رہا ہے…" : "Sending…") : (ur ? "پیغام بھیجیں" : "Send message")} →
        </button>
        <span className="contact-privacy">
          {ur ? "آپ کا ای میل نجی ہے۔" : "We reply within a day. Your email stays private."}
        </span>
      </div>

      {status === "ok" && (
        <div className="auth-note ok">
          {ur ? "شکریہ! پیغام موصول ہو گیا۔ ہم جلد جواب دیں گے۔" : "Thanks — your message reached us. We'll reply shortly."}
        </div>
      )}
      {status === "err" && (
        <div className="auth-note err">
          {ur ? "پیغام نہیں گیا: " : "Couldn't send: "}{errText ?? (ur ? "دوبارہ کوشش کریں۔" : "please try again.")}
        </div>
      )}
    </form>
  );
}
