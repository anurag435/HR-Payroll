import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSalaryRules } from "../../services/api";

const CATEGORY_STYLE = {
  Basic: "badge-active",
  Allowance: "badge-active",
  Gross: "badge-pending",
  Deduction: "badge-danger",
  Net: "badge-pending",
};

export default function SalaryRuleList() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalaryRules()
      .then((data) => setRules(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load salary rules:", err))
      .finally(() => setLoading(false));
  }, []);

  function describeCompute(r) {
    if (r.computeType === "Fixed") return `Fixed ₹${Number(r.fixedAmount || 0).toLocaleString("en-IN")}`;
    if (r.computeType === "Percentage") return `${r.percentageValue}% of ${r.percentageOf}`;
    return `Formula: ${r.formula}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold">Salary Rules</h1>
            <p className="text-sm text-text-secondary mb-5">Building blocks used inside Salary Structures</p>
          </div>
          <button
            onClick={() => navigate("/payroll/salary-rules/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New Rule
          </button>
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading rules…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Seq</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Code</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Computation</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted">
                      No salary rules yet. Click "+ New Rule" to define one (e.g. Basic Salary, HRA, PF Deduction).
                    </td>
                  </tr>
                )}
                {rules.map((r) => (
                  <tr
                    key={r._id}
                    onClick={() => navigate(`/payroll/salary-rules/${r._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 text-text-secondary">{r.sequence}</td>
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-text-secondary font-mono text-xs">{r.code}</td>
                    <td className="py-3 pr-4">
                      <span className={CATEGORY_STYLE[r.category] || "badge-inactive"}>{r.category}</span>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{describeCompute(r)}</td>
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
