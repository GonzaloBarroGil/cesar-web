import type { CertificadoDeudaData, LiquidacionData } from "@/mocks/fixtures/data";

function toLiquidacion(liq: LiquidacionData) {
  return {
    id: liq.id,
    consorcio_id: liq.consorcio_id,
    period_code: liq.period_code,
    unit_id: liq.unidad_funcional_id,
    previous_balance: liq.previous_balance,
    expenses_breakdown: liq.allocations.map((a) => ({
      expense_id: a.expense_id,
      expense_group:
        ({ A: "MANTENIMIENTO", B: "PERSONAL", C: "OTROS" } as Record<string, string>)[a.group] ||
        "OTROS",
      description: a.description,
      total_cost: a.total_cost,
      distribution_type: "PERCENTAGE" as "PERCENTAGE" | "EQUAL" | "INDIVIDUAL",
      unit_percentage_applied: a.percentage,
      unit_share: a.unit_share,
    })),
    total_unit_expenses: liq.total_expenses,
    compensatory_interest: liq.compensatory_interest,
    punitive_interest: liq.punitive_interest,
    round_off: liq.round_off,
    total_debt: liq.current_balance,
    payments_applied: liq.total_payments,
    current_balance: liq.current_balance,
    liquidacion_number: `LC-${liq.period_code}-${liq.unit_code}`,
    qr_code: liq.qr_code,
    status: liq.status as "DRAFT" | "ISSUED" | "SETTLED" | "CANCELLED",
    hash: liq.hash,
    version: liq.version,
    generated_at: liq.created_at,
    issued_at: liq.issued_at,
    created_at: liq.created_at,
    tombstone: false,
  };
}

function toLiquidacionResponse(liq: LiquidacionData) {
  return { liquidacion: toLiquidacion(liq) };
}

function toLiquidacionListResponse(list: LiquidacionData[]) {
  return {
    liquidaciones: list.map(toLiquidacion),
    count: list.length,
  };
}

function toCertificadoDeuda(cert: CertificadoDeudaData) {
  return {
    id: cert.id,
    consorcio_id: cert.consorcio_id,
    unit_id: cert.unidad_funcional_id,
    total_debt: cert.amount,
    period_breakdown: [
      {
        period_code: cert.period_code,
        amount: cert.amount,
      },
    ],
    issue_date: cert.created_at,
    expires_at: cert.expires_at,
    administrator_signature: cert.signed_at || "",
    consejo_approval: cert.consejo_approval.length > 0 ? cert.consejo_approval.join(", ") : null,
    status: cert.status as "VIGENTE" | "VENCIDO" | "EJECUTADO",
    is_executive_title: cert.is_executive_title,
    source_liquidacion_hashes: [cert.liquidacion_id],
    hash: cert.hash,
  };
}

function toCertificadoResponse(cert: CertificadoDeudaData) {
  return { certificado: toCertificadoDeuda(cert) };
}

function toCertificadoListResponse(list: CertificadoDeudaData[]) {
  return {
    certificados: list.map(toCertificadoDeuda),
    count: list.length,
  };
}

export {
  toLiquidacion,
  toLiquidacionResponse,
  toLiquidacionListResponse,
  toCertificadoDeuda,
  toCertificadoResponse,
  toCertificadoListResponse,
};
