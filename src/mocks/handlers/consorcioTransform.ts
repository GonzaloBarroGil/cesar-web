import type { ConsorcioData, PeriodData, PropietarioData } from "@/mocks/fixtures/data";

/**
 * Maps a MSW fixture ConsorcioData to an orval-compliant ConsorcioResponse shape.
 */
function toConsorcioResponse(c: ConsorcioData) {
  return {
    id: c.id,
    cuit: c.cuit,
    razon_social: c.razon_social,
    nombre_fantasia: c.nombre_fantasia,
    domicilio: c.domicilio,
    admin_matricula: c.matricula_caba || null,
    fiscal_year_start: c.fiscal_year_start ?? 1,
    late_interest_rate: { value: c.late_interest_rate ?? "0.00" },
    round_off_limit: { amount: c.round_off_limit ?? "0.50", currency: "ARS" },
    iva_condition: c.iva_condition,
    status: c.status,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

/**
 * Maps a MSW fixture PropietarioData to an orval-compliant Propietario response shape.
 */
function toPropietarioResponse(p: PropietarioData) {
  return {
    id: p.id,
    tax_id: { type: p.tax_id_type, value: p.tax_id },
    name: p.nombre_completo,
    nombre_completo: p.nombre_completo,
    tax_id_type: p.tax_id_type,
    email: p.email,
    phone: p.phone || null,
    iva_condition: p.iva_condition,
    unidad_funcional_id: p.unidad_funcional_id,
    is_owner: p.is_owner,
    signature_hash: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Maps a MSW fixture propietario array to an orval-compliant PropietarioListResponse.
 */
function toPropietarioListResponse(list: PropietarioData[]) {
  return {
    propietarios: list.map(toPropietarioResponse),
  };
}

/**
 * Maps a MSW fixture PeriodData to an orval-compliant PeriodResponse shape.
 */
function toPeriodResponse(p: PeriodData) {
  return {
    id: p.id,
    consorcio_id: p.consorcio_id,
    code: { code: p.code },
    start_date: p.start_date,
    end_date: p.end_date,
    due_date: p.end_date,
    status: p.status,
    closed_at: p.closed_at as string | null,
    created_at: p.created_at,
    updated_at: new Date().toISOString(),
  };
}

export { toConsorcioResponse, toPropietarioResponse, toPropietarioListResponse, toPeriodResponse };
