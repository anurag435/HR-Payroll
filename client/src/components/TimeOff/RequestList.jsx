import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ROLE_GROUPS } from "../../constants/roles";
import { getTimeOffRequests, approveTimeOffRequest, refuseTimeOffRequest } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function RequestList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHrStaff = ROLE_GROUPS.HR_STAFF.includes(user?.role);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  function load() {
    setLoading(true);
    getTimeOffRequests()
      .then(setRequests)
      .catch((err) => setError(err.message || "Failed to load requests."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(id) {
    setActioningId(id);
    setError("");
    try {
      await approveTimeOffRequest(id);
      load();
    } catch (err) {
      setError(err.message || "Failed to approve request.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleRefuse(id) {
    setActioningId(id);
    setError("");
    try {
      await refuseTimeOffRequest(id);
      load();
    } catch (err) {
      setError(err.message || "Failed to refuse request.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">Time Off Requests</h1>
          <button
            onClick={() => navigate("/timeoff/requests/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New Request
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          {isHrStaff ? "All employee time off requests" : "Your time off requests"}
        </p>

        {error && <p className="text-sm text-red-500 py-2">{error}</p>}
        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  {isHrStaff && <th className="py-2 pr-4 font-medium">Employee</th>}
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Dates</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  {isHrStaff && <th className="py-2 pr-4 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-text-muted">No requests found.</td></tr>
                )}
                {requests.map((r) => (
                  <tr key={r._id} className="border-b border-surface-border/60">
                    {isHrStaff && <td className="py-3 pr-4 font-medium">{r.employee?.name || "—"}</td>}
                    <td className="py-3 pr-4 text-text-secondary">{r.timeOffType?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(r.startDate)} — {formatDate(r.endDate)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.duration} {r.timeOffType?.unit}</td>
                    <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                    {isHrStaff && (
                      <td className="py-3 pr-4">
                        {r.status === "To Approve" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(r._id)}
                              disabled={actioningId === r._id}
                              className="text-xs text-status-active hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRefuse(r._id)}
                              disabled={actioningId === r._id}
                              className="text-xs text-red-500 hover:underline disabled:opacity-50"
                            >
                              Refuse
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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
