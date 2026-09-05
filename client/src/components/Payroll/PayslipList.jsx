import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPayslips } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function PayslipList() {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPayslips()
      .then((data) => setPayslips(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load payslips:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payslips.filter(
      (p) =>
        (p.employee?.name || "").toLowerCase().includes(q) ||
        (p.payrun?.label || "").toLowerCase().includes(q)
    );
  }, [payslips, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Payslips</h1>
        <p className="text-sm text-text-secondary mb-5">All generated payslips across every payrun</p>

        <input
          type="text"
          placeholder="Search by employee or payrun…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input mb-5 max-w-sm"
        />

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading payslips…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Payrun</th>
                  <th className="py-2 pr-4 font-medium">Period</th>
                  <th className="py-2 pr-4 font-medium">Gross</th>
                  <th className="py-2 pr-4 font-medium">Net</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-text-muted">
                      No payslips match.
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/payroll/payslips/${p._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{p.employee?.name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{p.payrun?.label || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatDate(p.period?.startDate)} – {formatDate(p.period?.endDate)}
                    </td>
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
        )}
      </div>
    </div>
  );
}
