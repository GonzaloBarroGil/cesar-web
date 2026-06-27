import { AuthProvider } from "@/features/auth/AuthContext";
import { AuthGuard, RoleGuard } from "@/features/auth/AuthGuard";
import { LoginForm } from "@/features/auth/LoginForm";
import { AppShell } from "@/features/layout/AppShell";
import { Route, Routes } from "react-router-dom";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-neutral-500 text-lg">
      {title} — Próximamente
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route index element={<Placeholder title="Panel de Control" />} />
            <Route path="invoices/*" element={<Placeholder title="Facturación" />} />
            <Route element={<RoleGuard requiredRole="ADMIN" />}>
              <Route path="consorcios/*" element={<Placeholder title="Consorcios" />} />
              <Route path="expenses/*" element={<Placeholder title="Expensas" />} />
              <Route path="debt/*" element={<Placeholder title="Deuda" />} />
              <Route path="payments/*" element={<Placeholder title="Pagos" />} />
              <Route path="incomes-outputs/*" element={<Placeholder title="Ingresos/Egresos" />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export { App };
