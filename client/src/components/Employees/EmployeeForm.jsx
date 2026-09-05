import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEmployeeById,
  createEmployee,
  updateEmployee,
  createUser,
  getDepartments,
  getEmployees,
  getWorkingSchedules,
} from "../../services/api";

// Must match the backend's ROLES enum exactly (constants/roles.js) —
// these strings are sent as-is to POST /auth/users.
const ROLE_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "HRManager", label: "HR Manager" },
  { value: "HRPayrollUser", label: "HR Payroll User" },
  { value: "HRPayrollManager", label: "HR Payroll Manager" },
  { value: "Admin", label: "Admin" },
];

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dropdown option lists, fetched from the backend (these are real
  // ObjectIds — department/manager/workingSchedule can't be free text,
  // the backend validates and dereferences them).
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [relatedCounts, setRelatedCounts] = useState({ contracts: 0, attendance: 0, timeOff: 0 });

  const [formData, setFormData] = useState({
    name: "",
    email: "", // backend field is `email`, not `workEmail`
    jobPosition: "",
    department: "",
    manager: "",
    workingSchedule: "",
    // Only used when isNew — these create the linked login account
    // via a SECOND api call (createUser) after the Employee is created.
    role: "Employee",
    password: "",
  });

  // Load dropdown option lists once, regardless of create/edit mode.
  useEffect(() => {
    async function loadOptions() {
      try {
        const [depts, emps, scheds] = await Promise.all([
          getDepartments(),
          getEmployees(),
          getWorkingSchedules(),
        ]);
        setDepartments(depts || []);
        setManagers(emps?.employees || []);
        setSchedules(scheds || []);
      } catch (err) {
        // Non-fatal — the form still works without dropdown data, the
        // relevant fields just won't have options to pick from yet.
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

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // getEmployeeById returns { employee, relatedCounts } — NOT the
        // employee document directly.
        const { employee: emp, relatedCounts: counts } = await getEmployeeById(id);

        setFormData({
          name: emp.name || "",
          email: emp.email || "",
          jobPosition: emp.jobPosition || "",
          department: emp.department?._id || emp.department || "",
          manager: emp.manager?._id || emp.manager || "",
          workingSchedule: emp.workingSchedule?._id || emp.workingSchedule || "",
          role: "Employee",
          password: "",
        });
        setRelatedCounts(counts || { contracts: 0, attendance: 0, timeOff: 0 });
      } catch (err) {
        console.error("Failed to fetch employee:", err);
        setError("Failed to load employee details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Strips empty-string reference fields so we never send department: ""
   * to the backend — Zod's ObjectId validator will reject an empty
   * string, whereas omitting the field entirely is valid (it's optional).
   */
  function buildEmployeePayload(data) {
    const payload = {
      name: data.name,
      email: data.email,
      jobPosition: data.jobPosition || undefined,
    };
    if (data.department) payload.department = data.department;
    if (data.manager) payload.manager = data.manager;
    if (data.workingSchedule) payload.workingSchedule = data.workingSchedule;
    return payload;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isNew) {
        // Step 1: create the Employee (HR record) — no password/role here,
        // the backend's Employee model doesn't know about logins at all.
        const employee = await createEmployee(buildEmployeePayload(formData));
        const employeeId = employee._id;

        // Step 2: create the linked login account. This call requires the
        // CURRENT logged-in user to be an Admin — the backend enforces
        // this with requireRole([Admin]) on POST /auth/users regardless
        // of what the frontend shows.
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          employee: employeeId,
        });

        navigate(`/employees/${employeeId}`);
      } else {
        // Edit mode: only the Employee record is updated here. Changing
        // someone's role/password is a separate concern — use
        // updateUserRole() from a Users/Accounts screen, not this form.
        await updateEmployee(id, buildEmployeePayload(formData));
        navigate(`/employees/${id}`);
      }
    } catch (err) {
      setError(err.message || "Failed to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-text-muted text-center py-16">
        Loading employee…
      </p>
    );
  }

  const smartButtons = [
    { label: "Contracts", count: relatedCounts.contracts, to: "/contracts" },
    { label: "Attendance", count: relatedCounts.attendance, to: "/attendance" },
    { label: "Time Off", count: relatedCounts.timeOff, to: "/timeoff/requests" },
    { label: "Allocations", count: 0, to: "/timeoff/allocations" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/employees")}
        className="text-sm text-accent hover:text-accent-hover mb-4"
      >
        ← Back to Employees
      </button>

      <form onSubmit={handleSubmit} className="panel p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">
              {isNew ? "New Employee" : formData.name || "Employee Details"}
            </h1>
            <p className="text-sm text-text-secondary">
              {formData.jobPosition || "Job position"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={isNew ? "badge-inactive" : "badge-active"}>
              {isNew ? "New" : "Active"}
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : isNew ? "Create Employee" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Full Name *
            </label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Work Email *
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Job Position
            </label>
            <input
              name="jobPosition"
              value={formData.jobPosition}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Not set</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Manager
            </label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Not set</option>
              {managers
                .filter((m) => m._id !== id) // an employee can't manage themselves
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Working Schedule
            </label>
            <select
              name="workingSchedule"
              value={formData.workingSchedule}
              onChange={handleChange}
              className="field-input"
            >
              <option value="">Not set</option>
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {isNew && (
            <>
              <div className="sm:col-span-2 pt-2 border-t border-surface-border" />

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">
                  Login Role *
                </label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="field-input"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-1">
                  Controls what this person can access after logging in.
                </p>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">
                  Initial Account Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="field-input"
                />
                <p className="text-xs text-text-muted mt-1">
                  The employee signs in with their work email and this password.
                </p>
              </div>
            </>
          )}
        </div>
      </form>

      {!isNew && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {smartButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => navigate(btn.to)}
              className="panel p-4 text-left hover:border-accent/50 transition-colors"
            >
              <p className="text-xl font-semibold">{btn.count}</p>
              <p className="text-xs text-text-secondary">{btn.label}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}