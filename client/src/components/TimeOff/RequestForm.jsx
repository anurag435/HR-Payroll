import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLE_GROUPS } from "../../constants/roles";
import { createTimeOffRequest, getTimeOffTypes, getEmployees } from "../../services/api";

export default function RequestForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHrStaff = ROLE_GROUPS.HR_STAFF.includes(user?.role);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee: "",
    timeOffType: "",
    startDate: "",
    endDate: "",
    duration: "",
    reason: "",
  });

  useEffect(() => {
    getTimeOffTypes().then(setTypes).catch(() => {});
    if (isHrStaff) {
      getEmployees({ limit: 100 }).then((d) => setEmployees(d?.employees || [])).catch(() => {});
    }
  }, [isHrStaff]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        timeOffType: formData.timeOffType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: Number(formData.duration),
        reason: formData.reason || undefined,
      };
      if (isHrStaff && formData.employee) payload.employee = formData.employee;

      await createTimeOffRequest(payload);
      navigate("/timeoff/requests");
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/requests")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Requests
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">New Time Off Request</h1>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isHrStaff && (
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">On behalf of (optional — defaults to you)</label>
              <select name="employee" value={formData.employee} onChange={handleChange} className="field-input">
                <option value="">Myself</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs text-text-secondary mb-1.5">Time Off Type *</label>
            <select name="timeOffType" required value={formData.timeOffType} onChange={handleChange} className="field-input">
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Start Date *</label>
            <input name="startDate" type="date" required value={formData.startDate} onChange={handleChange} className="field-input" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">End Date *</label>
            <input name="endDate" type="date" required value={formData.endDate} onChange={handleChange} className="field-input" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Duration *</label>
            <input name="duration" type="number" min="0.5" step="0.5" required value={formData.duration} onChange={handleChange} className="field-input" />
          </div>

          <div></div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-text-secondary mb-1.5">Reason</label>
            <textarea name="reason" rows={3} value={formData.reason} onChange={handleChange} className="field-input" />
          </div>
        </div>
      </form>
    </div>
  );
}
