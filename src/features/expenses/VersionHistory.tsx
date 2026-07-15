import type { ExpenseResponse } from "@/api/generated/models";

interface VersionHistoryProps {
  versions: ExpenseResponse[];
  isLoading: boolean;
}

function VersionHistory({ versions, isLoading }: VersionHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return <p className="text-sm text-neutral-500">Sin historial de versiones.</p>;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Version</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Fecha</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
              Hash
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Estado</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v, i) => (
            <tr
              key={`${v.id}-${v.version}`}
              className={`border-b hover:bg-neutral-50 ${v.tombstone ? "opacity-50" : ""}`}
            >
              <td className="px-4 py-3">
                <span className="text-sm font-medium">
                  v{v.version}
                  {i === versions.length - 1 && (
                    <span className="ml-1 text-xs text-neutral-500">(actual)</span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600">
                {new Date(v.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <code className="text-xs text-neutral-500">{v.hash.slice(0, 12)}...</code>
              </td>
              <td className="px-4 py-3">
                {v.tombstone ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 line-through">
                    Anulado
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500">Activo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { VersionHistory };
