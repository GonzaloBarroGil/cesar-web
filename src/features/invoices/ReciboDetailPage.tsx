import {
  getGetReciboQueryKey,
  useAnularRecibo,
  useGetRecibo,
} from "@/api/generated/invoices/invoices";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AnnulButton } from "./AnnulButton";
import { ReciboDetail } from "./ReciboDetail";
import { invoiceKeys } from "./queryKeys";

function ReciboDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetRecibo(id ?? "", {
    query: { enabled: !!id },
  });

  const anularRecibo = useAnularRecibo({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReciboQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: invoiceKeys.recibos.lists() });
      },
    },
  });

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  const recibo = data?.data;

  if (isError || !recibo) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Recibo no encontrado</p>
        <Link to="/invoices">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Facturación
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/invoices"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Facturación
      </Link>

      {recibo.status === "Activo" && (
        <div className="flex items-center gap-2 mb-6">
          <AnnulButton
            onAnnul={() => anularRecibo.mutate({ id: recibo.id })}
            isSubmitting={anularRecibo.isPending}
            description="¿Anular este recibo? El recibo quedará marcado como ANULADO y no podrá reactivarse."
          />
        </div>
      )}

      <ReciboDetail recibo={recibo} />
    </div>
  );
}

export { ReciboDetailPage };
