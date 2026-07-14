import type { CategoryData, ConceptData, ExpenseData, ProviderData } from "@/mocks/fixtures/data";

const GROUP_TO_CONCEPT_GROUP: Record<string, string> = {
  A: "MANTENIMIENTO",
  B: "PERSONAL",
  C: "OTROS",
};

function toExpenseResponse(e: ExpenseData) {
  return {
    id: e.id,
    consorcio_id: e.consorcio_id,
    period_code: e.period_code,
    category_id: e.category_id,
    concept_id: e.concept_id,
    item: e.description,
    term: e.term_current,
    total_terms: e.terms_total,
    provider_id: e.provider_id || ("" as string),
    invoice_id: e.invoice_id || undefined,
    cost: e.total_cost,
    expense_type: e.type as "ORDINARIA" | "EXTRAORDINARIA",
    approval_status: e.status as "PENDING" | "APPROVED" | "REJECTED",
    hash: e.hash,
    version: e.version,
    created_at: e.created_at,
    created_by: "" as string,
    tombstone: e.tombstone,
  };
}

function toConceptResponse(c: ConceptData) {
  return {
    id: c.id,
    name: c.name,
    group: (GROUP_TO_CONCEPT_GROUP[c.group] || "OTROS") as
      | "SERVICIOS"
      | "MANTENIMIENTO"
      | "PERSONAL"
      | "IMPUESTOS"
      | "SEGUROS"
      | "OTROS",
  };
}

function toCategoryResponse(c: CategoryData) {
  return {
    id: c.id,
    name: c.name,
    default_concept_id: undefined as string | undefined,
  };
}

function toProviderResponse(p: ProviderData) {
  return {
    id: p.id,
    cuit: p.cuit,
    name: p.nombre,
    iva_condition: p.iva_condition as "RI" | "MONOTRIBUTISTA" | "EXENTO" | "CF" | "NO_RESPONSABLE",
    provider_type: "COMPANY" as "INDIVIDUAL" | "COMPANY",
    contact_email: p.email || undefined,
    contact_phone: p.phone || undefined,
    tombstone: p.tombstone,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export { toExpenseResponse, toConceptResponse, toCategoryResponse, toProviderResponse };
