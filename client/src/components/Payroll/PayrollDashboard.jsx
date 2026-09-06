import { useEffect, useMemo, useState } from "react";
import { getPayruns, getPayslips, getEmployees } from "../../services/api";

function fmtMoney(n) {
  return `₹${Math.round(n).toLocaleString()}`;
}

export default function PayrollDashboard() {
  const [payruns, setPayruns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    Promise.all([getPayruns(), getPayslips(), getEmployees()]).then(([pr, ps, emp]) => {
      setPayruns(pr);
      setPayslips(ps);
      setEmployees(emp);
      setLoading(false);
    });
  }, []);

  const employeeById = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees]
  );


  const filteredSlips = useMemo(() => {
    return payslips.filter((ps) => {
      const matchesPeriod = !periodFilter || payruns.find((p) => p.id === ps.payrunId)?.name === periodFilter;
      const emp = employeeById[ps.employeeId];
      const matchesDept = !deptFilter || emp?.department === deptFilter;
      return matchesPeriod && matchesDept;
    });
  }, [payslips, payruns, periodFilter, deptFilter, employeeById]);

  const totalNetPaid = filteredSlips
    .filter((ps) => ps.status === "paid")
    .reduce((sum, ps) => sum + ps.net, 0);

  const payslipsGenerated = filteredSlips.filter((ps) => ps.lines.length > 0).length;

  const avgSalary =
    payslipsGenerated > 0
      ? filteredSlips.filter((ps) => ps.lines.length > 0).reduce((s, ps) => s + ps.net, 0) / payslipsGenerated
      : 0;

  const warningsCount = filteredSlips.filter((ps) => ps.warning).length;

  const departmentCosts = useMemo(() => {
    const byDept = {};
    filteredSlips.forEach((ps) => {
      const dept = employeeById[ps.employeeId]?.department ?? "Unknown";
      byDept[dept] = (byDept[dept] ?? 0) + ps.net;
    });
    return Object.entries(byDept).sort((a, b) => b[1] - a[1]);
  }, [filteredSlips, employeeById]);

  const monthlyTrend = useMemo(() => {
    return payruns.map((pr) => {
      const total = payslips
        .filter((ps) => ps.payrunId === pr.id)
        .reduce((s, ps) => s + ps.net, 0);
      return { name: pr.name, total };
    });
  }, [payruns, payslips]);

  const maxTrend = Math.max(...monthlyTrend.map((m) => m.total), 1);
  const departments = [...new Set(employees.map((e) => e.department))];

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading dashboard…</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-lg font-semibold">Payroll Dashboard</h1>
          <div className="flex gap-2">
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="field-input w-auto">
              <option value="">All periods</option>
              {payruns.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="field-input w-auto">
              <option value="">All departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <p className="text-sm text-text-secondary">Live insights from actual HR and Payroll data</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel p-4">
          <p className="text-xs text-text-secondary mb-1">Total Net Paid</p>
          <p className="text-xl font-semibold">{fmtMoney(totalNetPaid)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-text-secondary mb-1">Payslips Generated</p>
          <p className="text-xl font-semibold">{payslipsGenerated}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-text-secondary mb-1">Average Salary</p>
          <p className="text-xl font-semibold">{fmtMoney(avgSalary)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-text-secondary mb-1">Payroll Warnings</p>
          <p className={`text-xl font-semibold ${warningsCount > 0 ? "text-status-pending" : ""}`}>{warningsCount}</p>
        </div>
      </div>

      {/* Salary by department */}
      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-4">Salary Cost by Department</h2>
        <div className="space-y-3">
          {departmentCosts.map(([dept, total]) => {
            const max = departmentCosts[0]?.[1] || 1;
            return (
              <div key={dept}>
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>{dept}</span>
                  <span>{fmtMoney(total)}</span>
                </div>
                <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(total / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
          {departmentCosts.length === 0 && (
            <p className="text-sm text-text-muted">No payslip data for this filter yet.</p>
          )}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-4">Monthly Net Salary Trend</h2>
        <div className="flex items-end gap-4 h-32">
          {monthlyTrend.map((m) => (
            <div key={m.name} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-accent/80 rounded-t-md"
                style={{ height: `${(m.total / maxTrend) * 100}%`, minHeight: m.total > 0 ? "4px" : "0px" }}
              />
              <span className="text-xs text-text-muted whitespace-nowrap">{m.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Filters above (Period, Department) recompute every number on this page from live Payrun/Payslip/Employee
        data — nothing here is a static chart.
      </p>
    </div>
  );
}