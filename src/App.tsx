import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { LoginForm } from "@/features/auth/LoginForm";
import { AuthGuard, RoleGuard } from "@/features/auth/AuthGuard";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<AuthGuard />}>
          <Route index element={<DashboardPlaceholder />} />
          <Route path="invoices/*" element={<Placeholder title="Facturación" />} />
          <Route element={<RoleGuard role="ADMIN" />}>
            <Route path="consorcios/*" element={<Placeholder title="Consorcios" />} />
            <Route path="expenses/*" element={<Placeholder title="Expensas" />} />
            <Route path="debt/*" element={<Placeholder title="Deuda" />} />
            <Route path="payments/*" element={<Placeholder title="Pagos" />} />
            <Route path="incomes-outputs/*" element={<Placeholder title="Ingresos/Egresos" />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen text-neutral-400">
      {title} — Próximamente
    </div>
  );
}

function DashboardPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-screen text-neutral-400">
      Panel de Control — Próximamente
    </div>
  );
}

export { App };
