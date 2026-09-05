import "@khalifa/ui/styles.css";
import "./app.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Khalifa Foods · Healthy Ingredients Healthy Life",
    template: "%s · Khalifa Foods",
  },
  description:
    "Fast food restaurant in DHA Lahore. Fresh burgers, chicken, wood-oven pizza, shawarma. Order online for pickup or delivery.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "Khalifa Foods",
    description: "Healthy Ingredients · Healthy Life · DHA Lahore",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
