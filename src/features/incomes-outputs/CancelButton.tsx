import {
  getGetEntryQueryKey,
  getListEntriesQueryKey,
  useCancelEntry,
} from "@/api/generated/incomes-outputs/incomes-outputs";
import type { IncomeOutputResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/AuthContext";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { useQueryClient } from "@tanstack/react-query";
import { Ban } from "lucide-react";
import { useState } from "react";
import { incomeOutputKeys } from "./queryKeys";

interface CancelButtonProps {
  entryId: string;
  status: string;
  onCancelled?: () => void;
}

function CancelButton({ entryId, status, onCancelled }: CancelButtonProps) {
  const { user } = useAuth();
  const { selectedId, consorcios } = useConsorcio();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";
  const detailKey = getGetEntryQueryKey(entryId, { consorcio_id: consorcioId });

  const cancelEntry = useCancelEntry({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: detailKey });
        const previous = queryClient.getQueryData<IncomeOutputResponse>(detailKey);
        if (previous) {
          queryClient.setQueryData<IncomeOutputResponse>(detailKey, {
            ...previous,
            status: "CANCELLED",
            tombstone: true,
          });
        }
        return { previous };
      },
      onError: (_error, _variables, context) => {
        const ctx = context as { previous?: IncomeOutputResponse } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(detailKey, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: detailKey });
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: incomeOutputKeys.all });
      },
      onSuccess: () => {
        onCancelled?.();
      },
    },
  });

  if (user?.role !== "ADMIN") {
    return null;
  }

  if (status !== "ACTIVE") {
    return null;
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowDialog(true);
        }}
        disabled={cancelEntry.isPending}
      >
        <Ban className="h-4 w-4 mr-1" />
        {cancelEntry.isPending ? "Cancelando..." : "Cancelar"}
      </Button>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Cancelar movimiento"
        description="¿Cancelar este movimiento? Quedará marcado como anulado y no se incluirá en los resúmenes."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="destructive"
        onConfirm={() => {
          setShowDialog(false);
          cancelEntry.mutate({ entryId, params: { consorcio_id: consorcioId } });
        }}
      />
    </>
  );
}

export { CancelButton };
