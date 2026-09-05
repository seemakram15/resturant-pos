// Local SQLite mirror for offline-first POS.
// Schema mirrors the Postgres tables the desktop actually needs to read/write.

const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

let _db;

async function initDatabase() {
  const dir = app.getPath("userData");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "khalifa-pos.sqlite");
  _db = new Database(file);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    create table if not exists items (
      id text primary key,
      sku text,
      category_slug text,
      name_en text not null,
      name_ur text,
      base_price real not null,
      is_available integer not null default 1,
      updated_at text
    );

    create table if not exists combos (
      slug text primary key,
      category text,
      name_en text not null,
      name_ur text,
      description_en text,
      price real not null,
      is_active integer not null default 1,
      updated_at text
    );

    create table if not exists orders (
      id text primary key,
      bill_no integer,
      channel text not null,
      status text not null default 'received',
      customer_name text,
      customer_phone text,
      subtotal real not null default 0,
      tax real not null default 0,
      discount real not null default 0,
      total real not null default 0,
      created_at text default (datetime('now')),
      synced integer not null default 0
    );

    create table if not exists order_lines (
      id text primary key,
      order_id text not null references orders(id) on delete cascade,
      item_id text,
      combo_slug text,
      name_snapshot text not null,
      qty integer not null,
      unit_price real not null,
      line_total real not null
    );

    create table if not exists outbox (
      ulid text primary key,
      created_at text default (datetime('now')),
      table_name text not null,
      op text not null,
      payload text not null,
      attempts integer not null default 0,
      last_error text
    );

    create table if not exists sync_cursors (
      table_name text primary key,
      last_pulled_at text
    );
  `);
}

function db() {
  if (!_db) throw new Error("DB not initialised — call initDatabase() first");
  return _db;
}

module.exports = { initDatabase, db };
