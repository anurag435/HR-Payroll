import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkingScheduleById } from "../../services/api";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseHours(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export default function ScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (id === "new") {
      setSchedule(null);
      setDays([]);
      setLoading(false);
      return;
    }
    getWorkingScheduleById(id).then((data) => {
      setSchedule(data);
      setDays(data.days ?? []);
      setLoading(false);
    });
  }, [id]);

  function updateDay(index, field, value) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function removeDay(index) {
    setDays((prev) => prev.filter((_, i) => i !== index));
  }

  function addDay() {
    const used = days.map((d) => d.day);
    const nextDay = WEEKDAYS.find((d) => !used.includes(d)) ?? "Monday";
    setDays((prev) => [...prev, { day: nextDay, start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" }]);
  }

  const totalHours = days.reduce((sum, d) => sum + parseHours(d.hours), 0);

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading schedule…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/working-schedule")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to list
      </button>

      <div className="panel p-6 mb-6">
        <h1 className="text-lg font-semibold mb-6">{schedule ? schedule.name : "New Schedule"}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Schedule Name</label>
            <input defaultValue={schedule?.name ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Company</label>
            <input defaultValue={schedule?.company ?? "My Company"} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Days per Week</label>
            <input defaultValue={schedule?.daysPerWeek ?? days.length} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Hours per Week</label>
            <input defaultValue={schedule?.hoursPerWeek ?? totalHours} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Timezone</label>
            <input defaultValue={schedule?.timezone ?? "Company timezone"} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Weekly Schedule</h2>
          <button
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
                <th className="py-2 pr-4 font-medium">Break</th>
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
                    <input value={d.start} onChange={(e) => updateDay(i, "start", e.target.value)} className="field-input" />
                  </td>
                  <td className="py-2 pr-4">
                    <input value={d.end} onChange={(e) => updateDay(i, "end", e.target.value)} className="field-input" />
                  </td>
                  <td className="py-2 pr-4">
                    <input value={d.breakTime} onChange={(e) => updateDay(i, "breakTime", e.target.value)} className="field-input" />
                  </td>
                  <td className="py-2 pr-4">
                    <input value={d.hours} onChange={(e) => updateDay(i, "hours", e.target.value)} className="field-input" />
                  </td>
                  <td className="py-2 pr-4">
                    <button onClick={() => removeDay(i)} className="text-text-muted hover:text-red-500 transition-colors">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <p className="text-sm font-medium">
            Total Weekly Hours: <span className="text-accent">{totalHours}h</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-4">Use this schedule as the employee/contract working pattern.</p>
    </div>
  );
}