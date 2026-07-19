import { useGetUnitBalance } from "@/api/generated/payments/payments";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConsorcio } from "@/features/layout/ConsorcioContext";

interface UnitBalanceCardProps {
  unitId: string;
}

function UnitBalanceCard({ unitId }: UnitBalanceCardProps) {
  const { selectedId, consorcios } = useConsorcio();
  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const { data, isLoading, error, refetch } = useGetUnitBalance(unitId, {
    consorcio_id: consorcioId,
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="h-16 bg-neutral-100 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 mb-2">Error al cargar el balance</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-neutral-500 mb-3">Balance de unidad</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Total pagado</span>
            <p>
              <MoneyDisplay
                amount={data.total_paid as { amount: string; currency: string }}
                className="text-lg font-semibold"
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Deuda total</span>
            <p>
              <MoneyDisplay
                amount={data.total_debt as { amount: string; currency: string }}
                className="text-lg font-semibold"
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Saldo pendiente</span>
            <p>
              <MoneyDisplay
                amount={data.outstanding as { amount: string; currency: string }}
                className="text-lg font-semibold"
                showColor
              />
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Sobrepago</span>
            <p>
              <MoneyDisplay
                amount={data.overpayment as { amount: string; currency: string }}
                className="text-lg font-semibold"
              />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { UnitBalanceCard };
