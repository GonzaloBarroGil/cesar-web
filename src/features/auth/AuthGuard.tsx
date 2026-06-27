import { Skeleton } from "@/components/ui/skeleton";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect =
      location.pathname !== "/" ? `?redirect=${encodeURIComponent(location.pathname)}` : "";
    return <Navigate to={`/login${redirect}`} replace />;
  }

  return <Outlet />;
}

interface RoleGuardProps {
  requiredRole: string | string[];
  children?: React.ReactNode;
}

function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { user } = useAuth();
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/invoices" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export { AuthGuard, RoleGuard };
