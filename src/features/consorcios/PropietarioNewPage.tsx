import { useRegisterPropietario } from "@/api/generated/consorcio/consorcio";
import { unidadesFuncionales } from "@/mocks/fixtures/data";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { PropietarioForm } from "./PropietarioForm";

function PropietarioNewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const registerPropietario = useRegisterPropietario();

  if (!id) return null;

  const ufs = unidadesFuncionales.filter((uf) => uf.consorcio_id === id);

  const handleSubmit = (formData: {
    tax_id: string;
    tax_id_type: string;
    nombre_completo: string;
    iva_condition: string;
    email: string;
    phone: string;
    unidad_funcional_id: string;
    is_owner: boolean;
  }) => {
    registerPropietario.mutate(
      {
        id,
        data: {
          tax_id: formData.tax_id,
          tax_id_type: formData.tax_id_type,
          name: formData.nombre_completo,
          email: formData.email,
          phone: formData.phone,
          iva_condition: formData.iva_condition,
          unidad_funcional_id: formData.unidad_funcional_id,
          is_owner: formData.is_owner,
        } as never,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [`/consorcios/${id}/propietarios`],
          });
          navigate(`/consorcios/${id}?tab=propietarios`);
        },
      },
    );
  };

  return (
    <div>
      <Link
        to={`/consorcios/${id}`}
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al consorcio
      </Link>
      <PropietarioForm
        ufs={ufs}
        onSubmit={handleSubmit}
        isSubmitting={registerPropietario.isPending}
      />
    </div>
  );
}

export { PropietarioNewPage };
