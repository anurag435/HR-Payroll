import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLE_GROUPS } from "../../constants/roles";
import { listAttendance, listMyAttendance } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

export default function AttendanceList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHrStaff = ROLE_GROUPS.HR_STAFF.includes(user?.role);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const request = isHrStaff ? listAttendance() : listMyAttendance();
    request
      .then((data) => setRecords(isHrStaff ? data.records : data))
      .catch((err) => setError(err.message || "Failed to load attendance."))
      .finally(() => setLoading(false));
  }, [isHrStaff]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const name = r.employee?.name || "";
      const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Attendance</h1>
        <p className="text-sm text-text-secondary mb-5">
          {isHrStaff ? "Attendance records across all employees" : "Your attendance history"}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          {isHrStaff && (
            <button
              onClick={() => navigate("/attendance/new")}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              + Manual Entry
            </button>
          )}
          {isHrStaff && (
            <input
              type="text"
              placeholder="Search by employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input flex-1 min-w-50"
            />
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-input w-auto">
            <option value="">All statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500 py-2">{error}</p>}
        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading attendance…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  {isHrStaff && <th className="py-2 pr-4 font-medium">Employee</th>}
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Check In</th>
                  <th className="py-2 pr-4 font-medium">Check Out</th>
                  <th className="py-2 pr-4 font-medium">Worked Hours</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      No attendance records found.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r._id}
                    onClick={() => isHrStaff && navigate(`/attendance/${r._id}`)}
                    className={`border-b border-surface-border/60 ${
                      isHrStaff ? "cursor-pointer hover:bg-surface-raised" : ""
                    } transition-colors`}
                  >
                    {isHrStaff && <td className="py-3 pr-4 font-medium">{r.employee?.name || "—"}</td>}
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(r.date)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatTime(r.checkIn)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatTime(r.checkOut)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.workedHours ?? 0}h</td>
                    <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
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