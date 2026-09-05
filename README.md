# Khalifa Foods · Restaurant System

Monorepo for Khalifa Foods' POS, ordering website, and mobile companion.

## Structure

```
.
├── apps/
│   ├── web/           Next.js 15 — customer site + admin console (shared)
│   ├── desktop/       Electron wrapper (Windows POS) — wraps apps/web
│   └── mobile/        .NET MAUI (Android + iOS, read-only companion)
├── packages/
│   ├── ui/            Shared design tokens + primitive components
│   ├── i18n/          en + ur locale files
│   └── emails/        react-email templates
├── supabase/
│   ├── config.toml
│   ├── migrations/    Schema (RLS-enabled, multi-tenant-ready)
│   └── seed.sql       Khalifa's 24 deals + à la carte skeleton
└── docs/
```

## Quick start

```bash
# 1. Install root deps + all workspaces
npm install

# 2. Copy env template
cp env.example.txt .env.local
cp env.example.txt apps/web/.env.local
# edit and add real Supabase + Resend keys

# 3. Start Supabase locally (needs Docker) OR point at cloud project
npx supabase start
npx supabase db reset   # runs migrations + seed

# 4. Run the web app (customer + admin)
npm run dev:web

# 5. In another shell, preview emails
npm run dev:emails
```

## Stack

| Layer | Tech |
|-------|------|
| Cloud DB + Auth + Storage | Supabase (free tier) |
| Local DB (desktop) | SQLite via `better-sqlite3` |
| Local DB (mobile) | SQLite via `sqlite-net-pcl` |
| Website + APIs | Next.js 15 on Vercel |
| Desktop POS | Electron wrapping the Next.js app |
| Mobile companion | .NET MAUI |
| Email | Resend + react-email |
| i18n | next-intl (en, ur) with RTL support |

## Design tokens

Palette: warm receipt-paper `#F7F2E9` / burnt-saffron accent `#C2410C` / deep charcoal ink `#141210`.
Typography: **Fraunces** (display) · **IBM Plex Sans** (body) · **JetBrains Mono** (data) · **Noto Nastaliq Urdu** (Urdu).

## Env vars

See [`env.example.txt`](./env.example.txt). Copy to `.env.local` and fill in.
Owner supplies: Supabase project keys, Resend API key.

## Requirements doc

Full spec: [`docs/requirements.html`](./docs/requirements.html) or the live artifact.
# resturant-pos
