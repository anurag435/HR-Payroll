import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTimeOffTypeById, createTimeOffType, updateTimeOffType } from "../../services/api";
import { ROLE_OPTIONS } from "../../constants/roles";

export default function TypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    unit: "Days",
    requiresAllocation: true,
    requiresApproval: true,
    approverRole: "HRManager",
  });

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    getTimeOffTypeById(id)
      .then((t) => setFormData({ ...t }))
      .catch((err) => setError(err.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        unit: formData.unit,
        requiresAllocation: formData.requiresAllocation,
        requiresApproval: formData.requiresApproval,
        approverRole: formData.approverRole,
      };
      if (isNew) await createTimeOffType(payload);
      else await updateTimeOffType(id, payload);
      navigate("/timeoff/types");
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/types")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Time Off Types
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">{isNew ? "New Time Off Type" : "Edit Time Off Type"}</h1>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-text-secondary mb-1.5">Name *</label>
            <input name="name" required value={formData.name} onChange={handleChange} className="field-input" placeholder="e.g. Paid Time Off" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="field-input">
              <option value="Days">Days</option>
              <option value="Hours">Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Approver Role</label>
            <select name="approverRole" value={formData.approverRole} onChange={handleChange} className="field-input">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requiresAllocation" checked={formData.requiresAllocation} onChange={handleChange} />
            Requires Allocation
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="requiresApproval" checked={formData.requiresApproval} onChange={handleChange} />
            Requires Approval
          </label>
        </div>
      </form>
    </div>
  );
}
