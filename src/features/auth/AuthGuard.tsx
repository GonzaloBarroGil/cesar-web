import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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
    const redirect = location.pathname !== "/" ? `?redirect=${encodeURIComponent(location.pathname)}` : "";
    return <Navigate to={`/login${redirect}`} replace />;
  }

  return <Outlet />;
}

interface RoleGuardProps {
  role: string | string[];
  children?: React.ReactNode;
}

function RoleGuard({ role, children }: RoleGuardProps) {
  const { user } = useAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/invoices" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export { AuthGuard, RoleGuard };
