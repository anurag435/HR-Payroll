import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../../services/api";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      // New employee - no data needs to be fetched
      if (id === "new") {
        setEmployee(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await getEmployeeById(id);

        setEmployee(data);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-text-muted text-center py-16">
        Loading employee…
      </p>
    );
  }

  const smartButtons = [
    { label: "Contracts", count: 0, to: "/contracts" },
    { label: "Attendance", count: 0, to: employee ? `/attendance?employee=${encodeURIComponent(employee.name)}` : "/attendance" },
    { label: "Time Off", count: 0, to: "/timeoff/requests" },
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

      <div className="panel p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">
              {employee ? employee.name : "New Employee"}
            </h1>

            <p className="text-sm text-text-secondary">
              {employee?.jobPosition ?? "Job position"}
            </p>
          </div>

          <span
            className={
              employee?.status === "active"
                ? "badge-active"
                : "badge-inactive"
            }
          >
            {employee?.status === "active" ? "Active" : "New"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Work Email
            </label>

            <input
              defaultValue={employee?.workEmail ?? ""}
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Department
            </label>

            <input
              defaultValue={employee?.department ?? ""}
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Manager
            </label>

            <input
              placeholder="Not set"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">
              Working Schedule
            </label>

            <input
              placeholder="Not assigned"
              className="field-input"
            />
          </div>
        </div>
      </div>

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

      <p className="text-xs text-text-muted mt-4">
        This form is a placeholder based on your spec (identity, department,
        manager, schedule, plus links to related records).
      </p>
    </div>
  );
}