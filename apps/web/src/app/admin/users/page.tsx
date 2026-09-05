import { serverClient, TENANT_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadUsers() {
  try {
    const sb = await serverClient();
    const { data } = await sb
      .from("users")
      .select("id, email, full_name, role, locale, is_active")
      .eq("tenant_id", TENANT_ID)
      .order("role");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const users = await loadUsers();
  return (
    <>
      <div className="admin-head">
        <h1>Users</h1>
        <button className="btn">Invite user</button>
      </div>
      {users.length === 0 ? (
        <div className="card empty">
          <div className="icon">👥</div>
          <p style={{ color: "var(--ink-3)" }}>Invite your team — owner, manager, cashier, waiter. Login via email OTP.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Language</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontFamily: "var(--serif)" }}>{u.full_name}</td>
                <td className="mono">{u.email}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{u.locale.toUpperCase()}</td>
                <td>{u.is_active ? "Active" : "Disabled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
