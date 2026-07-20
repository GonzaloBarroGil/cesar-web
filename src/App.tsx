import { AuthProvider } from "@/features/auth/AuthContext";
import { AuthGuard, RoleGuard } from "@/features/auth/AuthGuard";
import { LoginForm } from "@/features/auth/LoginForm";
import {
  ConsorcioDetailPage,
  ConsorcioFormPage,
  ConsorciosPage,
  PropietarioNewPage,
} from "@/features/consorcios";
import { DashboardPage } from "@/features/dashboard";
import {
  CertificadoDetailPage,
  CertificadoListPage,
  DebtPage,
  LiquidacionDetailPage,
} from "@/features/debt";
import {
  CategoryListPage,
  ConceptListPage,
  ExpenseCreatePage,
  ExpenseDetailPage,
  ExpensesPage,
  ProviderFormPage,
  ProviderListPage,
} from "@/features/expenses";
import { EntryDetailPage, EntryListPage, SummaryPage } from "@/features/incomes-outputs";
import {
  FacturaACreatePage,
  FacturaBCreatePage,
  FacturaCCreatePage,
  InvoiceDetailPage,
  InvoicesPage,
  NotaCreditoCreatePage,
  NotaDebitoCreatePage,
  ReciboCreatePage,
  ReciboDetailPage,
} from "@/features/invoices";
import { AppShell } from "@/features/layout/AppShell";
import { PaymentDetailPage, PaymentListPage } from "@/features/payments";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="invoices/factura-a/new" element={<FacturaACreatePage />} />
            <Route path="invoices/factura-b/new" element={<FacturaBCreatePage />} />
            <Route path="invoices/factura-c/new" element={<FacturaCCreatePage />} />
            <Route path="invoices/:id/nc/new" element={<NotaCreditoCreatePage />} />
            <Route path="invoices/:id/nd/new" element={<NotaDebitoCreatePage />} />
            <Route path="invoices/recibos/new" element={<ReciboCreatePage />} />
            <Route path="invoices/recibos/:id" element={<ReciboDetailPage />} />
            <Route element={<RoleGuard requiredRole="ADMIN" />}>
              <Route path="consorcios" element={<ConsorciosPage />} />
              <Route path="consorcios/new" element={<ConsorcioFormPage />} />
              <Route path="consorcios/:id" element={<ConsorcioDetailPage />} />
              <Route path="consorcios/:id/edit" element={<ConsorcioFormPage />} />
              <Route path="consorcios/:id/propietarios/new" element={<PropietarioNewPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="expenses/new" element={<ExpenseCreatePage />} />
              <Route path="expenses/:id" element={<ExpenseDetailPage />} />
              <Route path="expenses/concepts" element={<ConceptListPage />} />
              <Route path="expenses/categories" element={<CategoryListPage />} />
              <Route path="expenses/providers" element={<ProviderListPage />} />
              <Route path="expenses/providers/new" element={<ProviderFormPage />} />
              <Route path="expenses/providers/:id/edit" element={<ProviderFormPage />} />
              <Route path="debt" element={<DebtPage />} />
              <Route path="debt/certificados" element={<CertificadoListPage />} />
              <Route path="debt/certificados/:id" element={<CertificadoDetailPage />} />
              <Route path="debt/:id" element={<LiquidacionDetailPage />} />
              <Route path="payments" element={<PaymentListPage />} />
              <Route path="payments/:id" element={<PaymentDetailPage />} />
              <Route path="incomes-outputs" element={<EntryListPage />} />
              <Route path="incomes-outputs/summary" element={<SummaryPage />} />
              <Route path="incomes-outputs/:id" element={<EntryDetailPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export { App };
