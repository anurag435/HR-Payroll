import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkingSchedules } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

export default function ScheduleList() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getWorkingSchedules()
      .then((data) => setSchedules(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load working schedules:", err);
        setSchedules([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => schedules.filter((s) => (s.name || "").toLowerCase().includes(search.toLowerCase())),
    [schedules, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">Working Schedules</h1>
          <button
            onClick={() => navigate("/working-schedule/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New Schedule
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-5">Select a schedule to open its Form view</p>

        <input
          type="text"
          placeholder="Search schedules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input w-full mb-5"
        />

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading schedules…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Schedule Name</th>
                  <th className="py-2 pr-4 font-medium">Days / Week</th>
                  <th className="py-2 pr-4 font-medium">Hours / Week</th>
                  <th className="py-2 pr-4 font-medium">Company</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">No schedules found.</td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => navigate(`/working-schedule/${s._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.days?.length ?? 0}</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.totalWeeklyHours ?? 0}h</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.company || "—"}</td>
                    <td className="py-3 pr-4"><StatusBadge status={(s.status || "Active").toLowerCase()} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}