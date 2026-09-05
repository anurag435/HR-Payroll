import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/employees" replace />;
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
      } else if (loggedInUser.role === "Admin") {
        navigate("/admin/users", { replace: true });
      } else {
        navigate("/employees", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="panel w-full max-w-md p-8">
        <h2 className="text-sm font-medium text-text-secondary mb-1">HR Portal</h2>
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-text-secondary mb-6">Sign in to continue to your workspace.</p>

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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="field-input"
            />
          </div>

          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

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
  );
}