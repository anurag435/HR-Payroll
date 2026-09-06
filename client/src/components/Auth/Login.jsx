import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { homeRouteForRole } from "../../constants/roles";
import PasswordInput from "../common/PasswordInput";

const MODULES = [
  { label: "Employees & Contracts", detail: "Records, roles and org structure" },
  { label: "Attendance & Time Off", detail: "Check-ins, leave balances, approvals" },
  { label: "Payroll", detail: "Salary structures, payruns, payslips" },
];

// Small static "growth" line — the signature visual on the brand panel.
// Deliberately understated: one accent line, one data point, no chartjunk.
function GrowthSpark() {
  return (
    <svg viewBox="0 0 220 72" className="w-full h-auto" aria-hidden="true">
      <polyline
        points="2,58 34,46 66,50 98,30 130,34 162,14 218,4"
        fill="none"
        stroke="#eef5f1"
        strokeOpacity="0.9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="218" cy="4" r="3.5" fill="#eef5f1" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(email, password);
      const loggedInUser = data.user;

      const redirectTo = location.state?.from?.pathname;
      // "/" isn't a real deep-link target — it just redirects everyone to
      // /employees, so it should never override the role-based redirect.
      if (redirectTo && redirectTo !== "/") {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(homeRouteForRole(loggedInUser.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Brand panel — hidden on small screens, this is the hackathon-demo
          "wow" moment: identity, real module list, and the signature spark. */}
      <div className="hidden lg:flex flex-col justify-between bg-accent text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 15.5 10.5 9l3 3L21 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 5h6v6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display font-bold text-lg tracking-tight">HRPayroll</span>
        </div>

        <div className="relative max-w-sm">
          <h1 className="font-display font-bold text-[2.15rem] leading-[1.15] mb-4">
            Everything your team needs, in one place.
          </h1>
          <p className="text-white/75 text-sm leading-relaxed mb-8">
            One workspace for HR and payroll — built so people, attendance and pay
            never live in three different tools.
          </p>

          <ul className="space-y-4 mb-10">
            {MODULES.map((m) => (
              <li key={m.label} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brass shrink-0" />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-white/60">{m.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <GrowthSpark />
        </div>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} HRPayroll</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 15.5 10.5 9l3 3L21 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 5h6v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-display font-bold text-lg tracking-tight">HRPayroll</span>
          </div>

          <h2 className="text-sm font-medium text-text-secondary mb-1">HR Portal</h2>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-8">Sign in to continue to your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="field-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-secondary">Password</label>
                <button type="button" className="text-xs text-accent hover:text-accent-hover">
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-status-danger bg-status-danger/10 border border-status-danger/20 rounded-md px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-border text-center space-y-2">
            <p className="text-xs text-text-muted">Accounts are created by an administrator.</p>
            <p className="text-xs text-text-muted">
              After sign-in, only the modules and actions allowed by your assigned role will be shown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
