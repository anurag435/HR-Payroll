import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  getEmployees,
  createUser,
  createEmployee,
  updateUserRole,
  updateUserStatus,
} from "../../services/api";
import { ROLE_OPTIONS, roleLabel } from "../../constants/roles";
import { useAuth } from "../../context/useAuth";
import StatusBadge from "../common/StatusBadge";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
  employee: "",
  createNewEmployee: false,
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [u, e] = await Promise.all([getUsers(), getEmployees()]);
      setUsers(u || []);
      setEmployees(e?.employees || []);
    } catch (err) {
      console.error("Failed to load users/employees:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const employeesWithoutAccount = useMemo(() => {
    const linkedIds = new Set(users.map((u) => u.employee?._id).filter(Boolean));
    return employees.filter((e) => !linkedIds.has(e._id));
  }, [employees, users]);

  function startNewUser() {
    setEditingUserId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function startEditUser(u) {
    setEditingUserId(u._id);
    setEditRole(u.role);
    setEditActive(u.isActive);
    setError("");
  }

  const isEditingSelf = editingUserId && currentUser?._id === editingUserId;

  async function handleCreate() {
    setError("");
    if (!form.name || !form.email || !form.password || !form.role) return;
    setSaving(true);
    try {
      let employeeId = form.employee || undefined;

      // "Register a new employee" from this screen: create the Employee
      // record first, then link the new login to it — same two-step
      // relationship Employees → New uses, just started from this side.
      if (form.createNewEmployee) {
        const employee = await createEmployee({ name: form.name, email: form.email });
        employeeId = employee._id;
        setEmployees((prev) => [...prev, employee]);
      }

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (employeeId) payload.employee = employeeId;

      const created = await createUser(payload);
      setUsers((prev) => [created, ...prev]);
      startNewUser();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    setError("");
    setSaving(true);
    try {
      const target = users.find((u) => u._id === editingUserId);
      let updated = target;

      if (editRole !== target.role) {
        updated = await updateUserRole(editingUserId, editRole);
      }
      if (editActive !== target.isActive) {
        updated = await updateUserStatus(editingUserId, editActive);
      }

      setUsers((prev) => prev.map((u) => (u._id === editingUserId ? updated : u)));
      startNewUser();
    } catch (err) {
      setError(err.message || "Failed to update user.");
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
            <span className="badge-inactive border-accent/40 text-accent">Admin only</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={startNewUser} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors">
              + New User
            </button>
            <input
              type="text"
              placeholder="Search users or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input flex-1 min-w-50"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="field-input w-auto">
              <option value="">Role Filter</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Linked Employee</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="py-6 text-center text-text-muted">Loading users…</td></tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-text-muted">No users match your search.</td></tr>
                )}
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => startEditUser(u)}
                    className={`cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors ${
                      editingUserId === u._id ? "bg-surface-raised" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      {u.name}
                      {currentUser?._id === u._id && <span className="text-xs text-text-muted ml-1">(you)</span>}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{u.email}</td>
                    <td className="py-3 pr-4 text-text-secondary">{u.employee?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{roleLabel(u.role)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={u.isActive ? "active" : "inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-text-muted mt-4">
            User accounts are separate from Employee records. Name and email can't be changed after
            creation from here — only role and active status can.
          </p>
        </div>

        <div className="panel p-6 h-fit">
          <h2 className="text-sm font-semibold mb-4">
            {editingUserId ? "Edit Access" : "Create User"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
              {error}
            </div>
          )}

          {editingUserId ? (
            <div className="space-y-4">
              {isEditingSelf && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs rounded-md">
                  You can't change your own role or deactivate your own account — ask another Admin.
                </div>
              )}

              <div>
                <label className="block text-xs text-text-secondary mb-2">Role</label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                      <input
                        type="radio"
                        name="editRole"
                        value={r.value}
                        checked={editRole === r.value}
                        disabled={isEditingSelf}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="accent-accent"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-text-secondary">Account Status</label>
                <button
                  type="button"
                  disabled={isEditingSelf}
                  onClick={() => setEditActive((a) => !a)}
                  className={`${editActive ? "badge-active" : "badge-inactive"} disabled:opacity-50`}
                >
                  {editActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={saving || isEditingSelf} className="btn-primary flex-1">
                  {saving ? "Saving…" : "Save Access"}
                </button>
                <button onClick={startNewUser} className="border border-surface-border text-sm rounded-md px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="field-input"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Work Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="employee@company.com"
                  className="field-input"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Password *</label>
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className="field-input"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={form.createNewEmployee}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, createNewEmployee: e.target.checked, employee: "" }))
                    }
                    className="accent-accent"
                  />
                  This is a brand-new person — create their Employee record too
                </label>

                {form.createNewEmployee ? (
                  <p className="text-xs text-text-muted">
                    An Employee record will be created for <strong>{form.name || "this person"}</strong> using
                    the name/email above, then this login will be linked to it.
                  </p>
                ) : (
                  <>
                    <label className="block text-xs text-text-secondary mb-1.5">
                      Linked Employee (optional)
                    </label>
                    <select
                      value={form.employee}
                      onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                      className="field-input"
                    >
                      <option value="">No linked employee</option>
                      {employeesWithoutAccount.map((e) => (
                        <option key={e._id} value={e._id}>{e.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      This grants a login to an <em>existing</em> Employee record — check the box above
                      instead if they don't have one yet.
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-2">Role *</label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={form.role === r.value}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        className="accent-accent"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={saving || !form.name || !form.email || !form.password || !form.role}
                className="btn-primary"
              >
                {saving ? "Creating…" : "Create User"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}