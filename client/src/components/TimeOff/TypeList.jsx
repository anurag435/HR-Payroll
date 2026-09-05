import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTimeOffTypes } from "../../services/api";

export default function TypeList() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getTimeOffTypes().then((data) => {
      setTypes(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => types.filter((t) => t.typeName.toLowerCase().includes(search.toLowerCase())),
    [types, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Time Off Types</h1>
        <p className="text-sm text-text-secondary mb-5">List view opened from Time Off ▾ → Time Off Types</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/timeoff/types/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search time off types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-[200px]"
          />
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading types…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Unit</th>
                  <th className="py-2 pr-4 font-medium">Allocation</th>
                  <th className="py-2 pr-4 font-medium">Approval</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">
                      No time off types match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/timeoff/types/${t.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{t.typeName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.unit}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.requiresAllocation ? "Required" : "No"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{t.approval}</td>
                    <td className="py-3 pr-4">
                      <span className={t.active ? "badge-active" : "badge-inactive"}>
                        {t.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">This list defines policy rules, not employee transactions.</p>
      </div>
    </div>
  );
}