import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContractById } from "../../services/api";

export default function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setContract(null);
      setLoading(false);
      return;
    }
    getContractById(id).then((data) => {
      setContract(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading contract…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/contracts")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Contracts
      </button>

      <div className="panel p-6 mb-6">
        <h1 className="text-lg font-semibold">
          Contract {contract ? `/ ${contract.contractNumber}` : "/ New"}
        </h1>
        <p className="text-sm text-text-secondary mb-6">Form view of one contract</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee</label>
            <input defaultValue={contract?.employeeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Department</label>
            <input defaultValue={contract?.department ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Start Date</label>
            <input defaultValue={contract?.startDate ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Job Position</label>
            <input defaultValue={contract?.jobPosition ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">End Date</label>
            <input defaultValue={contract?.endDate ?? ""} placeholder="—" className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Wage / Month</label>
            <input defaultValue={contract ? `₹${contract.wageMonth.toLocaleString("en-IN")}` : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <input
              defaultValue={contract?.status === "running" ? "Running" : contract?.status === "expired" ? "Expired" : ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Working Schedule</label>
            <input defaultValue={contract?.workingSchedule ?? ""} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-2">Salary Structure / Notes</h2>
        <p className="text-sm text-text-secondary">{contract?.notes ?? "No notes for this contract yet."}</p>
      </div>

      <p className="text-xs text-text-muted mt-4">
        For the problem statement, one employee should not have multiple Running contracts for the same period.
      </p>
    </div>
  );
}