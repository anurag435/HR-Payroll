import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTimeOffTypeById } from "../../services/api";

export default function TypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setType(null);
      setLoading(false);
      return;
    }
    getTimeOffTypeById(id).then((data) => {
      setType(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading time off type…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/timeoff/types")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Time Off Types
      </button>

      <div className="panel p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">
            Time Off Type {type ? `/ ${type.typeName}` : "/ New"}
          </h1>
          <button className="border border-surface-border text-text-primary text-sm font-medium rounded-md px-4 py-2 hover:bg-surface-raised transition-colors">
            Edit
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-6">Form view of one time off type</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Type Name</label>
            <input defaultValue={type?.typeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Approval</label>
            <input defaultValue={type?.approval ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Unit</label>
            <input defaultValue={type?.unit ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Payroll / Work Entry</label>
            <input defaultValue={type?.payrollWorkEntry ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Requires Allocation</label>
            <input defaultValue={type ? (type.requiresAllocation ? "Yes" : "No") : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Display Color</label>
            <input defaultValue={type?.displayColor ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Active</label>
            <input defaultValue={type ? (type.active ? "True" : "False") : ""} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-2">Configuration Notes</h2>
        <p className="text-sm text-text-secondary">{type?.notes ?? ""}</p>
      </div>

      <p className="text-xs text-text-muted mt-4">
        Time Off Type drives approval behavior and whether a request needs an allocation.
      </p>
    </div>
  );
}