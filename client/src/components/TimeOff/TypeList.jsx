import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTimeOffTypes } from "../../services/api";

export default function TypeList() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTimeOffTypes()
      .then(setTypes)
      .catch((err) => setError(err.message || "Failed to load time off types."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">Time Off Types</h1>
          <button
            onClick={() => navigate("/timeoff/types/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-5">Leave policies: units, allocation and approval requirements</p>

        {error && <p className="text-sm text-status-danger py-2">{error}</p>}
        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Unit</th>
                  <th className="py-2 pr-4 font-medium">Requires Allocation</th>
                  <th className="py-2 pr-4 font-medium">Requires Approval</th>
                  <th className="py-2 pr-4 font-medium">Approver Role</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-text-muted">No time off types configured yet.</td></tr>
                )}
                {types.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/timeoff/types/${t._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{t.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.unit}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.requiresAllocation ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.requiresApproval ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.approverRole}</td>
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
