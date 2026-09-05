import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSalaryStructures } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

export default function SalaryStructureList() {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalaryStructures()
      .then((data) => setStructures(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load salary structures:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="panel p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold">Salary Structures</h1>
            <p className="text-sm text-text-secondary mb-5">Ordered sets of Salary Rules, assigned to contracts and used by Payruns</p>
          </div>
          <button
            onClick={() => navigate("/payroll/salary-structures/new")}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            + New Structure
          </button>
        </div>

        {loading && <p className="text-sm text-text-muted py-6 text-center">Loading structures…</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-surface-border">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Rules</th>
                  <th className="py-2 pr-4 font-medium">Company</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {structures.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-muted">
                      No salary structures yet. Create your Salary Rules first, then group them here.
                    </td>
                  </tr>
                )}
                {structures.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => navigate(`/payroll/salary-structures/${s._id}`)}
                    className="cursor-pointer border-b border-surface-border/60 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.rules?.length ?? 0} rule(s)</td>
                    <td className="py-3 pr-4 text-text-secondary">{s.company}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={s.isActive ? "Active" : "Inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
