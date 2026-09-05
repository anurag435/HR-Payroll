import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getWorkingScheduleById,
  createWorkingSchedule,
  updateWorkingSchedule,
  archiveWorkingSchedule,
} from "../../services/api";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function computeHours(day) {
  if (!day.startTime || !day.endTime) return 0;
  const [sh, sm] = day.startTime.split(":").map(Number);
  const [eh, em] = day.endTime.split(":").map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm) - (Number(day.breakMinutes) || 0);
  return Math.max(minutes, 0) / 60;
}

export default function ScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("My Company");
  const [status, setStatus] = useState("Active");
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    getWorkingScheduleById(id)
      .then((s) => {
        setName(s.name || "");
        setCompany(s.company || "My Company");
        setStatus(s.status || "Active");
        setDays(s.days || []);
      })
      .catch((err) => {
        console.error("Failed to load schedule:", err);
        setError("Failed to load working schedule.");
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateDay(index, field, value) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function removeDay(index) {
    setDays((prev) => prev.filter((_, i) => i !== index));
  }

  function addDay() {
    const used = days.map((d) => d.day);
    const nextDay = WEEKDAYS.find((d) => !used.includes(d)) ?? "Monday";
    setDays((prev) => [...prev, { day: nextDay, startTime: "09:00", endTime: "18:00", breakMinutes: 60 }]);
  }

  const totalHoursPreview = days.reduce((sum, d) => sum + computeHours(d), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (days.length === 0) {
      setError("Add at least one day before saving.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        company,
        status,
        days: days.map((d) => ({
          day: d.day,
          startTime: d.startTime,
          endTime: d.endTime,
          breakMinutes: Number(d.breakMinutes) || 0,
        })),
      };

      if (isNew) {
        const created = await createWorkingSchedule(payload);
        navigate(`/working-schedule/${created._id}`);
      } else {
        await updateWorkingSchedule(id, payload);
        navigate("/working-schedule");
      }
    } catch (err) {
      setError(err.message || "Failed to save working schedule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm("Archive this schedule? It will no longer be selectable for new employees/contracts.")) return;
    setSubmitting(true);
    try {
      await archiveWorkingSchedule(id);
      navigate("/working-schedule");
    } catch (err) {
      setError(err.message || "Failed to archive schedule.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading schedule…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/working-schedule")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to list
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="panel p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">{isNew ? "New Schedule" : name}</h1>
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : isNew ? "Create Schedule" : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Schedule Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="e.g. 40 Hours / Week" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Days per Week</label>
              
              <input value={days.length} readOnly className="field-input opacity-60" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Hours per Week (preview)</label>
              <input value={`${totalHoursPreview.toFixed(1)}h`} readOnly className="field-input opacity-60" />
            </div>
            {!isNew && (
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="field-input">
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Weekly Schedule</h2>
            <button
              type="button"
              onClick={addDay}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
            >
              + Add Day
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Day</th>
                  <th className="py-2 pr-4 font-medium">Start Time</th>
                  <th className="py-2 pr-4 font-medium">End Time</th>
                  <th className="py-2 pr-4 font-medium">Break (minutes)</th>
                  <th className="py-2 pr-4 font-medium">Hours</th>
                  <th className="py-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {days.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      No days added yet. Click "+ Add Day" to build the weekly pattern.
                    </td>
                  </tr>
                )}
                {days.map((d, i) => (
                  <tr key={i} className="border-b border-surface-border/60">
                    <td className="py-2 pr-4">
                      <select value={d.day} onChange={(e) => updateDay(i, "day", e.target.value)} className="field-input">
                        {WEEKDAYS.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="time"
                        value={d.startTime}
                        onChange={(e) => updateDay(i, "startTime", e.target.value)}
                        className="field-input"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="time"
                        value={d.endTime}
                        onChange={(e) => updateDay(i, "endTime", e.target.value)}
                        className="field-input"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        min="0"
                        value={d.breakMinutes}
                        onChange={(e) => updateDay(i, "breakMinutes", e.target.value)}
                        className="field-input"
                      />
                    </td>
                    <td className="py-2 pr-4 text-text-secondary">{computeHours(d).toFixed(1)}h</td>
                    <td className="py-2 pr-4">
                      <button type="button" onClick={() => removeDay(i)} className="text-text-muted hover:text-red-500 transition-colors">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <p className="text-sm font-medium">
              Total Weekly Hours (preview): <span className="text-accent">{totalHoursPreview.toFixed(1)}h</span>
            </p>
          </div>
        </div>
      </form>

      {!isNew && status === "Active" && (
        <div className="panel p-6 mt-6">
          <h2 className="text-sm font-semibold mb-2">Archive This Schedule</h2>
          <p className="text-sm text-text-secondary mb-4">
            Archived schedules stay attached to any employee/contract already using them, but won't appear as an option for new ones.
          </p>
          <button
            type="button"
            onClick={handleArchive}
            disabled={submitting}
            className="border border-red-500/40 text-red-500 hover:bg-red-500/10 text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            Archive Schedule
          </button>
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">Use this schedule as the employee/contract working pattern.</p>
    </div>
  );
}