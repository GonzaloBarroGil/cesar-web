import {
  useCreateConsorcio,
  useGetConsorcio,
  useUpdateConsorcio,
} from "@/api/generated/consorcio/consorcio";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConsorcioForm } from "./ConsorcioForm";
import type { ConsorcioFormData } from "./ConsorcioForm";

function ConsorcioFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingConsorcio, isLoading: isLoadingExisting } = useGetConsorcio(id ?? "", {
    query: { enabled: isEdit },
  });

  const createConsorcio = useCreateConsorcio();
  const updateConsorcio = useUpdateConsorcio();

  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (formData: ConsorcioFormData) => {
    setServerError(null);

    if (isEdit) {
      updateConsorcio.mutate(
        {
          id: id ?? "",
          data: {
            cuit: formData.cuit,
            razon_social: formData.razon_social,
            nombre_fantasia: formData.nombre_fantasia,
            matricula_caba: formData.matricula_caba,
            domicilio: formData.domicilio,
            iva_condition: formData.iva_condition,
          } as never,
        },
        {
          onSuccess: () => navigate(`/consorcios/${id}`),
          onError: () => setServerError("Error al actualizar el consorcio."),
        },
      );
    } else {
      createConsorcio.mutate(
        {
          data: {
            cuit: formData.cuit,
            razon_social: formData.razon_social,
            nombre_fantasia: formData.nombre_fantasia || undefined,
            matricula_caba: formData.matricula_caba || undefined,
            domicilio: formData.domicilio || undefined,
            iva_condition: formData.iva_condition,
          } as never,
        },
        {
          onSuccess: (result) => navigate(`/consorcios/${(result as { id: string }).id}`),
          onError: (err: unknown) => {
            const msg = (err as { error?: { message?: string } })?.error?.message;
            setServerError(msg ?? "Error al crear el consorcio.");
          },
        },
      );
    }
  };

  if (isEdit && isLoadingExisting) {
    return <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />;
  }

  if (isEdit && !existingConsorcio) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">Consorcio no encontrado</p>
        <Link to="/consorcios">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  const initialData = existingConsorcio
    ? {
        id: String(existingConsorcio.id ?? id ?? ""),
        cuit: String(existingConsorcio.cuit ?? ""),
        razon_social: existingConsorcio.razon_social ?? "",
        nombre_fantasia: (existingConsorcio as { nombre_fantasia?: string }).nombre_fantasia ?? "",
        matricula_caba: existingConsorcio.admin_matricula ?? "",
        domicilio: existingConsorcio.domicilio ?? "",
        iva_condition: "RI",
        status: existingConsorcio.status ?? "ACTIVE",
        created_at: existingConsorcio.created_at ?? "",
        updated_at: existingConsorcio.updated_at ?? "",
      }
    : undefined;

  return (
    <div>
      <Link
        to={isEdit ? `/consorcios/${id}` : "/consorcios"}
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {isEdit ? "Volver al detalle" : "Consorcios"}
      </Link>
      <ConsorcioForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={createConsorcio.isPending || updateConsorcio.isPending}
        error={serverError}
      />
    </div>
  );
}

export { ConsorcioFormPage };
