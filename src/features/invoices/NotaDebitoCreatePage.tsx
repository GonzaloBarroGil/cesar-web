import { useCreateNotaDebito, useGetInvoice } from "@/api/generated/invoices/invoices";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NotaForm } from "./NotaForm";
import { invoiceKeys } from "./queryKeys";

function NotaDebitoCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createNotaDebito = useCreateNotaDebito();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetInvoice(id ?? "", {
    query: { enabled: !!id },
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

  return (
    <div>
      <Link
        to={`/invoices/${id}`}
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a la factura
      </Link>
      <NotaForm
        mode="ND"
        invoice={invoice}
        onSubmit={(data) => {
          setServerError(null);
          createNotaDebito.mutate(
            { id, data },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: invoiceKeys.notasDebito.lists() });
                navigate(`/invoices/${id}`);
              },
              onError: () => setServerError("Error al emitir la Nota de Débito."),
            },
          );
        }}
        isSubmitting={createNotaDebito.isPending}
        error={serverError}
      />
    </div>
  );
}

export { NotaDebitoCreatePage };
