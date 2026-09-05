import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      navigate(user.role === "admin" ? "/admin/users" : "/employees");
    } catch (err) {
      setError(err.message);
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