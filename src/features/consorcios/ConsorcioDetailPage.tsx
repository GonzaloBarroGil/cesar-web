import { useGetConsorcio } from "@/api/generated/consorcio/consorcio";
import { useListPropietarios } from "@/api/generated/consorcio/consorcio";
import {
  useArchivePeriod,
  useClosePeriod,
  useOpenPeriod,
} from "@/api/generated/consorcio/consorcio";
import { useConfigureUfs } from "@/api/generated/consorcio/consorcio";
import { Button } from "@/components/ui/button";
import type { PropietarioData, UnidadFuncionalData } from "@/mocks/fixtures/data";
import { propietarios as fixturePropietarios } from "@/mocks/fixtures/data";
import { unidadesFuncionales as fixtureUfs } from "@/mocks/fixtures/data";
import { periode202605, periode202606 } from "@/mocks/fixtures/data";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConsorcioDetail } from "./ConsorcioDetail";
import { PeriodTimeline } from "./PeriodTimeline";
import { PropietarioList } from "./PropietarioList";
import { UfTable } from "./UfTable";

function ConsorcioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"general" | "ufs" | "propietarios" | "periodos">("general");

  if (!id) return null;

  const { data: consorcio, isLoading, isError } = useGetConsorcio(id);
  const { data: propList } = useListPropietarios(id);

  const configureUfs = useConfigureUfs();
  const openPeriod = useOpenPeriod();
  const closePeriod = useClosePeriod();
  const archivePeriod = useArchivePeriod();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !consorcio) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Consorcio no encontrado</p>
        <Link to="/consorcios">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Consorcios
          </Button>
        </Link>
      </div>
    );
  }

  const consorcioData = {
    id: String(consorcio.id ?? id),
    cuit: String(consorcio.cuit ?? ""),
    razon_social: consorcio.razon_social ?? "",
    nombre_fantasia:
      (consorcio as Record<string, string>).nombre_fantasia ?? consorcio.razon_social ?? "",
    matricula_caba: consorcio.admin_matricula ?? "",
    domicilio: consorcio.domicilio ?? "",
    iva_condition: "RI",
    status: consorcio.status ?? "ACTIVE",
    created_at: consorcio.created_at ?? "",
    updated_at: consorcio.updated_at ?? "",
  };

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "ufs" as const, label: "Unidades Funcionales" },
    { key: "propietarios" as const, label: "Propietarios" },
    { key: "periodos" as const, label: "Períodos" },
  ];

  return (
    <div>
      <Link
        to="/consorcios"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Consorcios
      </Link>

      <ConsorcioDetail consorcio={consorcioData}>
        <div className="border-b mb-6">
          <nav className="flex gap-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {tab === "general" && null}
        {tab === "ufs" && (
          <UfTable
            ufs={fixtureUfs as UnidadFuncionalData[]}
            onSave={() => configureUfs.mutate({ id, data: {} as never })}
            isSaving={configureUfs.isPending}
          />
        )}
        {tab === "propietarios" && (
          <PropietarioList
            propietarios={
              (propList?.propietarios ?? fixturePropietarios) as unknown as PropietarioData[]
            }
            isLoading={false}
            consorcioId={id}
          />
        )}
        {tab === "periodos" && (
          <PeriodTimeline
            periods={[periode202606, periode202605]}
            onOpen={(data) => openPeriod.mutate({ id, data: data as never })}
            onClose={(pid) => closePeriod.mutate({ id, periodId: pid })}
            onArchive={(pid) => archivePeriod.mutate({ id, periodId: pid })}
            isMutating={openPeriod.isPending || closePeriod.isPending || archivePeriod.isPending}
          />
        )}
      </ConsorcioDetail>
    </div>
  );
}

export { ConsorcioDetailPage };
