import { useCreateFacturaA } from "@/api/generated/invoices/invoices";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FacturaAForm } from "./FacturaAForm";
import { invoiceKeys } from "./queryKeys";

function FacturaACreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createFacturaA = useCreateFacturaA();
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
      <FacturaAForm
        onSubmit={(data) => {
          setServerError(null);
          createFacturaA.mutate(
            { data },
            {
              onSuccess: (result) => {
                queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
                navigate(`/invoices/${result.data.id}`);
              },
              onError: () => setServerError("Error al emitir la Factura A."),
            },
          );
        }}
        isSubmitting={createFacturaA.isPending}
        error={serverError}
      />
    </div>
  );
}

export { FacturaACreatePage };
