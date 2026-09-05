-- Resolve the current tenant from EITHER the app.tenant_id GUC (set by the POS /
-- server-side code) OR the PostgREST `x-tenant-id` request header (sent by the
-- Supabase JS server client). Without this, anon reads under RLS always saw a
-- NULL tenant and returned nothing, so the website silently served fallback data.
create or replace function current_tenant_id() returns uuid
  language sql stable
  as $$
    select coalesce(
      nullif(current_setting('app.tenant_id', true), '')::uuid,
      nullif(
        nullif(current_setting('request.headers', true), '')::json ->> 'x-tenant-id',
        ''
      )::uuid
    )
  $$;
