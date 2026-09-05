import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllocationById, setAllocationStatus } from "../../services/api";

export default function AllocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    if (id === "new") {
      setAllocation(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllocationById(id).then((data) => {
      setAllocation(data);
      setLoading(false);
    });
  }

  useEffect(load, [id]);

  async function handleAction(status) {
    setSaving(true);
    try {
      await setAllocationStatus(id, status);
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading allocation…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/allocations")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Allocations
      </button>

      <div className="panel p-6 mb-6">
        <h1 className="text-lg font-semibold mb-1">
          Allocation {allocation ? `/ ${allocation.employeeName}` : "/ New"}
        </h1>
        <p className="text-sm text-text-secondary mb-4">Form view of one allocation record</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleAction("approved")}
            disabled={saving || allocation?.status === "approved"}
            className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("refused")}
            disabled={saving || allocation?.status === "refused"}
            className="border border-surface-border disabled:opacity-40 text-text-primary text-sm font-medium rounded-md px-4 py-2 hover:bg-surface-raised transition-colors"
          >
            Refuse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee</label>
            <input defaultValue={allocation?.employeeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Taken</label>
            <input defaultValue={allocation ? `${allocation.taken} Days` : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Time Off Type</label>
            <input defaultValue={allocation?.typeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Remaining</label>
            <input defaultValue={allocation ? `${allocation.remaining} Days` : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Allocated</label>
            <input defaultValue={allocation ? `${allocation.allocated} Days` : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Approver</label>
            <input defaultValue={allocation?.approver ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <input
              defaultValue={
                allocation?.status === "approved" ? "Approved" : allocation?.status === "to_approve" ? "To Approve" : allocation?.status === "refused" ? "Refused" : ""
              }
              className="field-input"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Validity</label>
            <input defaultValue={allocation?.validity ?? ""} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-2">Description</h2>
        <p className="text-sm text-text-secondary">{allocation?.description ?? ""}</p>
      </div>

      <p className="text-xs text-text-muted mt-4">
        Approved allocation is what creates available leave balance for the employee.
      </p>
    </div>
  );
}