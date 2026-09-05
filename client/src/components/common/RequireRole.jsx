import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/employees" replace />;
  }

  return children;
}
