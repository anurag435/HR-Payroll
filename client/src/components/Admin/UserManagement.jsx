import { useEffect, useMemo, useState } from "react";
import { getUsers, getEmployees, createUser, updateUser } from "../../services/api";
import { ROLES, roleLabel } from "../../mockData/roles";
import StatusBadge from "../common/StatusBadge";

const EMPTY_FORM = {
  employeeId: "",
  workEmail: "",
  role: "",
  status: "active",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [editingUserId, setEditingUserId] = useState(null); // null = creating new
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [u, e] = await Promise.all([getUsers(), getEmployees()]);
      setUsers(u);
      setEmployees(e);
      setLoading(false);
    }
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        u.workEmail.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  function startNewUser() {
    setEditingUserId(null);
    setForm(EMPTY_FORM);
  }

  function startEditUser(user) {
    setEditingUserId(user.id);
    setForm({
      employeeId: user.employeeId ?? "",
      workEmail: user.workEmail,
      role: user.role,
      status: user.status,
    });
  }

  async function handleSave() {
    if (!form.employeeId || !form.workEmail || !form.role) return;
    setSaving(true);
    try {
      const employee = employees.find((e) => e.id === form.employeeId);
      const payload = {
        employeeId: form.employeeId,
        employeeName: employee?.name ?? "",
        workEmail: form.workEmail,
        role: form.role,
        status: form.status,
      };

      if (editingUserId) {
        const updated = await updateUser(editingUserId, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUserId ? updated : u))
        );
      } else {
        const created = await createUser(payload);
        setUsers((prev) => [...prev, created]);
      }
      startNewUser();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: table */}
        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-lg font-semibold">User Management</h1>
            <span className="badge-inactive border-accent/40 text-accent">
              Admin only
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={startNewUser} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors">
              + New User
            </button>
            <input
              type="text"
              placeholder="Search users, employees or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input flex-1 min-w-[200px]"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="field-input w-auto"
            >
              <option value="">Role Filter</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Work Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      No users match your search.
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => startEditUser(u)}
                    className={`cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors ${
                      editingUserId === u.id ? "bg-surface-raised" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">{u.employeeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{u.workEmail}</td>
                    <td className="py-3 pr-4 text-text-secondary">{roleLabel(u.role)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={u.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-text-muted mt-4">
            User accounts are separate from Employee records, but should be
            linked to an employee for access and ownership.
          </p>
        </div>

        {/* Right: create / edit panel */}
        <div className="panel p-6 h-fit">
          <h2 className="text-sm font-semibold mb-4">
            {editingUserId ? "Edit User" : "Create / Edit User"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Employee *
              </label>
              <select
                value={form.employeeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, employeeId: e.target.value }))
                }
                className="field-input"
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Work Email *
              </label>
              <input
                type="email"
                value={form.workEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, workEmail: e.target.value }))
                }
                placeholder="employee@company.com"
                className="field-input"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-2">
                Roles *
              </label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className="flex items-center gap-2 text-sm text-text-primary cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value }))
                      }
                      className="accent-accent"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              {/* Section 3 rule: a user must never be able to change their
                  own role — enforce that in the real API layer (only allow
                  this form for users other than the signed-in admin, or
                  disable the role field entirely when editing yourself). */}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs text-text-secondary">
                Account Status
              </label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    status: f.status === "active" ? "inactive" : "active",
                  }))
                }
                className={
                  form.status === "active" ? "badge-active" : "badge-inactive"
                }
              >
                {form.status === "active" ? "Active" : "Inactive"}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !form.employeeId || !form.workEmail || !form.role}
              className="btn-primary"
            >
              {saving
                ? "Saving…"
                : editingUserId
                ? "Save Access"
                : "Create User / Save Access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}