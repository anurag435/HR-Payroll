import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPayrunById,
  getPayslips,
  getSalaryStructureById,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
  sendPayslips,
} from "../../services/api";

const STATUS_LABEL = {
  draft: "Draft",
  computed: "Computed",
  validated: "Validated",
  paid: "Paid",
};

const WARNING_LABEL = {
  missing_account: "A/C missing",
  duplicate: "Duplicate",
};

function fmtMoney(n) {
  return `₹${Math.round(n).toLocaleString()}`;
}

function fmtRange(start, end) {
  const opts = { day: "2-digit", month: "short" };
  return `${new Date(start).toLocaleDateString("en-US", opts)} — ${new Date(end).toLocaleDateString("en-US", opts)}`;
}

export default function PayrunProcessing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payrun, setPayrun] = useState(null);
  const [structure, setStructure] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    getPayrunById(id).then(async (pr) => {
      setPayrun(pr);
      const [struct, slips] = await Promise.all([
        getSalaryStructureById(pr.structureId),
        getPayslips({ payrunId: id }),
      ]);
      setStructure(struct);
      setPayslips(slips);
      setLoading(false);
    });
  }

  useEffect(load, [id]);

  async function runAction(action) {
    setBusy(true);
    try {
      await action(id);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (loading || !payrun) {
    return <p className="text-sm text-text-muted text-center py-16">Loading payrun…</p>;
  }

  const canCompute = payrun.status === "draft";
  const canValidate = payrun.status === "computed";
  const canMarkPaid = payrun.status === "validated";
  const canSend = payrun.status === "validated" || payrun.status === "paid";

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/payroll/payruns")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Payruns
      </button>

      <div className="panel p-6">
        <h1 className="text-lg font-semibold mb-1">Payrun / {payrun.name}</h1>
        <p className="text-sm text-text-secondary mb-5">Open one Payrun to compute and manage its payslips</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => runAction(computePayrun)}
            disabled={busy || !canCompute}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-40"
          >
            Compute
          </button>
          <button
            onClick={() => runAction(validatePayrun)}
            disabled={busy || !canValidate}
            className="border border-surface-border text-sm font-medium rounded-md px-4 py-2 hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            Validate
          </button>
          <button
            onClick={() => runAction(markPayrunPaid)}
            disabled={busy || !canMarkPaid}
            className="border border-surface-border text-sm font-medium rounded-md px-4 py-2 hover:bg-surface-raised transition-colors disabled:opacity-40"
          >
            Mark Paid
          </button>
          <button
            onClick={() => runAction(sendPayslips)}
            disabled={busy || !canSend}
            className="ml-auto bg-accent/90 hover:bg-accent text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-40"
          >
            Send Payslips
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Name</label>
            <input value={payrun.name} disabled className="field-input opacity-80" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Salary Structure</label>
            <input value={structure?.name ?? ""} disabled className="field-input opacity-80" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Period</label>
            <input value={fmtRange(payrun.periodStart, payrun.periodEnd)} disabled className="field-input opacity-80" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <input value={STATUS_LABEL[payrun.status]} disabled className="field-input opacity-80" />
          </div>
        </div>

        <h2 className="text-sm font-semibold mb-3">Payslips in this Payrun</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-surface-border">
                <th className="py-2 pr-4 font-medium">Employee</th>
                <th className="py-2 pr-4 font-medium">Warning</th>
                <th className="py-2 pr-4 font-medium">Worked</th>
                <th className="py-2 pr-4 font-medium">Basic</th>
                <th className="py-2 pr-4 font-medium">Gross</th>
                <th className="py-2 pr-4 font-medium">Net</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((ps) => {
                const basicLine = ps.lines.find((l) => l.code === "BASIC");
                return (
                  <tr
                    key={ps.id}
                    onClick={() => navigate(`/payroll/payslips/${ps.id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised"
                  >
                    <td className="py-2.5 pr-4">{ps.employeeName}</td>
                    <td className="py-2.5 pr-4">
                      {ps.warning ? (
                        <span className="text-status-pending text-xs font-medium">{WARNING_LABEL[ps.warning]}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-text-secondary">{ps.workedDays || "—"}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{basicLine ? fmtMoney(basicLine.amount) : "—"}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{ps.gross ? fmtMoney(ps.gross) : "—"}</td>
                    <td className="py-2.5 pr-4 text-text-secondary">{ps.net ? fmtMoney(ps.net) : "—"}</td>
                    <td className="py-2.5 pr-4">
                      <span className={ps.status === "draft" ? "text-text-muted text-xs" : "text-status-active text-xs font-medium"}>
                        {ps.status === "draft" ? "Draft" : "Done"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-accent text-xs font-medium">PDF</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-text-muted mt-5">
          Warnings such as missing account data or duplicate payslips should be visible before payroll is finalized.
        </p>
      </div>
    </div>
  );
}