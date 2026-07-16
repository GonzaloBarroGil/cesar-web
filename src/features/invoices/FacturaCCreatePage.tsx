import { useCreateFacturaC } from "@/api/generated/invoices/invoices";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FacturaCForm } from "./FacturaCForm";
import { invoiceKeys } from "./queryKeys";

function FacturaCCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createFacturaC = useCreateFacturaC();
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <div>
      <Link
        to="/invoices"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Facturación
      </Link>
      <FacturaCForm
        onSubmit={(data) => {
          setServerError(null);
          createFacturaC.mutate(
            { data },
            {
              onSuccess: (result) => {
                queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
                navigate(`/invoices/${result.data.id}`);
              },
              onError: () => setServerError("Error al emitir la Factura C."),
            },
          );
        }}
        isSubmitting={createFacturaC.isPending}
        error={serverError}
      />
    </div>
  );
}

export { FacturaCCreatePage };
