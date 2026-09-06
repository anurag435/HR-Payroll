import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSalaryStructures, getEmployees, getDepartments, createPayrun } from "../../services/api";

export default function PayrunWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ---- options ----
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ---- step 1 fields ----
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salaryStructure, setSalaryStructure] = useState("");

  // ---- step 2 fields ----
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    Promise.all([getSalaryStructures(), getEmployees({ status: "Active", limit: 100 }), getDepartments()])
      .then(([structs, empData, depts]) => {
        setStructures(Array.isArray(structs) ? structs : []);
        setEmployees(empData?.employees || []);
        setDepartments(Array.isArray(depts) ? depts : []);
      })
      .catch((err) => {
        console.error("Failed to load wizard options:", err);
        setError(err.message || "Failed to load options.");
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const matchesDept = !departmentFilter || (e.department?._id || e.department) === departmentFilter;
      const matchesSearch = !q || e.name.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [employees, departmentFilter, search]);

  function toggleEmployee(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredEmployees.forEach((e) => next.add(e._id));
      return next;
    });
  }

  function clearAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredEmployees.forEach((e) => next.delete(e._id));
      return next;
    });
  }

  function goToStep2(e) {
    e.preventDefault();
    setError("");
    if (!label.trim()) return setError("Please enter a label for this payrun.");
    if (!startDate || !endDate) return setError("Please select the period start and end dates.");
    if (new Date(endDate) <= new Date(startDate)) return setError("End date must be after start date.");
    if (!salaryStructure) return setError("Please select a salary structure.");
    setStep(2);
  }

  async function handleCreate() {
    setError("");
    if (selectedIds.size === 0) {
      setError("Select at least one employee before creating the payrun.");
      return;
    }
    setSubmitting(true);
    try {
      const payrun = await createPayrun({
        label: label.trim(),
        period: { startDate, endDate },
        salaryStructure,
        employees: Array.from(selectedIds),
      });
      navigate(`/payroll/payruns/${payrun._id}`);
    } catch (err) {
      setError(err.message || "Failed to create payrun.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingOptions) {
    return <p className="text-sm text-text-muted text-center py-16">Loading…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/payroll")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Payroll
      </button>

      <div className="panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <StepDot active={step === 1} done={step > 1} label="1" />
          <span className={`text-sm ${step === 1 ? "font-medium" : "text-text-secondary"}`}>Scope & Period</span>
          <div className="flex-1 h-px bg-surface-border" />
          <StepDot active={step === 2} done={false} label="2" />
          <span className={`text-sm ${step === 2 ? "font-medium" : "text-text-secondary"}`}>Employee Selection</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={goToStep2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-xs text-text-secondary mb-1.5">Label *</label>
                <input
                  className="field-input"
                  placeholder="e.g. February 2026 Payroll"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Period Start *</label>
                <input
                  type="date"
                  className="field-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Period End *</label>
                <input
                  type="date"
                  className="field-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-text-secondary mb-1.5">Salary Structure *</label>
                <select
                  className="field-input"
                  value={salaryStructure}
                  onChange={(e) => setSalaryStructure(e.target.value)}
                  required
                >
                  <option value="">Select salary structure</option>
                  {structures.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {structures.length === 0 && (
                  <p className="text-xs text-status-pending mt-1.5">
                    No salary structures configured yet. Create one under Payroll → Salary Structures first.
                  </p>
                )}
              </div>
            </div>
            <button type="submit" className="btn-primary w-auto px-6">
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <input
                type="text"
                placeholder="Search employees…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field-input flex-1 min-w-48"
              />
              <select
                className="field-input w-48"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={selectAllVisible} className="text-sm text-accent hover:text-accent-hover">
                Select all shown
              </button>
              <button type="button" onClick={clearAllVisible} className="text-sm text-text-secondary hover:text-text-primary">
                Clear shown
              </button>
            </div>

            <div className="border border-surface-border rounded-md max-h-96 overflow-y-auto mb-4">
              {filteredEmployees.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">No employees match.</p>
              )}
              {filteredEmployees.map((emp) => (
                <label
                  key={emp._id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-border/60 last:border-0 hover:bg-surface-raised cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(emp._id)}
                    onChange={() => toggleEmployee(emp._id)}
                    className="accent-accent"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-text-secondary">
                      {emp.jobPosition || "—"} · {emp.department?.name || "No department"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">{selectedIds.size} employee(s) selected</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-text-secondary hover:text-text-primary px-4 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-5 py-2 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating…" : "Create Payrun"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, done, label }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
        active || done ? "bg-accent text-white" : "bg-surface-raised text-text-muted"
      }`}
    >
      {label}
    </div>
  );
}
