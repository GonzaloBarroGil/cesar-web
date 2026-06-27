import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UnidadFuncionalData } from "@/mocks/fixtures/data";
import { Save } from "lucide-react";
import { useState } from "react";

interface UfTableProps {
  ufs: UnidadFuncionalData[];
  onSave: (ufs: UnidadFuncionalData[]) => void;
  isSaving: boolean;
}

function sumPercentages(
  ufs: UnidadFuncionalData[],
  group: "percentage_a" | "percentage_b" | "percentage_c",
) {
  return ufs.reduce((s, uf) => s + Number.parseFloat(uf[group] || "0"), 0);
}

function UfTable({ ufs: initialUfs, onSave, isSaving }: UfTableProps) {
  const [ufs, setUfs] = useState<UnidadFuncionalData[]>(initialUfs);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, field: string, value: string) => {
    setUfs((prev) => prev.map((uf) => (uf.id === id ? { ...uf, [field]: value } : uf)));
    setHasChanges(true);
    setError(null);
  };

  const handleToggleExempt = (id: string, group: "A" | "B" | "C") => {
    const key = `exempt_${group.toLowerCase()}` as "exempt_a" | "exempt_b" | "exempt_c";
    setUfs((prev) =>
      prev.map((uf) => {
        if (uf.id !== id) return uf;
        const current = uf.exempt_from || [];
        const newExempt = current.includes(group)
          ? current.filter((g) => g !== group)
          : [...current, group];
        if (current.includes(group)) {
          return { ...uf, [key]: "true", exempt_from: newExempt };
        }
        return { ...uf, [key]: "false", exempt_from: newExempt };
      }),
    );
    setHasChanges(true);
    setError(null);
  };

  const sumA = sumPercentages(ufs, "percentage_a");
  const sumB = sumPercentages(ufs, "percentage_b");
  const sumC = sumPercentages(ufs, "percentage_c");

  const isValid =
    Math.abs(sumA - 100) <= 0.01 && Math.abs(sumB - 100) <= 0.01 && Math.abs(sumC - 100) <= 0.01;

  const groups = [
    { key: "percentage_a" as const, label: "Grupo A", sum: sumA },
    { key: "percentage_b" as const, label: "Grupo B", sum: sumB },
    { key: "percentage_c" as const, label: "Grupo C", sum: sumC },
  ];

  return (
    <div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Código</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                Piso
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                Unidad
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">% A</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">% B</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">% C</th>
            </tr>
          </thead>
          <tbody>
            {ufs.map((uf) => (
              <tr key={uf.id} className="border-b hover:bg-neutral-50">
                <td className="px-4 py-2 text-sm font-medium">{uf.uf_code}</td>
                <td className="px-4 py-2 text-sm text-neutral-600 hidden sm:table-cell">
                  {uf.floor}
                </td>
                <td className="px-4 py-2 text-sm text-neutral-600 hidden sm:table-cell">
                  {uf.unit}
                </td>
                {(["percentage_a", "percentage_b", "percentage_c"] as const).map((group) => {
                  const isExempt = uf.exempt_from?.includes(
                    group === "percentage_a" ? "A" : group === "percentage_b" ? "B" : "C",
                  );
                  return (
                    <td key={group} className="px-2 py-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={isExempt ? "0" : uf[group]}
                        disabled={isExempt}
                        onChange={(e) => handleChange(uf.id, group, e.target.value)}
                        className="w-20 text-right text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleExempt(
                            uf.id,
                            group === "percentage_a" ? "A" : group === "percentage_b" ? "B" : "C",
                          )
                        }
                        className={`ml-1 text-xs ${isExempt ? "text-red-500" : "text-neutral-400"} hover:underline`}
                        title={isExempt ? "Exenta" : "No exenta"}
                      >
                        {isExempt ? "EX" : "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-neutral-50 text-sm">
              <td colSpan={3} className="px-4 py-2 font-medium text-neutral-600">
                Totales
              </td>
              {groups.map((g) => (
                <td
                  key={g.key}
                  className={`px-4 py-2 text-right font-medium ${
                    Math.abs(g.sum - 100) > 0.01 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {g.sum.toFixed(2)}%
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {!isValid && (
        <div className="mt-2 space-y-1">
          {groups.map(
            (g) =>
              Math.abs(g.sum - 100) > 0.01 && (
                <p key={g.key} className="text-xs text-red-600">
                  {g.label}: {g.sum.toFixed(2)}%. La suma debe ser 100%.
                </p>
              ),
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4">
        <Button onClick={() => onSave(ufs)} disabled={isSaving || !hasChanges || !isValid}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}

export { UfTable };
