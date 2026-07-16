import { useGetCertificado } from "@/api/generated/debt/debt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CertificadoDetail } from "./CertificadoDetail";
import { SignButton } from "./SignButton";

function CertificadoDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useGetCertificado(id ?? "", {
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

  const certificado = data?.certificado;

  if (isError || !certificado) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Certificado no encontrado</p>
        <Link to="/debt/certificados">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Certificados
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/debt/certificados"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Certificados
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <SignButton certificadoId={certificado.id} status={certificado.status} />
      </div>

      <CertificadoDetail certificado={certificado} />
    </div>
  );
}

export { CertificadoDetailPage };
