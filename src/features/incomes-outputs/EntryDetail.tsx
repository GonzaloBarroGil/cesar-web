import type { IncomeOutputResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { DirectionBadge } from "./DirectionBadge";
import { MigrationBadge, subTypeLabel } from "./subTypes";

interface EntryDetailProps {
  entry: IncomeOutputResponse;
}

function EntryDetail({ entry }: EntryDetailProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Movimiento {entry.id.slice(0, 8)}</h1>
          <div className="flex items-center gap-2 mt-1">
            <DirectionBadge direction={entry.direction} />
            <StatusBadge status={entry.status} />
            <MigrationBadge subType={entry.sub_type} />
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={entry.amount as { amount: string; currency: string }}
            className="text-xl font-semibold"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <span className="text-xs text-neutral-500">Descripción</span>
            <p className="text-sm">{entry.description}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Tipo</span>
            <p className="text-sm">{subTypeLabel(entry.sub_type)}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Periodo</span>
            <p className="text-sm">{entry.period_code}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Fecha</span>
            <p className="text-sm">{entry.date}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Factura vinculada</span>
            {entry.sub_type === "INCOME_RENT" && entry.invoice_id ? (
              <p className="text-sm">
                <Link
                  to={`/invoices/${entry.invoice_id}`}
                  className="text-neutral-900 hover:underline"
                >
                  {entry.invoice_id.slice(0, 8)}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-neutral-400">—</p>
            )}
          </div>
          <div>
            <span className="text-xs text-neutral-500">Versión</span>
            <p className="text-sm">v{entry.version}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Creado</span>
            <p className="text-sm">{new Date(entry.created_at).toLocaleDateString("es-AR")}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-neutral-500">Hash</span>
            <p className="text-xs font-mono break-all">{entry.hash}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { EntryDetail };
