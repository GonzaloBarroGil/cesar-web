import { Button } from "@/components/ui/button";
import type { ConsorcioData } from "@/mocks/fixtures/data";
import { Building, Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface ConsorcioDetailProps {
  consorcio: ConsorcioData;
  children?: React.ReactNode;
}

function ConsorcioDetail({ consorcio, children }: ConsorcioDetailProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-neutral-400" />
            {consorcio.nombre_fantasia || consorcio.razon_social}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">CUIT: {consorcio.cuit}</p>
        </div>
        <Link to={`/consorcios/${consorcio.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border mb-6">
        <div className="px-4 py-3 border-b bg-neutral-50">
          <span className="text-sm font-medium text-neutral-600">General</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Razón Social</span>
            <p className="text-sm">{consorcio.razon_social}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Domicilio</span>
            <p className="text-sm">{consorcio.domicilio}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Matrícula CABA</span>
            <p className="text-sm">{consorcio.matricula_caba || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Condición IVA</span>
            <p className="text-sm">{consorcio.iva_condition}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Estado</span>
            <p className="text-sm">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  consorcio.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {consorcio.status === "ACTIVE" ? "Activo" : "Inactivo"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

export { ConsorcioDetail };
