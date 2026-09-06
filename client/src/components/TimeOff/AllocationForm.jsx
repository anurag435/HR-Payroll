import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTimeOffAllocation, getEmployees, getTimeOffTypes } from "../../services/api";

export default function AllocationForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [types, setTypes] = useState([]);

  const [formData, setFormData] = useState({
    employee: "",
    timeOffType: "",
    allocated: "",
    validFrom: "",
    validTo: "",
  });

  useEffect(() => {
    Promise.all([getEmployees({ limit: 100 }), getTimeOffTypes()])
      .then(([emps, tps]) => {
        setEmployees(emps?.employees || []);
        setTypes(tps || []);
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createTimeOffAllocation({
        employee: formData.employee,
        timeOffType: formData.timeOffType,
        allocated: Number(formData.allocated),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
      });
      navigate("/timeoff/allocations");
    } catch (err) {
      setError(err.message || "Failed to create allocation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/allocations")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Allocations
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">New Allocation</h1>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Create"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee *</label>
            <select name="employee" required value={formData.employee} onChange={handleChange} className="field-input">
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Time Off Type *</label>
            <select name="timeOffType" required value={formData.timeOffType} onChange={handleChange} className="field-input">
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Allocated *</label>
            <input name="allocated" type="number" min="0.5" step="0.5" required value={formData.allocated} onChange={handleChange} className="field-input" />
          </div>

          <div></div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Valid From *</label>
            <input name="validFrom" type="date" required value={formData.validFrom} onChange={handleChange} className="field-input" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Valid To *</label>
            <input name="validTo" type="date" required value={formData.validTo} onChange={handleChange} className="field-input" />
          </div>
        </div>
      </form>
    </div>
  );
}
