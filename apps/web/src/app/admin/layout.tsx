import "@khalifa/ui/styles.css";
import "../app.css";
import "./admin.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · Khalifa Foods" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="mark">Khalifa</span>
          <span className="sub">Admin</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/menu">Menu</Link>
          <Link href="/admin/deals">Deals</Link>
          <Link href="/admin/stock">Stock</Link>
          <Link href="/admin/purchasing">Purchasing</Link>
          <Link href="/admin/reports">Reports</Link>
          <Link href="/admin/tables">Tables</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
        <div className="admin-footer">
          <Link href="/en">← Back to site</Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
