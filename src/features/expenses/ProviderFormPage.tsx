import {
  useListProviders,
  useRegisterProvider,
  useUpdateProvider,
} from "@/api/generated/expenses/expenses";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProviderForm, type ProviderFormData } from "./ProviderForm";

function ProviderFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: providers = [] } = useListProviders();

  const registerProvider = useRegisterProvider();
  const updateProvider = useUpdateProvider();

  const [serverError, setServerError] = useState<string | null>(null);

  const existingProvider = isEdit ? providers.find((p) => p.id === id) : undefined;

  const handleSubmit = (formData: ProviderFormData) => {
    setServerError(null);

    if (isEdit) {
      updateProvider.mutate(
        {
          id: id ?? "",
          data: {
            name: formData.name,
            iva_condition: formData.iva_condition,
            provider_type: formData.provider_type,
            contact_email: formData.contact_email || undefined,
            contact_phone: formData.contact_phone || undefined,
          } as never,
        },
        {
          onSuccess: () => navigate("/expenses/providers"),
          onError: () => setServerError("Error al actualizar el proveedor."),
        },
      );
    } else {
      registerProvider.mutate(
        {
          data: {
            cuit: formData.cuit,
            name: formData.name,
            iva_condition: formData.iva_condition,
            provider_type: formData.provider_type,
            contact_email: formData.contact_email || undefined,
            contact_phone: formData.contact_phone || undefined,
          } as never,
        },
        {
          onSuccess: () => navigate("/expenses/providers"),
          onError: () => setServerError("Error al registrar el proveedor."),
        },
      );
    }
  };

  if (isEdit && !existingProvider) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">Proveedor no encontrado</p>
        <Link to="/expenses/providers">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  const initialData = existingProvider
    ? {
        cuit: existingProvider.cuit,
        name: existingProvider.name,
        iva_condition: existingProvider.iva_condition,
        provider_type: existingProvider.provider_type,
        contact_email: existingProvider.contact_email ?? "",
        contact_phone: existingProvider.contact_phone ?? "",
      }
    : undefined;

  return (
    <div>
      <Link
        to="/expenses/providers"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Proveedores
      </Link>
      <ProviderForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={registerProvider.isPending || updateProvider.isPending}
        error={serverError}
      />
    </div>
  );
}

export { ProviderFormPage };
