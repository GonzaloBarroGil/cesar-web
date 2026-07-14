import type { IncomeOutputData } from "@/mocks/fixtures/data";

function toIncomeOutputResponse(io: IncomeOutputData) {
  return {
    id: io.id,
    consorcio_id: io.consorcio_id,
    period_code: io.period_code,
    direction: io.direction as "INCOME" | "OUTPUT",
    sub_type: io.sub_type as
      | "INCOME_RENT"
      | "INCOME_ON_DEMAND_SERVICE"
      | "INCOME_INSURANCE"
      | "INCOME_OTHER"
      | "OUTPUT_SALARY_TEMP"
      | "OUTPUT_INVESTMENT_TEMP"
      | "OUTPUT_LEGAL_TEMP"
      | "OUTPUT_OTHER",
    date: io.date,
    amount: io.amount,
    description: io.description,
    invoice_id: io.invoice_id || undefined,
    recibo_id: undefined as string | undefined,
    tags: io.migration_tag ? [io.migration_tag] : [],
    status: io.status as "ACTIVE" | "CANCELLED",
    hash: io.hash,
    version: io.version,
    created_at: io.created_at,
    created_by: "" as string,
    tombstone: io.tombstone,
  };
}

function toFinancialSummary(data: {
  total_income: number;
  total_output: number;
  opening_balance?: number;
}) {
  const netFlow = data.total_income - data.total_output;
  return {
    total_income: {
      amount: data.total_income.toFixed(2),
      currency: "ARS" as string | undefined,
    },
    total_output: {
      amount: data.total_output.toFixed(2),
      currency: "ARS" as string | undefined,
    },
    net_flow: { amount: netFlow.toFixed(2), currency: "ARS" as string | undefined },
    opening_balance:
      data.opening_balance !== undefined
        ? { amount: data.opening_balance.toFixed(2), currency: "ARS" as string | undefined }
        : undefined,
    closing_balance:
      data.opening_balance !== undefined
        ? {
            amount: (data.opening_balance + netFlow).toFixed(2),
            currency: "ARS" as string | undefined,
          }
        : undefined,
  };
}

export { toIncomeOutputResponse, toFinancialSummary };
