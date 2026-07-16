import type { Liquidacion } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

interface LiquidacionDetailProps {
  liquidacion: Liquidacion;
  children?: React.ReactNode;
}

function LiquidacionDetail({ liquidacion, children }: LiquidacionDetailProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{liquidacion.liquidacion_number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={liquidacion.status} />
            <span className="text-xs text-neutral-500">
              Generada el {new Date(liquidacion.generated_at).toLocaleDateString("es-AR")}
            </span>
            {liquidacion.issued_at && (
              <span className="text-xs text-neutral-500">
                Emitida el {new Date(liquidacion.issued_at).toLocaleDateString("es-AR")}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={liquidacion.current_balance as { amount: string; currency: string }}
            className="text-xl font-semibold"
            showColor
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Periodo</span>
            <p className="text-sm">{liquidacion.period_code.code}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Unidad Funcional</span>
            <p className="text-sm">{liquidacion.unit_id}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Version</span>
            <p className="text-sm">{liquidacion.version}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Creada</span>
            <p className="text-sm">
              {new Date(liquidacion.created_at).toLocaleDateString("es-AR")}
            </p>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

export { LiquidacionDetail };
