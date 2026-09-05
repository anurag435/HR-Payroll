import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { homeRouteForRole } from "../../constants/roles";

export default function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={homeRouteForRole(user?.role)} replace />;
  }

  return children;
}