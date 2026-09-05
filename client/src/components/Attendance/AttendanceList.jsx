import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAttendance } from "../../services/api";
import { MOCK_TODAY } from "../../mockData/attendance";
import StatusBadge from "../common/StatusBadge";

export default function AttendanceList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeFilter = searchParams.get("employee") ?? "";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAttendance({ employeeName: employeeFilter || undefined }).then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, [employeeFilter]);

  const filtered = useMemo(() => {
    let rows = records.filter((r) => r.employeeName.toLowerCase().includes(search.toLowerCase()));
    if (todayOnly) rows = rows.filter((r) => r.date === MOCK_TODAY);
    return rows;
  }, [records, search, todayOnly]);

  function clearEmployeeFilter() {
    searchParams.delete("employee");
    setSearchParams(searchParams);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Attendance</h1>
        <p className="text-sm text-text-secondary mb-5">List view of employee attendance records</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/attendance/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search attendance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-[200px]"
          />
          <button
            onClick={() => setTodayOnly((v) => !v)}
            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
              todayOnly ? "bg-accent text-white border-accent" : "bg-surface-panel text-text-secondary border-surface-border"
            }`}
          >
            Today
          </button>
          {employeeFilter && (
            <button
              onClick={clearEmployeeFilter}
              className="px-3 py-2 text-sm rounded-md border border-accent text-accent bg-accent/10 flex items-center gap-2"
            >
              Employee: {employeeFilter.split(" ")[0]}
              <span className="text-xs">×</span>
            </button>
          )}
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading attendance…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Check In</th>
                  <th className="py-2 pr-4 font-medium">Check Out</th>
                  <th className="py-2 pr-4 font-medium">Worked Hours</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">
                      No attendance records match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/attendance/${r.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{r.employeeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {r.checkIn ? r.checkIn.split(" ").slice(-1)[0] : "—"}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {r.checkOut ? r.checkOut.split(" ").slice(-1)[0] : "—"}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{r.workedHours.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={r.status === "present" ? "active" : "inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">
          List view should help users review raw check-in / check-out data and identify missing punches quickly.
        </p>
      </div>
    </div>
  );
}