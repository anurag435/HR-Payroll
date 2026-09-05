import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPayrunById, computePayrun, validatePayrun, markPayrunPaid } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function PayrunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payrun, setPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    return getPayrunById(id)
      .then((data) => {
        setPayrun(data.payrun);
        setPayslips(data.payslips || []);
      })
      .catch((err) => {
        console.error("Failed to load payrun:", err);
        setError(err.message || "Failed to load payrun.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(action, fn, successMsg) {
    setActionLoading(action);
    setError("");
    setNotice("");
    try {
      await fn(id);
      await load();
      setNotice(successMsg);
    } catch (err) {
      setError(err.message || `Failed to ${action}.`);
    } finally {
      setActionLoading("");
    }
  }

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading payrun…</p>;
  if (!payrun) return <p className="text-sm text-text-muted text-center py-16">Payrun not found.</p>;

  const status = payrun.status;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/payroll")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Payroll
      </button>

      <div className="panel p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-semibold">{payrun.label}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-text-secondary">
              {formatDate(payrun.period?.startDate)} – {formatDate(payrun.period?.endDate)} ·{" "}
              {payrun.salaryStructure?.name || "—"} · {payrun.employees?.length ?? 0} employee(s)
            </p>
          </div>

          <div className="flex gap-2">
            {status === "Draft" && (
              <ActionButton
                label="Compute"
                loading={actionLoading === "compute"}
                onClick={() => runAction("compute", computePayrun, "Payrun computed.")}
              />
            )}
            {status === "Processing" && (
              <>
                <ActionButton
                  label="Recompute"
                  variant="secondary"
                  loading={actionLoading === "compute"}
                  onClick={() => runAction("compute", computePayrun, "Payrun recomputed.")}
                />
                <ActionButton
                  label="Validate"
                  loading={actionLoading === "validate"}
                  onClick={() => runAction("validate", validatePayrun, "Payrun validated.")}
                />
              </>
            )}
            {status === "Validated" && (
              <ActionButton
                label="Mark Paid"
                loading={actionLoading === "mark-paid"}
                onClick={() => runAction("mark-paid", markPayrunPaid, "Payrun marked as paid.")}
              />
            )}
            {status === "Paid" && (
              <span className="text-xs text-text-muted self-center">Finalized — no further changes.</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
            {error}
          </div>
        )}
        {notice && !error && (
          <div className="mb-4 p-3 bg-status-active/10 border border-status-active/20 text-status-active text-sm rounded-md">
            {notice}
          </div>
        )}

        {payrun.warnings?.length > 0 && (
          <div className="mb-2 p-3 bg-status-pending/10 border border-status-pending/20 rounded-md">
            <p className="text-sm font-medium text-status-pending mb-1">
              {payrun.warnings.length} warning(s) — these employees were skipped:
            </p>
            <ul className="text-xs text-text-secondary list-disc pl-5 space-y-0.5">
              {payrun.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-4">Payslips ({payslips.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-surface-border">
                <th className="py-2 pr-4 font-medium">Employee</th>
                <th className="py-2 pr-4 font-medium">Gross</th>
                <th className="py-2 pr-4 font-medium">Net</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-muted">
                    No payslips yet — click Compute to generate them.
                  </td>
                </tr>
              )}
              {payslips.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/payroll/payslips/${p._id}`)}
                  className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                >
                  <td className="py-3 pr-4 font-medium">{p.employee?.name || "—"}</td>
                  <td className="py-3 pr-4 text-text-secondary">{formatMoney(p.gross)}</td>
                  <td className="py-3 pr-4 text-text-secondary">{formatMoney(p.net)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, loading, variant = "primary" }) {
  const base = "text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-accent hover:bg-accent-hover text-white"
      : "bg-surface-raised hover:bg-surface-border text-text-primary";
  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${styles}`}>
      {loading ? "Working…" : label}
    </button>
  );
}
