import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPayslipById, getPayslipPdfUrl } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPayslipById(id)
      .then(setPayslip)
      .catch((err) => setError(err.message || "Failed to load payslip."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading payslip…</p>;
  if (error) return <p className="text-sm text-status-danger text-center py-16">{error}</p>;
  if (!payslip) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back
      </button>

      <div className="panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-semibold">{payslip.employee?.name}</h1>
              <StatusBadge status={payslip.status} />
            </div>
            <p className="text-sm text-text-secondary">{payslip.employee?.jobPosition}</p>
            <p className="text-sm text-text-secondary">{payslip.employee?.email}</p>
          </div>
          <a
            href={getPayslipPdfUrl(payslip._id)}
            target="_blank"
            rel="noreferrer"
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            Download PDF
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs text-text-secondary mb-1">Payrun</p>
            <p className="font-medium">{payslip.payrun?.label || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Period</p>
            <p className="font-medium">
              {formatDate(payslip.period?.startDate)} – {formatDate(payslip.period?.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Contract</p>
            <p className="font-medium">{payslip.contract?.contractNumber || "—"}</p>
          </div>
        </div>

        {payslip.warnings?.length > 0 && (
          <div className="mb-6 p-3 bg-status-pending/10 border border-status-pending/20 rounded-md">
            <p className="text-sm font-medium text-status-pending mb-1">Warnings</p>
            <ul className="text-xs text-text-secondary list-disc pl-5 space-y-0.5">
              {payslip.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="text-sm font-semibold mb-3">Salary Computation</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-surface-border">
                <th className="py-2 pr-4 font-medium">Component</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payslip.lines.map((line, i) => (
                <tr key={i} className="border-b border-surface-border/60">
                  <td className="py-2.5 pr-4">{line.name}</td>
                  <td className="py-2.5 pr-4 text-text-secondary">{line.category}</td>
                  <td className="py-2.5 pr-4 text-right">
                    {line.category === "Deduction" ? "-" : ""}
                    {formatMoney(line.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end gap-1 pt-3 border-t border-surface-border">
          <div className="flex gap-8 text-sm">
            <span className="text-text-secondary">Gross</span>
            <span className="font-medium w-28 text-right">{formatMoney(payslip.gross)}</span>
          </div>
          <div className="flex gap-8 text-base">
            <span className="font-semibold">Net Pay</span>
            <span className="font-semibold w-28 text-right">{formatMoney(payslip.net)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
