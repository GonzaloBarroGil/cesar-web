import type { PaymentResponse, PaymentStatus } from "@/api/generated/models";
import { getGetPaymentQueryKey, useReversePayment } from "@/api/generated/payments/payments";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Undo2 } from "lucide-react";
import { useState } from "react";
import { paymentKeys } from "./queryKeys";

interface ReverseButtonProps {
  paymentId: string;
  status: PaymentStatus;
  onReversed?: () => void;
}

function ReverseButton({ paymentId, status, onReversed }: ReverseButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState("");

  const detailKey = getGetPaymentQueryKey(paymentId);

  const reversePayment = useReversePayment({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: detailKey });
        const previous = queryClient.getQueryData<PaymentResponse>(detailKey);
        if (previous) {
          queryClient.setQueryData<PaymentResponse>(detailKey, {
            ...previous,
            status: "REVERSED",
          });
        }
        return { previous };
      },
      onError: (_error, _variables, context) => {
        const ctx = context as { previous?: PaymentResponse } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(detailKey, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: detailKey });
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      },
      onSuccess: () => {
        onReversed?.();
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
        onClick={() => setShowDialog(true)}
        disabled={reversePayment.isPending}
      >
        <Undo2 className="h-4 w-4 mr-1" />
        {reversePayment.isPending ? "Revirtiendo..." : "Revertir"}
      </Button>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Revertir pago"
        description="¿Revertir este pago? Se creará un registro compensatorio."
        confirmLabel="Revertir"
        variant="destructive"
        onConfirm={() => {
          setShowDialog(false);
          reversePayment.mutate({
            id: paymentId,
            data: { reason: reason.trim() || "Reversión administrativa" },
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="reverse-reason">Motivo (opcional)</Label>
          <Input
            id="reverse-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo de la reversión"
          />
        </div>
      </ConfirmationDialog>
    </>
  );
}

export { ReverseButton };
