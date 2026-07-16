import { useCreateRecibo } from "@/api/generated/invoices/invoices";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ReciboForm } from "./ReciboForm";
import { invoiceKeys } from "./queryKeys";

function ReciboCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const createRecibo = useCreateRecibo();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialFacturaId = searchParams.get("factura") ?? undefined;

  return (
    <div>
      <Link
        to="/invoices"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Facturación
      </Link>
      <ReciboForm
        initialFacturaId={initialFacturaId}
        onSubmit={(data) => {
          setServerError(null);
          createRecibo.mutate(
            { data },
            {
              onSuccess: (result) => {
                queryClient.invalidateQueries({ queryKey: invoiceKeys.recibos.lists() });
                navigate(`/invoices/recibos/${result.data.id}`);
              },
              onError: () => setServerError("Error al emitir el Recibo."),
            },
          );
        }}
        isSubmitting={createRecibo.isPending}
        error={serverError}
      />
    </div>
  );
}

export { ReciboCreatePage };
