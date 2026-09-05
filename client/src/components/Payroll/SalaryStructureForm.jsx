import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSalaryStructureById,
  createSalaryStructure,
  updateSalaryStructure,
  getSalaryRules,
} from "../../services/api";

export default function SalaryStructureForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [allRules, setAllRules] = useState([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("My Company");
  const [isActive, setIsActive] = useState(true);
  const [selectedRuleIds, setSelectedRuleIds] = useState(new Set());

  useEffect(() => {
    getSalaryRules()
      .then((rules) => setAllRules(Array.isArray(rules) ? rules : []))
      .catch((err) => console.error("Failed to load salary rules:", err));
  }, []);

  useEffect(() => {
    if (isNew) return;
    getSalaryStructureById(id)
      .then((s) => {
        setName(s.name || "");
        setCompany(s.company || "My Company");
        setIsActive(s.isActive ?? true);
        setSelectedRuleIds(new Set((s.rules || []).map((r) => r._id || r)));
      })
      .catch((err) => setError(err.message || "Failed to load structure."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function toggleRule(ruleId) {
    setSelectedRuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = { name, company, isActive, rules: Array.from(selectedRuleIds) };
    try {
      if (isNew) {
        const created = await createSalaryStructure(payload);
        navigate(`/payroll/salary-structures/${created._id}`);
      } else {
        await updateSalaryStructure(id, payload);
        navigate("/payroll/salary-structures");
      }
    } catch (err) {
      setError(err.message || "Failed to save structure.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading structure…</p>;

  const sortedRules = [...allRules].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/payroll/salary-structures")}
        className="text-sm text-accent hover:text-accent-hover mb-4"
      >
        ← Back to Salary Structures
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">{isNew ? "New Salary Structure" : "Edit Salary Structure"}</h1>
            <p className="text-sm text-text-secondary">Pick which rules run for employees on this structure</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : isNew ? "Create Structure" : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="e.g. Regular Salary" required />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className="field-input" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-accent"
            />
            <label htmlFor="isActive" className="text-sm">
              Active (available for use on contracts and payruns)
            </label>
          </div>
        </div>

        <h2 className="text-sm font-semibold mb-2">Rules ({selectedRuleIds.size} selected)</h2>
        <p className="text-xs text-text-muted mb-3">
          Rules run in their own sequence order automatically — no need to reorder here.
        </p>

        <div className="border border-surface-border rounded-md max-h-96 overflow-y-auto">
          {sortedRules.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              No salary rules exist yet — create them under Payroll → Salary Rules first.
            </p>
          )}
          {sortedRules.map((r) => (
            <label
              key={r._id}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-border/60 last:border-0 hover:bg-surface-raised cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedRuleIds.has(r._id)}
                onChange={() => toggleRule(r._id)}
                className="accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {r.sequence}. {r.name}{" "}
                  <span className="text-xs text-text-muted font-mono">({r.code})</span>
                </p>
                <p className="text-xs text-text-secondary">{r.category}</p>
              </div>
            </label>
          ))}
        </div>
      </form>
    </div>
  );
}
