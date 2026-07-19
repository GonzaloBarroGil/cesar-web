import { FlowSubType } from "@/api/generated/models";
import type { FlowDirection } from "@/api/generated/models";

const subTypeLabels: Record<string, string> = {
  INCOME_RENT: "Alquiler",
  INCOME_ON_DEMAND_SERVICE: "Servicio",
  INCOME_INSURANCE: "Seguro",
  INCOME_OTHER: "Otro ingreso",
  OUTPUT_SALARY_TEMP: "Salario (temp)",
  OUTPUT_INVESTMENT_TEMP: "Inversión (temp)",
  OUTPUT_LEGAL_TEMP: "Legal (temp)",
  OUTPUT_OTHER: "Otro egreso",
};

const incomeSubTypes: FlowSubType[] = [
  FlowSubType.INCOME_RENT,
  FlowSubType.INCOME_ON_DEMAND_SERVICE,
  FlowSubType.INCOME_INSURANCE,
  FlowSubType.INCOME_OTHER,
];

const outputSubTypes: FlowSubType[] = [
  FlowSubType.OUTPUT_SALARY_TEMP,
  FlowSubType.OUTPUT_INVESTMENT_TEMP,
  FlowSubType.OUTPUT_LEGAL_TEMP,
  FlowSubType.OUTPUT_OTHER,
];

function subTypesForDirection(direction: FlowDirection): FlowSubType[] {
  return direction === "INCOME" ? incomeSubTypes : outputSubTypes;
}

function subTypeLabel(subType: string): string {
  return subTypeLabels[subType] ?? subType;
}

function isTempSubType(subType: string): boolean {
  return subType.endsWith("_TEMP");
}

function MigrationBadge({ subType }: { subType: string }) {
  if (!isTempSubType(subType)) return null;

  return (
    <span
      className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
      title="Este tipo de egreso será migrado a su módulo dedicado en una fase futura del sistema."
    >
      Migración pendiente
    </span>
  );
}

export { MigrationBadge, isTempSubType, subTypeLabel, subTypesForDirection };
