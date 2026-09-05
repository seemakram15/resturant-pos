import { AuthForm } from "@/components/auth-form";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Create account" };

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="auth-page">
      <AuthForm mode="signup" locale={locale as Locale} />
    </div>
  );
}
