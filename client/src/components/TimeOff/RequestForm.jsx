import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTimeOffRequestById, setRequestStatus } from "../../services/api";

export default function RequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    if (id === "new") {
      setRequest(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTimeOffRequestById(id).then((data) => {
      setRequest(data);
      setLoading(false);
    });
  }

  useEffect(load, [id]);

  async function handleAction(status) {
    setSaving(true);
    try {
      await setRequestStatus(id, status);
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading request…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/requests")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Requests
      </button>

      <div className="panel p-6 mb-6">
        <h1 className="text-lg font-semibold mb-1">
          Time Off Request {request ? `/ ${request.employeeName}` : "/ New"}
        </h1>
        <p className="text-sm text-text-secondary mb-4">Form view of one request</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleAction("approved")}
            disabled={saving || request?.status === "approved"}
            className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("refused")}
            disabled={saving || request?.status === "refused"}
            className="border border-surface-border disabled:opacity-40 text-text-primary text-sm font-medium rounded-md px-4 py-2 hover:bg-surface-raised transition-colors"
          >
            Refuse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee</label>
            <input defaultValue={request?.employeeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Duration</label>
            <input defaultValue={request?.duration ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Time Off Type</label>
            <input defaultValue={request?.typeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <input
              defaultValue={
                request?.status === "approved" ? "Approved" : request?.status === "to_approve" ? "To Approve" : request?.status === "refused" ? "Refused" : ""
              }
              className="field-input"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Start Date</label>
            <input defaultValue={request?.startDate ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Approver</label>
            <input defaultValue={request?.approver ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">End Date</label>
            <input defaultValue={request?.endDate ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Allocation Used</label>
            <input defaultValue={request?.allocationUsed ?? "—"} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-2">Reason</h2>
        <p className="text-sm text-text-secondary">{request?.reason ?? ""}</p>
      </div>

      <p className="text-xs text-text-muted mt-4">
        If the selected type requires allocation, the request should clearly show which balance was consumed.
      </p>
    </div>
  );
}