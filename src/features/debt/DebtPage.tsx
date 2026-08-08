import {
  getListLiquidacionesQueryKey,
  useGenerateLiquidacion,
  useGenerateLiquidacionBatch,
  useListLiquidaciones,
} from "@/api/generated/debt/debt";
import type { ListLiquidacionesParams, ListLiquidacionesStatus } from "@/api/generated/models";
import { Input } from "@/components/ui/input";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GenerateModal } from "./GenerateModal";
import { LiquidacionList } from "./LiquidacionList";

function DebtPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedId, consorcios } = useConsorcio();
  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const periodCode = searchParams.get("period_code") ?? "";
  const status = searchParams.get("status") ?? "";

  const apiParams: ListLiquidacionesParams = {};
  if (consorcioId) apiParams.consorcio_id = consorcioId;
  if (periodCode) apiParams.period_code = periodCode;
  if (status) apiParams.status = status as ListLiquidacionesStatus;

  const { data, isLoading, error } = useListLiquidaciones(apiParams);

  if (!consorcioId) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500 text-lg">
        Seleccione un consorcio para ver la deuda.
      </div>
    );
  }

  const generateLiquidacion = useGenerateLiquidacion();
  const generateBatch = useGenerateLiquidacionBatch();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const handleGenerate = async (formData: { period_code: string; unit_id: string }) => {
    const result = await generateLiquidacion.mutateAsync({ data: formData });
    queryClient.invalidateQueries({ queryKey: getListLiquidacionesQueryKey() });
    setModalOpen(false);
    navigate(`/debt/${result.liquidacion.id}`);
  };

  const handleBatchGenerate = async (formData: { period_code: string }) => {
    await generateBatch.mutateAsync({ data: formData });
    queryClient.invalidateQueries({ queryKey: getListLiquidacionesQueryKey() });
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Deuda</h1>
        <Link to="/debt/certificados">
          <span className="text-sm text-neutral-500 hover:text-neutral-700">Certificados</span>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            value={periodCode}
            onChange={(e) => updateParam("period_code", e.target.value)}
            placeholder="Periodo (YYYYMM)"
            maxLength={6}
            className="w-40"
          />
          <select
            aria-label="Filtrar por estado"
            value={status}
            onChange={(e) => updateParam("status", e.target.value)}
            className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm shadow-sm"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="ISSUED">Emitido</option>
            <option value="SETTLED">Liquidado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generar Liquidacion
        </button>
      </div>

      <LiquidacionList
        liquidaciones={data?.liquidaciones ?? []}
        count={data?.count}
        isLoading={isLoading}
        error={error as Error | null}
      />

      <GenerateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onGenerate={handleGenerate}
        onBatchGenerate={handleBatchGenerate}
      />
    </div>
  );
}

export { DebtPage };
