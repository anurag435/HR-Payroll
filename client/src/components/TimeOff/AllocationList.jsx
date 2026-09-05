import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllocations } from "../../services/api";
import { TimeOffStatusBadge } from "./statusBadges";

export default function AllocationList() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllocations().then((data) => {
      setAllocations(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => allocations.filter((a) => a.employeeName.toLowerCase().includes(search.toLowerCase())),
    [allocations, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Allocations</h1>
        <p className="text-sm text-text-secondary mb-5">List view opened from Time Off ▾ → Allocations</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/timeoff/allocations/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-[200px]"
          />
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading allocations…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Allocated</th>
                  <th className="py-2 pr-4 font-medium">Taken</th>
                  <th className="py-2 pr-4 font-medium">Remaining</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      No allocations match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/timeoff/allocations/${a.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{a.employeeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.typeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.allocated} days</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.taken} days</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.remaining} days</td>
                    <td className="py-3 pr-4"><TimeOffStatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">
          The list should expose the balance math at a glance — Allocated, Taken and Remaining.
        </p>
      </div>
    </div>
  );
}