import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client-side Supabase — safe to import from client components. */
export function browserClient() {
  return createBrowserClient(url, anon);
}
