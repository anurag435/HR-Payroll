import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getEmployees().then((data) => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () =>
      employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      ),
    [employees, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Employees</h1>
        <p className="text-sm text-text-secondary mb-5">
          {view === "kanban"
            ? "Default view: Kanban"
            : "List view for sort, filter and bulk scanning"}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/employees/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-200px"
          />
          <div className="flex rounded-md border border-surface-border overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-2 text-sm ${view === "kanban" ? "bg-accent text-white" : "bg-surface-panel text-text-secondary"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm ${view === "list" ? "bg-accent text-white" : "bg-surface-panel text-text-secondary"}`}
            >
              List
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading employees…</p>}

        {!loading && view === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp) => (
              <button
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="text-left border border-surface-border rounded-lg p-4 hover:border-accent/50 hover:shadow-sm transition-all bg-surface-panel"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold shrink-0">
                    {initials(emp.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-text-secondary truncate">{emp.jobPosition}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{emp.department}</span>
                  <StatusBadge status={emp.status} />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && view === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Work Email</th>
                  <th className="py-2 pr-4 font-medium">Job Position</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{emp.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{emp.workEmail}</td>
                    <td className="py-3 pr-4 text-text-secondary">{emp.jobPosition}</td>
                    <td className="py-3 pr-4 text-text-secondary">{emp.department}</td>
                    <td className="py-3 pr-4"><StatusBadge status={emp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">
          {view === "kanban"
            ? "Kanban is good for browsing; clicking a card opens the same Employee Form used everywhere else."
            : "The list view is the main entry point for opening a specific employee record quickly."}
        </p>
      </div>
    </div>
  );
}