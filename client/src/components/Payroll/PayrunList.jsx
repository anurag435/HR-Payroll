import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPayruns } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PayrunList() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPayruns()
      .then((data) => setPayruns(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load payruns:", err);
        setError(err.message || "Failed to load payruns.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold">Payroll</h1>
            <p className="text-sm text-text-secondary mb-5">Payruns — batches of payslips for a period</p>
          </div>
          <button
            onClick={() => navigate("/payroll/payruns/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New Payrun
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">
            {error}
          </div>
        )}

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading payruns…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Label</th>
                  <th className="py-2 pr-4 font-medium">Period</th>
                  <th className="py-2 pr-4 font-medium">Salary Structure</th>
                  <th className="py-2 pr-4 font-medium">Employees</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payruns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">
                      No payruns yet. Click "+ New Payrun" to start one.
                    </td>
                  </tr>
                )}
                {payruns.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/payroll/payruns/${p._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{p.label}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatDate(p.period?.startDate)} – {formatDate(p.period?.endDate)}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{p.salaryStructure?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{p.employees?.length ?? 0}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={p.status} />
                    </td>
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
