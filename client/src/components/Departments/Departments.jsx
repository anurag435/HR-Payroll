import { useEffect, useMemo, useState } from "react";
import { getDepartments, createDepartment } from "../../services/api";

const EMPTY_FORM = { name: "", company: "My Company" };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadDepartments() {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  const filtered = useMemo(
    () => departments.filter((d) => (d.name || "").toLowerCase().includes(search.toLowerCase())),
    [departments, search]
  );

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await createDepartment({
        name: form.name.trim(),
        company: form.company.trim() || undefined,
      });
      setDepartments((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Failed to create department.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: list */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-semibold">Departments</h1>
          </div>
          <p className="text-sm text-text-secondary mb-5">
            Used across Employees, Contracts, and payroll scoping.
          </p>

          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input w-full mb-5"
          />

          {loading && <p className="text-sm text-text-muted py-6 text-center">Loading departments…</p>}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-surface-border">
                    <th className="py-2 pr-4 font-medium">Department</th>
                    <th className="py-2 pr-4 font-medium">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-text-muted">
                        {departments.length === 0
                          ? "No departments yet. Create one to get started."
                          : "No departments match your search."}
                      </td>
                    </tr>
                  )}
                  {filtered.map((d) => (
                    <tr key={d._id} className="border-b border-surface-border/60">
                      <td className="py-3 pr-4 font-medium">{d.name}</td>
                      <td className="py-3 pr-4 text-text-secondary">{d.company || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: create panel */}
        <div className="panel p-6 h-fit">
          <h2 className="text-sm font-semibold mb-4">New Department</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Department Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Engineering"
                className="field-input"
              />
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Company</label>
              <input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="e.g. My Company"
                className="field-input"
              />
            </div>

            <button type="submit" disabled={saving || !form.name.trim()} className="btn-primary">
              {saving ? "Creating…" : "Create Department"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
