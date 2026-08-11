import { Button } from "@/components/ui/button";
import type { ConsorcioData } from "@/mocks/fixtures/data";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ConsorcioListProps {
  consorcios: ConsorcioData[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

function ConsorcioList({ consorcios, isLoading, isError = false, onRetry }: ConsorcioListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-neutral-500 text-lg">No se pudieron cargar los consorcios.</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (consorcios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay consorcios registrados</p>
        <Link to="/consorcios/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar el primero
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Consorcios</h1>
        <Link to="/consorcios/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Consorcio
          </Button>
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">CUIT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                IVA
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {consorcios.map((c) => (
              <tr key={c.id} className="border-b hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/consorcios/${c.id}`}
                    className="text-sm font-medium text-neutral-900 hover:underline"
                  >
                    {c.nombre_fantasia || c.razon_social}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{c.cuit}</td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                  {c.iva_condition}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      c.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {c.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/consorcios/${c.id}/edit`}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { ConsorcioList };
