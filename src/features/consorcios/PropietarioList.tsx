import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PropietarioData } from "@/mocks/fixtures/data";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PropietarioListProps {
  propietarios: PropietarioData[];
  isLoading: boolean;
  consorcioId: string;
}

function taxIdStr(p: PropietarioData | Record<string, unknown>): string {
  const taxId = p.tax_id;
  if (typeof taxId === "object" && taxId !== null && "value" in taxId) {
    return String(taxId.value);
  }
  return String(taxId ?? "");
}

function PropietarioList({ propietarios, isLoading, consorcioId }: PropietarioListProps) {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
  };

  const anyList = propietarios as unknown as Record<string, unknown>[];
  const filtered = searched ? anyList.filter((p) => taxIdStr(p) === search) : anyList;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Buscar por CUIT/CUIL/DNI"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearched(false);
            }}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleSearch} aria-label="Buscar">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Link to={`/consorcios/${consorcioId}/propietarios/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </Link>
      </div>

      {searched && filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500 mb-2">
            {search
              ? "No se encontró propietario con ese CUIT/CUIL/DNI"
              : "No hay propietarios registrados"}
          </p>
          <Link to={`/consorcios/${consorcioId}/propietarios/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Registrar el primero
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                  CUIT/CUIL
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                  IVA
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                  Unidad
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id as string} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium">{p.nombre_completo as string}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {p.tax_id_type as string} {taxIdStr(p)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {p.iva_condition as string}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {p.unidad_funcional_id as string}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {p.email as string}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.is_owner ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.is_owner ? "Propietario" : "Inquilino"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searched && filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-neutral-500 mb-2">No hay propietarios registrados</p>
          <Link to={`/consorcios/${consorcioId}/propietarios/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Registrar el primero
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export { PropietarioList };
