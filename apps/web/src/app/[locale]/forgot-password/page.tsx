import { AuthForm } from "@/components/auth-form";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="auth-page">
      <AuthForm mode="forgot" locale={locale as Locale} />
    </div>
  );
}
