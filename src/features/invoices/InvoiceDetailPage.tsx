import {
  getGetInvoiceQueryKey,
  useAnularInvoice,
  useGetInvoice,
} from "@/api/generated/invoices/invoices";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileMinus, FilePlus, Receipt } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AnnulButton } from "./AnnulButton";
import { CaeQrDisplay } from "./CaeQrDisplay";
import { InvoiceDetail } from "./InvoiceDetail";
import { invoiceKeys } from "./queryKeys";

function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetInvoice(id ?? "", {
    query: { enabled: !!id },
  });

  const anularInvoice = useAnularInvoice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInvoiceQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
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

  const invoice = data?.data;

  if (isError || !invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Factura no encontrada</p>
        <Link to="/invoices">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Facturación
          </Button>
        </Link>
      </div>
    );
  }

  const isActiva = invoice.status === "Activa";

  return (
    <div>
      <Link
        to="/invoices"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Facturación
      </Link>

      <div className="flex items-center gap-2 mb-6">
        {isActiva && (
          <>
            <AnnulButton
              onAnnul={() => anularInvoice.mutate({ id: invoice.id })}
              isSubmitting={anularInvoice.isPending}
              description="¿Anular esta factura? La factura quedará marcada como ANULADA y no podrá reactivarse."
            />
            <Link to={`/invoices/${invoice.id}/nc/new`}>
              <Button variant="outline" size="sm">
                <FileMinus className="h-4 w-4 mr-1" />
                Crear Nota de Crédito
              </Button>
            </Link>
            <Link to={`/invoices/${invoice.id}/nd/new`}>
              <Button variant="outline" size="sm">
                <FilePlus className="h-4 w-4 mr-1" />
                Crear Nota de Débito
              </Button>
            </Link>
            <Link to={`/invoices/recibos/new?factura=${invoice.id}`}>
              <Button variant="outline" size="sm">
                <Receipt className="h-4 w-4 mr-1" />
                Crear Recibo
              </Button>
            </Link>
          </>
        )}
      </div>

      <InvoiceDetail invoice={invoice}>
        <CaeQrDisplay
          cae={invoice.cae}
          caeVencimiento={invoice.cae_vencimiento}
          qrCode={invoice.qr_code}
        />
      </InvoiceDetail>
    </div>
  );
}

export { InvoiceDetailPage };
