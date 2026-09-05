"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/i18n";

type Mode = "signin" | "signup" | "forgot" | "reset";

const HERO_IMG = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80";

function tr(ur: boolean, en: string, urText: string) { return ur ? urText : en; }

export function AuthForm({ mode, locale }: { mode: Mode; locale: Locale }) {
  const router = useRouter();
  const ur = locale === "ur";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const title = {
    signin: tr(ur, "Welcome back", "دوبارہ خوش آمدید"),
    signup: tr(ur, "Create your account", "اکاؤنٹ بنائیں"),
    forgot: tr(ur, "Reset your password", "پاس ورڈ ری سیٹ کریں"),
    reset:  tr(ur, "Choose a new password", "نیا پاس ورڈ منتخب کریں"),
  }[mode];

  const subtitle = {
    signin: tr(ur, "Order faster, track history, save your favourite deals.", "تیز آرڈر، ہسٹری، اور پسندیدہ ڈیلز۔"),
    signup: tr(ur, "Takes 20 seconds. No card required.", "بس بیس سیکنڈ۔ کارڈ درکار نہیں۔"),
    forgot: tr(ur, "Enter your email — we'll send a reset link.", "ای میل دیں — ری سیٹ لنک بھیج دیں گے۔"),
    reset:  tr(ur, "Pick a new password to finish signing in.", "نیا پاس ورڈ منتخب کریں۔"),
  }[mode];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setNote(null); setBusy(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const sb = browserClient();

    try {
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(`/${locale}`); router.refresh();
      } else if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email, password,
          options: {
            data: { full_name: name, phone },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/${locale}` : undefined,
          },
        });
        if (error) throw error;
        setNote(tr(ur, "Check your email to confirm your account, then sign in.",
                   "اپنی ای میل چیک کریں — تصدیقی لنک بھیج دیا گیا ہے۔"));
      } else if (mode === "forgot") {
        const redirect = typeof window !== "undefined" ? `${window.location.origin}/${locale}/reset-password` : undefined;
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        if (error) throw error;
        setNote(tr(ur, "If that email is registered, a reset link is on its way.",
                   "اگر ای میل رجسٹرڈ ہے تو ری سیٹ لنک بھیج دیا گیا ہے۔"));
      } else if (mode === "reset") {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
        setNote(tr(ur, "Password updated. Redirecting…", "پاس ورڈ اپڈیٹ ہو گیا۔ ری ڈائریکٹ ہو رہا ہے…"));
        setTimeout(() => router.push(`/${locale}`), 900);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const submitLabel = {
    signin: tr(ur, "Sign in", "لاگ ان کریں"),
    signup: tr(ur, "Create account", "اکاؤنٹ بنائیں"),
    forgot: tr(ur, "Send reset link", "ری سیٹ لنک بھیجیں"),
    reset:  tr(ur, "Update password", "پاس ورڈ اپڈیٹ کریں"),
  }[mode];

  return (
    <div className="auth-shell v2">
      <aside
        className="auth-visual"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
        aria-hidden="true"
      >
        <div className="auth-visual-veil" />
        <div className="auth-visual-inner">
          <span className="pill eyebrow-pill glass">
            <span className="dot" /> {tr(ur, "Khalifa Foods", "خلیفہ فوڈز")}
          </span>
          <h2>{tr(ur, "Fresh food, one tap away.", "تازہ کھانا، بس ایک ٹیپ دور۔")}</h2>
          <ul className="auth-perks">
            <li>{tr(ur, "One-tap reorder", "ایک ٹیپ میں دوبارہ آرڈر")}</li>
            <li>{tr(ur, "Members-first deals", "اراکین کے لیے پہلی ڈیلز")}</li>
            <li>{tr(ur, "Live delivery tracking", "لائیو ڈلیوری ٹریکنگ")}</li>
          </ul>
        </div>
      </aside>

      <section className="auth-card">
        <header className="auth-head">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <form onSubmit={onSubmit} className="auth-form">
          {mode === "signup" && (
            <label className="field">
              <span>{tr(ur, "Full name", "پورا نام")}</span>
              <input name="name" type="text" autoComplete="name" required placeholder={tr(ur, "e.g. Waseem Akram", "مثلاً وسیم اکرم")} />
            </label>
          )}

          {(mode === "signin" || mode === "signup" || mode === "forgot") && (
            <label className="field">
              <span>{tr(ur, "Email", "ای میل")}</span>
              <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </label>
          )}

          {mode === "signup" && (
            <label className="field">
              <span>{tr(ur, "Phone", "فون")}</span>
              <input name="phone" type="tel" autoComplete="tel" required placeholder="0323-1234567" />
            </label>
          )}

          {(mode === "signin" || mode === "signup" || mode === "reset") && (
            <label className="field">
              <span>
                {tr(ur, mode === "reset" ? "New password" : "Password",
                    mode === "reset" ? "نیا پاس ورڈ" : "پاس ورڈ")}
              </span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </label>
          )}

          {mode === "signin" && (
            <div className="auth-row">
              <label className="check">
                <input type="checkbox" defaultChecked /> <span>{tr(ur, "Remember me", "مجھے یاد رکھیں")}</span>
              </label>
              <Link href={`/${locale}/forgot-password`} className="link">
                {tr(ur, "Forgot password?", "پاس ورڈ بھول گئے؟")}
              </Link>
            </div>
          )}

          <button type="submit" className="btn primary big auth-submit" disabled={busy}>
            {busy ? tr(ur, "Just a sec…", "ذرا ٹھہریں…") : submitLabel}
          </button>

          {error && <div className="auth-note err">{error}</div>}
          {note && <div className="auth-note ok">{note}</div>}
        </form>

        {mode === "signin" && (
          <div className="auth-alt">
            <span>{tr(ur, "New here?", "نئے ہیں؟")}</span>{" "}
            <Link href={`/${locale}/signup`} className="link strong">{tr(ur, "Create an account", "اکاؤنٹ بنائیں")}</Link>
          </div>
        )}
        {mode === "signup" && (
          <div className="auth-alt">
            <span>{tr(ur, "Already have an account?", "پہلے سے اکاؤنٹ ہے؟")}</span>{" "}
            <Link href={`/${locale}/signin`} className="link strong">{tr(ur, "Sign in", "لاگ ان کریں")}</Link>
          </div>
        )}
        {(mode === "forgot" || mode === "reset") && (
          <div className="auth-alt">
            <Link href={`/${locale}/signin`} className="link strong">← {tr(ur, "Back to sign in", "لاگ ان پر واپس")}</Link>
          </div>
        )}
      </section>
    </div>
  );
}
