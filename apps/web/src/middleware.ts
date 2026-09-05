import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "ur"] as const;
const DEFAULT_LOCALE = "en";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, API, static files, admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  const cookieLocale = req.cookies.get("locale")?.value;
  const chosen = LOCALES.includes(cookieLocale as (typeof LOCALES)[number])
    ? cookieLocale!
    : DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${chosen}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|.*\\.).*)"],
};
