import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTimeOffRequests, setRequestStatus } from "../../services/api";
import { TimeOffStatusBadge } from "./statusBadges";

export default function RequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myTeamOnly, setMyTeamOnly] = useState(false);

  function load() {
    getTimeOffRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  const filtered = useMemo(
    () => requests.filter((r) => r.employeeName.toLowerCase().includes(search.toLowerCase())),
    [requests, search]
  );

  async function handleAction(e, id, status) {
    e.stopPropagation();
    await setRequestStatus(id, status);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Time Off Requests</h1>
        <p className="text-sm text-text-secondary mb-5">List view opened from Time Off ▾ → Requests</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/timeoff/requests/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-[200px]"
          />
          <button
            onClick={() => setMyTeamOnly((v) => !v)}
            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
              myTeamOnly ? "bg-accent text-white border-accent" : "bg-surface-panel text-text-secondary border-surface-border"
            }`}
          >
            My Team
          </button>
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading requests…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Start</th>
                  <th className="py-2 pr-4 font-medium">End</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-text-muted">
                      No requests match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/timeoff/requests/${r.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{r.employeeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.typeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.startDate}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.endDate}</td>
                    <td className="py-3 pr-4 text-text-secondary">{r.duration}</td>
                    <td className="py-3 pr-4"><TimeOffStatusBadge status={r.status} /></td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleAction(e, r.id, "approved")}
                          disabled={r.status === "approved"}
                          className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => handleAction(e, r.id, "refused")}
                          disabled={r.status === "refused"}
                          className="border border-surface-border disabled:opacity-40 text-text-primary text-xs font-medium rounded-md px-3 py-1.5 hover:bg-surface-raised transition-colors"
                        >
                          Refuse
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">Request status should show the approval lifecycle clearly.</p>
      </div>
    </div>
  );
}