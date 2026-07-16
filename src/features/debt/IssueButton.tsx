import { getGetLiquidacionQueryKey, useIssueLiquidacion } from "@/api/generated/debt/debt";
import type { GetLiquidacionResponse, LiquidacionStatus } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { FileCheck } from "lucide-react";
import { useState } from "react";
import { debtKeys } from "./queryKeys";

interface IssueButtonProps {
  liquidacionId: string;
  status: LiquidacionStatus;
  onIssued?: () => void;
}

function IssueButton({ liquidacionId, status, onIssued }: IssueButtonProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);

  const detailKey = getGetLiquidacionQueryKey(liquidacionId);

  const issueLiquidacion = useIssueLiquidacion({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: detailKey });
        const previous = queryClient.getQueryData<GetLiquidacionResponse>(detailKey);
        if (previous) {
          queryClient.setQueryData<GetLiquidacionResponse>(detailKey, {
            liquidacion: { ...previous.liquidacion, status: "ISSUED" },
          });
        }
        return { previous };
      },
      onError: (_error, _variables, context) => {
        const ctx = context as { previous?: GetLiquidacionResponse } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(detailKey, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: detailKey });
        queryClient.invalidateQueries({ queryKey: debtKeys.liquidaciones.lists() });
      },
      onSuccess: () => {
        onIssued?.();
      },
    },
  });

  if (status !== "DRAFT") {
    return null;
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={issueLiquidacion.isPending}
      >
        <FileCheck className="h-4 w-4 mr-1" />
        {issueLiquidacion.isPending ? "Emitiendo..." : "Emitir"}
      </Button>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Emitir liquidacion"
        description="¿Emitir esta liquidacion? Una vez emitida no podra modificarse."
        confirmLabel="Emitir"
        variant="default"
        onConfirm={() => {
          setShowDialog(false);
          issueLiquidacion.mutate({ id: liquidacionId });
        }}
      />
    </>
  );
}

export { IssueButton };
