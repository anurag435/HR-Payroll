import { Navigate, Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import { useAuth } from "../../context/useAuth";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <Outlet />
    </div>
  );
}