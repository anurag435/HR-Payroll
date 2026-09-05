import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAttendanceById,
  createManualAttendance,
  updateAttendance,
  getEmployees,
} from "../../services/api";

function toDateInputValue(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}
function toTimeInputValue(d) {
  return d ? new Date(d).toISOString().slice(0, 16) : "";
}

export default function AttendanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
  });

  useEffect(() => {
    if (isNew) {
      getEmployees({ limit: 100 })
        .then((data) => setEmployees(data?.employees || []))
        .catch(() => setEmployees([]));
    }
  }, [isNew]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    getAttendanceById(id)
      .then((r) => {
        setFormData({
          employee: r.employee?._id || r.employee || "",
          date: toDateInputValue(r.date),
          checkIn: toTimeInputValue(r.checkIn),
          checkOut: toTimeInputValue(r.checkOut),
          status: r.status || "Present",
        });
      })
      .catch((err) => setError(err.message || "Failed to load record."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

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
        checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : null,
        checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
        status: formData.status,
      };
      if (isNew) {
        await createManualAttendance({ ...payload, employee: formData.employee, date: formData.date });
      } else {
        await updateAttendance(id, payload);
      }
      navigate("/attendance");
    } catch (err) {
      setError(err.message || "Failed to save attendance record.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/attendance")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Attendance
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">{isNew ? "Manual Attendance Entry" : "Correct Attendance"}</h1>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isNew && (
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">Employee *</label>
              <select name="employee" required value={formData.employee} onChange={handleChange} className="field-input">
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Date *</label>
            <input
              name="date"
              type="date"
              required
              disabled={!isNew}
              value={formData.date}
              onChange={handleChange}
              className="field-input disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="field-input">
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Check In</label>
            <input name="checkIn" type="datetime-local" value={formData.checkIn} onChange={handleChange} className="field-input" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Check Out</label>
            <input name="checkOut" type="datetime-local" value={formData.checkOut} onChange={handleChange} className="field-input" />
          </div>
        </div>
      </form>
    </div>
  );
}