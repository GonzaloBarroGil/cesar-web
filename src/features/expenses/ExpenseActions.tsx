import type { ExpenseResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ExpenseActionsProps {
  expense: ExpenseResponse;
  onApprove: () => void;
  onReject: () => void;
  onTombstone: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isTombstoning?: boolean;
}

function ExpenseActions({
  expense,
  onApprove,
  onReject,
  onTombstone,
  isApproving,
  isRejecting,
  isTombstoning,
}: ExpenseActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showTombstoneDialog, setShowTombstoneDialog] = useState(false);

  if (expense.tombstone) {
    return null;
  }

  const canApprove =
    expense.expense_type === "EXTRAORDINARIA" && expense.approval_status === "PENDING";
  const canReject =
    expense.expense_type === "EXTRAORDINARIA" && expense.approval_status === "PENDING";
  const canTombstone = true;

  if (!canApprove && !canReject && !canTombstone) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      {canApprove && (
        <Button
          variant="default"
          size="sm"
          onClick={onApprove}
          disabled={isApproving}
          className="bg-green-600 hover:bg-green-500"
        >
          <Check className="h-4 w-4 mr-1" />
          {isApproving ? "Aprobando..." : "Aprobar"}
        </Button>
      )}

      {canReject && (
        <>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={isRejecting}
          >
            <X className="h-4 w-4 mr-1" />
            {isRejecting ? "Rechazando..." : "Rechazar"}
          </Button>
          <ConfirmationDialog
            open={showRejectDialog}
            onOpenChange={setShowRejectDialog}
            title="Rechazar gasto"
            description="Esta seguro de rechazar este gasto extraordinario?"
            confirmLabel="Rechazar"
            variant="destructive"
            onConfirm={() => {
              setShowRejectDialog(false);
              onReject();
            }}
          />
        </>
      )}

      {canTombstone && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTombstoneDialog(true)}
            disabled={isTombstoning}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isTombstoning ? "Eliminando..." : "Eliminar"}
          </Button>
          <ConfirmationDialog
            open={showTombstoneDialog}
            onOpenChange={setShowTombstoneDialog}
            title="Eliminar gasto"
            description="No se borrara permanentemente. Quedara marcado como anulado."
            confirmLabel="Eliminar"
            variant="destructive"
            onConfirm={() => {
              setShowTombstoneDialog(false);
              onTombstone();
            }}
          />
        </>
      )}
    </div>
  );
}

export { ExpenseActions };
