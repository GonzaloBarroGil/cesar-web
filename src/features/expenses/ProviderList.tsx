import type { ProviderResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProviderListProps {
  providers: ProviderResponse[];
  isLoading: boolean;
  error?: Error | null;
  onTombstone: (id: string) => void;
}

function ProviderList({ providers, isLoading, error, onTombstone }: ProviderListProps) {
  const [tombstoneId, setTombstoneId] = useState<string | null>(null);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los proveedores</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">No hay proveedores registrados</p>
        <Link to="/expenses/providers/new">
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
        <h1 className="text-xl font-semibold">Proveedores</h1>
        <Link to="/expenses/providers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
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
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden md:table-cell">
                Email
              </th>
              <th className="w-28" />
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr
                key={p.id}
                className={`border-b hover:bg-neutral-50 ${p.tombstone ? "opacity-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-medium text-neutral-900 ${
                      p.tombstone ? "line-through" : ""
                    }`}
                  >
                    {p.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{p.cuit}</td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                  {p.iva_condition}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                  {p.contact_email || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!p.tombstone && (
                      <Link
                        to={`/expenses/providers/${p.id}/edit`}
                        className="text-xs text-neutral-500 hover:text-neutral-700 p-1"
                      >
                        <Edit className="h-3 w-3" />
                      </Link>
                    )}
                    {!p.tombstone && (
                      <>
                        <button
                          type="button"
                          onClick={() => setTombstoneId(p.id)}
                          className="text-xs text-neutral-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <ConfirmationDialog
                          open={tombstoneId === p.id}
                          onOpenChange={(open) => {
                            if (!open) setTombstoneId(null);
                          }}
                          title="Eliminar proveedor"
                          description="No se borrara permanentemente. Quedara marcado como anulado."
                          confirmLabel="Eliminar"
                          variant="destructive"
                          onConfirm={() => {
                            onTombstone(p.id);
                            setTombstoneId(null);
                          }}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { ProviderList };
