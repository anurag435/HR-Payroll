import { useEffect, useState } from "react";
import { getDashboardSummary, getDepartments } from "../../services/api";

function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="panel p-4 border-t-2 border-t-accent">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-display font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, empty }) {
  return (
    <div className="panel p-4">
      <p className="text-sm font-semibold mb-3">{title}</p>
      {empty ? <p className="text-sm text-text-muted text-center py-10">No data for this filter.</p> : children}
    </div>
  );
}

// Simple horizontal bar chart — no external chart library required.
// `displayKey` optionally names a pre-formatted field to show instead of
// the raw number (bar width always uses the raw `valueKey`).
function BarList({ data, labelKey, valueKey, displayKey, colorClass = "bg-accent" }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>{d[labelKey]}</span>
            <span className="font-medium text-text-primary">{displayKey ? d[displayKey] : d[valueKey]}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
            <div
              className={`h-full rounded-full ${colorClass}`}
              style={{ width: `${(d[valueKey] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Small SVG line chart for the 7-day attendance trend.
function TrendLine({ data }) {
  const w = 320;
  const h = 100;
  const pad = 10;
  const max = Math.max(1, ...data.map((d) => d.present));
  const stepX = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d.present / max) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
      <polyline points={points.join(" ")} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = points[i].split(",");
        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--color-accent)" />;
      })}
      {data.map((d, i) => {
        const [x] = points[i].split(",");
        return (
          <text key={i} x={x} y={h} fontSize="8" textAnchor="middle" fill="var(--color-text-muted)">
            {d.date.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}

// Donut chart via conic-gradient — used for the employee status split.
function Donut({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const colors = ["var(--color-accent)", "var(--color-status-pending)", "var(--color-status-danger)", "var(--color-status-inactive)"];
  let cumulative = 0;
  const stops = data.map((d, i) => {
    const start = (cumulative / total) * 360;
    cumulative += d.count;
    const end = (cumulative / total) * 360;
    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-5">
      <div
        className="w-24 h-24 rounded-full shrink-0"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      />
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-text-secondary">{d.status}</span>
            <span className="font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    getDepartments()
      .then((d) => setDepartments(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Failed to load departments:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { month };
    if (department) params.department = department;
    if (status) params.status = status;

    getDashboardSummary(params)
      .then(setSummary)
      .catch((err) => setError(err.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [department, status, month]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold">Payroll Dashboard</h1>
          <p className="text-sm text-text-secondary">Live metrics aggregated across HR, Attendance, Time Off and Payroll</p>
        </div>
        <div className="flex gap-3">
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="field-input w-44">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field-input w-36">
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field-input w-40" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm rounded-md">{error}</div>
      )}

      {loading && <p className="text-sm text-text-muted py-16 text-center">Loading dashboard…</p>}

      {!loading && summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <KpiCard label="Active Employees" value={summary.kpis.totalActiveEmployees} />
            <KpiCard
              label="Present Today"
              value={`${summary.kpis.presentToday.count} / ${summary.kpis.presentToday.total}`}
            />
            <KpiCard label="Pending Time Off" value={summary.kpis.pendingTimeOffRequests} />
            <KpiCard label="Contracts Expiring (30d)" value={summary.kpis.contractsExpiringSoon} />
            <KpiCard label="Payroll Cost (period)" value={formatMoney(summary.kpis.payrollCostThisPeriod)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Headcount by Department" empty={summary.charts.headcountByDepartment.length === 0}>
              <BarList data={summary.charts.headcountByDepartment} labelKey="department" valueKey="count" />
            </ChartCard>

            <ChartCard title="Attendance — Last 7 Days" empty={summary.charts.attendanceTrend.length === 0}>
              <TrendLine data={summary.charts.attendanceTrend} />
            </ChartCard>

            <ChartCard title="Time Off Requests by Type (this month)" empty={summary.charts.timeOffByType.length === 0}>
              <BarList data={summary.charts.timeOffByType} labelKey="type" valueKey="count" colorClass="bg-status-pending" />
            </ChartCard>

            <ChartCard title="Payroll Cost by Department (latest payrun)" empty={summary.charts.payrollByDepartment.length === 0}>
              <BarList
                data={summary.charts.payrollByDepartment.map((d) => ({ ...d, formatted: formatMoney(d.total) }))}
                labelKey="department"
                valueKey="total"
                displayKey="formatted"
                colorClass="bg-status-active"
              />
            </ChartCard>

            <ChartCard title="Employee Status Split" empty={summary.charts.employeeStatusSplit.length === 0}>
              <Donut data={summary.charts.employeeStatusSplit} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
