import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getContractById,
  createContract,
  updateContract,
  endContract,
  getEmployees,
  getDepartments,
  getWorkingSchedules,
} from "../../services/api";

const STATUS_OPTIONS = ["Draft", "Active", "Expired", "Cancelled"];

function toDateInputValue(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 10);
}

export default function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [formData, setFormData] = useState({
    employee: "",
    department: "",
    jobPosition: "",
    startDate: "",
    endDate: "",
    wage: "",
    workingSchedule: "",
    status: "Draft",
  });

  const [contractNumber, setContractNumber] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [emps, depts, scheds] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getWorkingSchedules(),
        ]);
        setEmployees(emps?.employees || []);
        setDepartments(depts || []);
        setSchedules(scheds || []);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    getContractById(id)
      .then((c) => {
        setContractNumber(c.contractNumber || "");
        setFormData({
          employee: c.employee?._id || c.employee || "",
          department: c.department?._id || c.department || "",
          jobPosition: c.jobPosition || "",
          startDate: toDateInputValue(c.startDate),
          endDate: toDateInputValue(c.endDate),
          wage: c.wage ?? "",
          workingSchedule: c.workingSchedule?._id || c.workingSchedule || "",
          status: c.status || "Draft",
        });
      })
      .catch((err) => {
        console.error("Failed to load contract:", err);
        setError("Failed to load contract details.");
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function buildPayload() {
    const payload = {
      jobPosition: formData.jobPosition || undefined,
      startDate: formData.startDate,
      wage: Number(formData.wage),
      status: formData.status,
    };
    if (formData.endDate) payload.endDate = formData.endDate;
    if (formData.department) payload.department = formData.department;
    if (formData.workingSchedule) payload.workingSchedule = formData.workingSchedule;
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isNew) {
        if (!formData.employee) {
          throw new Error("Please select an employee");
        }
        const created = await createContract({ employee: formData.employee, ...buildPayload() });
        navigate(`/contracts/${created._id}`);
      } else {
        await updateContract(id, buildPayload());
        navigate("/contracts");
      }
    } catch (err) {
      setError(err.message || "Failed to save contract.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEndContract() {
    if (!window.confirm("End this contract as of today? This sets it to Expired.")) return;
    setSubmitting(true);
    setError("");
    try {
      await endContract(id);
      navigate("/contracts");
    } catch (err) {
      setError(err.message || "Failed to end contract.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading contract…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/contracts")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Contracts
      </button>

      <form onSubmit={handleSubmit} className="panel p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">
              Contract {contractNumber ? `/ ${contractNumber}` : "/ New"}
            </h1>
            <p className="text-sm text-text-secondary">
              {isNew
                ? "The contract number is generated automatically once created."
                : "Editing an existing contract"}
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : isNew ? "Create Contract" : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee *</label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              disabled={!isNew} // backend doesn't support reassigning a contract to a different employee
              className="field-input disabled:opacity-60"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className="field-input">
              <option value="">Not set</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Start Date *</label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Job Position</label>
            <input
              name="jobPosition"
              value={formData.jobPosition}
              onChange={handleChange}
              placeholder="e.g. Payroll Specialist"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Wage / Month *</label>
            <input
              type="number"
              name="wage"
              required
              min="0"
              value={formData.wage}
              onChange={handleChange}
              placeholder="e.g. 85000"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="field-input">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {formData.status === "Active" && isNew && (
              <p className="text-xs text-text-muted mt-1">
                Setting this Active will automatically close out any other Active contract this employee has.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Working Schedule</label>
            <select name="workingSchedule" value={formData.workingSchedule} onChange={handleChange} className="field-input">
              <option value="">Not set</option>
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {!isNew && formData.status === "Active" && (
        <div className="panel p-6">
          <h2 className="text-sm font-semibold mb-2">End This Contract</h2>
          <p className="text-sm text-text-secondary mb-4">
            Marks this contract Expired as of today. Use this instead of manually editing status when a contract genuinely ends.
          </p>
          <button
            type="button"
            onClick={handleEndContract}
            disabled={submitting}
            className="border border-red-500/40 text-red-500 hover:bg-red-500/10 text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            End Contract
          </button>
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">
        For payroll purposes, an employee should not have more than one Active contract at a time.
      </p>
    </div>
  );
}