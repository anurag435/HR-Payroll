import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContracts } from "../../services/api";

function StatusPill({ status }) {
  const styles = {
    Active: "badge-active",
    Draft: "badge-pending",
    Expired: "badge-inactive",
    Cancelled: "badge-inactive",
  };
  return <span className={styles[status] || "badge-inactive"}>{status}</span>;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ContractList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getContracts()
      .then((data) => setContracts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load contracts:", err);
        setContracts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        (c.employee?.name || "").toLowerCase().includes(q) ||
        (c.contractNumber || "").toLowerCase().includes(q)
    );
  }, [contracts, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Contracts</h1>
        <p className="text-sm text-text-secondary mb-5">List view of employee contracts</p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/contracts/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New
          </button>
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input flex-1 min-w-50"
          />
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading contracts…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Contract</th>
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Start</th>
                  <th className="py-2 pr-4 font-medium">End</th>
                  <th className="py-2 pr-4 font-medium">Wage / Month</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      No contracts match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/contracts/${c._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{c.contractNumber}</td>
                    <td className="py-3 pr-4 text-text-secondary">{c.employee?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(c.startDate)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(c.endDate)}</td>
                    <td className="py-3 pr-4 text-text-secondary">₹{Number(c.wage || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 pr-4"><StatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-text-muted mt-5">
          Retain contract history, but keep the active contract obvious — payroll depends on it.
        </p>
      </div>
    </div>
  );
}