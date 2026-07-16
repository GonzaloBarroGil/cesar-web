import type { CertificadoDeuda } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

interface CertificadoDetailProps {
  certificado: CertificadoDeuda;
  children?: React.ReactNode;
}

function CertificadoDetail({ certificado, children }: CertificadoDetailProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Certificado de Deuda</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={certificado.status} />
            {certificado.is_executive_title && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Titulo ejecutivo
              </span>
            )}
            <span className="text-xs text-neutral-500">
              Emitido el {new Date(certificado.issue_date).toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay
            amount={certificado.total_debt as { amount: string; currency: string }}
            className="text-xl font-semibold"
          />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-neutral-500">Unidad Funcional</span>
            <p className="text-sm">{certificado.unit_id}</p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Vence</span>
            <p className="text-sm">
              {new Date(certificado.expires_at).toLocaleDateString("es-AR")}
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Firma del administrador</span>
            <p className="text-sm">
              {certificado.administrator_signature
                ? certificado.administrator_signature
                : "Sin firma"}
            </p>
          </div>
          <div>
            <span className="text-xs text-neutral-500">Aprobacion del consejo</span>
            <p className="text-sm">{certificado.consejo_approval ?? "Sin aprobacion"}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-neutral-500">Liquidaciones de origen</span>
            {certificado.source_liquidacion_hashes.length === 0 ? (
              <p className="text-sm">—</p>
            ) : (
              certificado.source_liquidacion_hashes.map((h) => (
                <p key={h} className="text-sm font-mono break-all">
                  {h}
                </p>
              ))
            )}
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-neutral-500">Hash</span>
            <p className="text-sm font-mono break-all">{certificado.hash}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-neutral-600 mb-3">Desglose por periodo</h2>
          <div className="divide-y">
            {certificado.period_breakdown.map((p) => (
              <div key={p.period_code.code} className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-600">{p.period_code.code}</span>
                <MoneyDisplay
                  amount={p.amount as { amount: string; currency: string }}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

export { CertificadoDetail };
