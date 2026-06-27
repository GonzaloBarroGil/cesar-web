import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BREADCRUMB_LABELS: Record<string, string> = {
  "": "Inicio",
  consorcios: "Consorcios",
  expenses: "Expensas",
  invoices: "Facturación",
  debt: "Deuda",
  payments: "Pagos",
  "incomes-outputs": "Ingresos/Egresos",
  new: "Nuevo",
  edit: "Editar",
  providers: "Proveedores",
  concepts: "Conceptos",
  categories: "Categorías",
  recibo: "Recibo",
  summary: "Resumen",
};

function Breadcrumbs() {
  const location = useLocation();

  if (location.pathname === "/") return null;

  const segments = location.pathname.split("/").filter(Boolean);
  const items = [{ label: "Inicio", to: "/" }];

  segments.reduce((path, segment) => {
    const nextPath = `${path}/${segment}`;
    const label = BREADCRUMB_LABELS[segment] || segment;
    items.push({ label, to: nextPath });
    return nextPath;
  }, "");

  if (items.length <= 1) return null;

  return (
    <nav
      className="flex items-center gap-1 px-4 py-2 text-sm text-neutral-500 border-b"
      aria-label="Migas de pan"
    >
      {items.map((item, i) => (
        <span key={item.to} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === items.length - 1 ? (
            <span className="text-neutral-700 font-medium">{item.label}</span>
          ) : (
            <Link to={item.to} className="hover:text-neutral-700 hover:underline">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export { Breadcrumbs };
