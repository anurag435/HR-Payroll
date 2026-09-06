import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSalaryRuleById, createSalaryRule, updateSalaryRule, deleteSalaryRule } from "../../services/api";

const CATEGORY_OPTIONS = ["Basic", "Allowance", "Deduction", "Gross", "Net"];
const COMPUTE_OPTIONS = ["Fixed", "Percentage", "Formula"];

const EMPTY = {
  name: "",
  code: "",
  category: "Basic",
  sequence: 10,
  computeType: "Fixed",
  fixedAmount: 0,
  percentageOf: "",
  percentageValue: 0,
  formula: "",
};

export default function SalaryRuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(EMPTY);

  useEffect(() => {
    if (isNew) return;
    getSalaryRuleById(id)
      .then((r) =>
        setFormData({
          name: r.name || "",
          code: r.code || "",
          category: r.category || "Basic",
          sequence: r.sequence ?? 10,
          computeType: r.computeType || "Fixed",
          fixedAmount: r.fixedAmount ?? 0,
          percentageOf: r.percentageOf || "",
          percentageValue: r.percentageValue ?? 0,
          formula: r.formula || "",
        })
      )
      .catch((err) => setError(err.message || "Failed to load rule."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function buildPayload() {
    return {
      name: formData.name,
      code: formData.code.toUpperCase(),
      category: formData.category,
      sequence: Number(formData.sequence),
      computeType: formData.computeType,
      fixedAmount: formData.computeType === "Fixed" ? Number(formData.fixedAmount) : undefined,
      percentageOf: formData.computeType === "Percentage" ? formData.percentageOf.toUpperCase() : null,
      percentageValue: formData.computeType === "Percentage" ? Number(formData.percentageValue) : undefined,
      formula: formData.computeType === "Formula" ? formData.formula : null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isNew) {
        const created = await createSalaryRule(buildPayload());
        navigate(`/payroll/salary-rules/${created._id}`);
      } else {
        await updateSalaryRule(id, buildPayload());
        navigate("/payroll/salary-rules");
      }
    } catch (err) {
      setError(err.message || "Failed to save rule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this salary rule? This can't be undone.")) return;
    setSubmitting(true);
    setError("");
    try {
      await deleteSalaryRule(id);
      navigate("/payroll/salary-rules");
    } catch (err) {
      setError(err.message || "Failed to delete rule.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-text-muted text-center py-16">Loading rule…</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/payroll/salary-rules")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Salary Rules
      </button>

      <form onSubmit={handleSubmit} className="panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">{isNew ? "New Salary Rule" : "Edit Salary Rule"}</h1>
            <p className="text-sm text-text-secondary">Defines one line of the salary computation</p>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="text-sm text-status-danger hover:text-status-danger px-3 py-2 disabled:opacity-50"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : isNew ? "Create Rule" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} className="field-input" placeholder="e.g. Basic Salary" required />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Code * (unique)</label>
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="field-input font-mono"
              placeholder="e.g. BASIC"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} className="field-input" required>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Sequence * (processing order)</label>
            <input
              type="number"
              name="sequence"
              value={formData.sequence}
              onChange={handleChange}
              className="field-input"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-text-secondary mb-1.5">Computation Type *</label>
          <select name="computeType" value={formData.computeType} onChange={handleChange} className="field-input">
            {COMPUTE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {formData.computeType === "Fixed" && (
          <div className="mb-2">
            <label className="block text-xs text-text-secondary mb-1.5">Fixed Amount (₹) *</label>
            <input
              type="number"
              name="fixedAmount"
              value={formData.fixedAmount}
              onChange={handleChange}
              className="field-input max-w-xs"
              required
            />
          </div>
        )}

        {formData.computeType === "Percentage" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Percentage Of (rule code) *</label>
              <input
                name="percentageOf"
                value={formData.percentageOf}
                onChange={handleChange}
                className="field-input font-mono"
                placeholder="e.g. BASIC or CONTRACT_WAGE"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Percentage Value (%) *</label>
              <input
                type="number"
                name="percentageValue"
                value={formData.percentageValue}
                onChange={handleChange}
                className="field-input"
                required
              />
            </div>
          </div>
        )}

        {formData.computeType === "Formula" && (
          <div className="mb-2">
            <label className="block text-xs text-text-secondary mb-1.5">Formula *</label>
            <input
              name="formula"
              value={formData.formula}
              onChange={handleChange}
              className="field-input font-mono"
              placeholder="e.g. BASIC * 0.12 + 500"
              required
            />
            <p className="text-xs text-text-muted mt-1.5">
              Use +, -, *, /, %, parentheses, numbers and other rule codes (or CONTRACT_WAGE) as variables.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
