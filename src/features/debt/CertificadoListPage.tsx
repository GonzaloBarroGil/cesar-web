import {
  getListCertificadosQueryKey,
  useGenerateCertificado,
  useListCertificados,
} from "@/api/generated/debt/debt";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CertificadoList } from "./CertificadoList";

function CertificadoListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateUnitId, setGenerateUnitId] = useState("");
  const [generateLiquidacionId, setGenerateLiquidacionId] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const unitId = searchParams.get("unit_id") ?? "";

  const { data, isLoading, error } = useListCertificados({ unit_id: unitId });

  const generateCertificado = useGenerateCertificado({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getListCertificadosQueryKey() });
        navigate(`/debt/certificados/${result.certificado.id}`);
      },
    },
  });

  const handleUnitFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("unit_id", value);
    } else {
      params.delete("unit_id");
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div>
      <Link
        to="/debt"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Deuda
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Certificados de Deuda</h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          value={unitId}
          onChange={(e) => handleUnitFilterChange(e.target.value)}
          placeholder="Filtrar por ID de unidad funcional"
          className="w-72"
        />
        <button
          type="button"
          onClick={() => setShowGenerateDialog(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-800 h-9 px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generar Certificado
        </button>
      </div>

      <CertificadoList
        certificados={data?.certificados ?? []}
        count={data?.count}
        isLoading={isLoading}
        error={error as Error | null}
      />

      <ConfirmationDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        title="Generar Certificado de Deuda"
        description="El certificado se genera a partir de una liquidacion emitida con saldo pendiente."
        confirmLabel="Generar"
        variant="default"
        onConfirm={() => {
          setShowGenerateDialog(false);
          generateCertificado.mutate({
            data: {
              unit_id: generateUnitId,
              liquidacion_id: generateLiquidacionId,
              administrator_signature: user?.nombre_completo ?? "administrador",
            },
          });
        }}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cert-unit">ID Unidad Funcional</Label>
            <Input
              id="cert-unit"
              value={generateUnitId}
              onChange={(e) => setGenerateUnitId(e.target.value)}
              placeholder="UUID de la unidad funcional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cert-liq">ID Liquidacion (ISSUED)</Label>
            <Input
              id="cert-liq"
              value={generateLiquidacionId}
              onChange={(e) => setGenerateLiquidacionId(e.target.value)}
              placeholder="UUID de la liquidacion emitida"
            />
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  );
}

export { CertificadoListPage };
