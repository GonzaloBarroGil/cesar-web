import { getGetCertificadoQueryKey, useSignCertificado } from "@/api/generated/debt/debt";
import type { CertStatus, GetCertificadoResponse } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { debtKeys } from "./queryKeys";

interface SignButtonProps {
  certificadoId: string;
  status: CertStatus;
  onSigned?: () => void;
}

function SignButton({ certificadoId, status, onSigned }: SignButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);

  const detailKey = getGetCertificadoQueryKey(certificadoId);

  const signCertificado = useSignCertificado({
    mutation: {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: detailKey });
        const previous = queryClient.getQueryData<GetCertificadoResponse>(detailKey);
        if (previous) {
          queryClient.setQueryData<GetCertificadoResponse>(detailKey, {
            certificado: {
              ...previous.certificado,
              status: "EJECUTADO",
              is_executive_title: true,
            },
          });
        }
        return { previous };
      },
      onError: (_error, _variables, context) => {
        const ctx = context as { previous?: GetCertificadoResponse } | undefined;
        if (ctx?.previous) {
          queryClient.setQueryData(detailKey, ctx.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: detailKey });
        queryClient.invalidateQueries({ queryKey: debtKeys.certificados.lists() });
      },
      onSuccess: () => {
        onSigned?.();
      },
    },
  });

  if (status !== "VIGENTE") {
    return null;
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={signCertificado.isPending}
      >
        <PenLine className="h-4 w-4 mr-1" />
        {signCertificado.isPending ? "Firmando..." : "Firmar"}
      </Button>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Firmar certificado"
        description="¿Firmar este certificado? Se convertira en titulo ejecutivo y no podra revertirse."
        confirmLabel="Firmar"
        variant="default"
        onConfirm={() => {
          setShowDialog(false);
          signCertificado.mutate({
            id: certificadoId,
            data: { administrator_signature: user?.nombre_completo ?? "administrador" },
          });
        }}
      />
    </>
  );
}

export { SignButton };
