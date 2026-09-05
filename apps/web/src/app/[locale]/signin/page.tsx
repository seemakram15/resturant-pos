import { AuthForm } from "@/components/auth-form";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="auth-page">
      <AuthForm mode="signin" locale={locale as Locale} />
    </div>
  );
}
