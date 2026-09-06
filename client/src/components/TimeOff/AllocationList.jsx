import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLE_GROUPS } from "../../constants/roles";
import { getTimeOffAllocations } from "../../services/api";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AllocationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHrStaff = ROLE_GROUPS.HR_STAFF.includes(user?.role);

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTimeOffAllocations()
      .then(setAllocations)
      .catch((err) => setError(err.message || "Failed to load allocations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">Time Off Allocations</h1>
          {isHrStaff && (
            <button
              onClick={() => navigate("/timeoff/allocations/new")}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              + New
            </button>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-5">
          {isHrStaff ? "Balances across all employees" : "Your leave balances"}
        </p>

        {error && <p className="text-sm text-status-danger py-2">{error}</p>}
        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  {isHrStaff && <th className="py-2 pr-4 font-medium">Employee</th>}
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Allocated</th>
                  <th className="py-2 pr-4 font-medium">Used</th>
                  <th className="py-2 pr-4 font-medium">Remaining</th>
                  <th className="py-2 pr-4 font-medium">Valid Period</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-text-muted">No allocations found.</td></tr>
                )}
                {allocations.map((a) => (
                  <tr key={a._id} className="border-b border-surface-border/60">
                    {isHrStaff && <td className="py-3 pr-4 font-medium">{a.employee?.name || "—"}</td>}
                    <td className="py-3 pr-4 text-text-secondary">{a.timeOffType?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.allocated} {a.timeOffType?.unit}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.used}</td>
                    <td className="py-3 pr-4 font-medium">{a.remaining}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(a.validFrom)} — {formatDate(a.validTo)}</td>
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
