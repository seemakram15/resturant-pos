import { AuthForm } from "@/components/auth-form";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "New password" };

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="auth-page">
      <AuthForm mode="reset" locale={locale as Locale} />
    </div>
  );
}
