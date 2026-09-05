import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID ??
  "00000000-0000-0000-0000-000000000001";
export const BRANCH_ID =
  process.env.NEXT_PUBLIC_BRANCH_ID ??
  "00000000-0000-0000-0000-0000000000a1";

/** Client-side (browser) Supabase — safe to call from client components. */
export function browserClient() {
  return createBrowserClient(url, anon);
}

/** Server-side Supabase with cookie-based auth session for RSC / route handlers. */
export async function serverClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as never)
          );
        } catch {
          /* set from RSC is a no-op */
        }
      },
    },
    db: { schema: "public" },
    global: {
      headers: {
        // Multi-tenant hint used by RLS via current_tenant_id().
        "x-tenant-id": TENANT_ID,
      },
    },
  });
}

/** Service-role client for privileged writes (never expose to the browser). */
export function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
