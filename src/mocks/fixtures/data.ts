export interface ConsorcioData {
  id: string;
  cuit: string;
  razon_social: string;
  nombre_fantasia: string;
  matricula_caba: string;
  domicilio: string;
  iva_condition: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UnidadFuncionalData {
  id: string;
  consorcio_id: string;
  uf_code: string;
  floor: string;
  unit: string;
  percentage_a: string;
  percentage_b: string;
  percentage_c: string;
  exempt_from: string[];
}

export interface PropietarioData {
  id: string;
  consorcio_id: string;
  unidad_funcional_id: string;
  tax_id: string;
  tax_id_type: string;
  nombre_completo: string;
  iva_condition: string;
  email: string;
  phone: string;
  is_owner: boolean;
}

export interface PeriodData {
  id: string;
  consorcio_id: string;
  code: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  closed_at: string | null;
  archived_at: string | null;
}

export interface ExpenseData {
  id: string;
  consorcio_id: string;
  period_code: string;
  group: string;
  type: string;
  status: string;
  concept_id: string;
  category_id: string;
  provider_id: string | null;
  total_cost: { amount: string; currency: string };
  invoice_id: string | null;
  description: string;
  terms_total: number;
  term_current: number;
  version: number;
  hash: string;
  tombstone: boolean;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
}

export interface ProviderData {
  id: string;
  consorcio_id: string;
  cuit: string;
  nombre: string;
  iva_condition: string;
  email: string;
  phone: string;
  tombstone: boolean;
}

export interface ConceptData {
  id: string;
  group: string;
  name: string;
  description: string;
}

export interface CategoryData {
  id: string;
  group: string;
  name: string;
}

export interface InvoiceData {
  id: string;
  consorcio_id: string;
  tipo_comprobante: string;
  punto_venta: number;
  numero_comprobante: number;
  cae: string;
  cae_expiry: string;
  emision_date: string;
  receptor_cuit: string | null;
  receptor_nombre: string;
  receptor_iva: string;
  items: InvoiceLineData[];
  neto: { amount: string; currency: string };
  iva: { amount: string; currency: string };
  total: { amount: string; currency: string };
  iva_contenido: { amount: string; currency: string };
  adicionales_rg: Record<string, string>;
  qr_code: string;
  status: string;
  hash: string;
  tombstone: boolean;
  created_at: string;
}

export interface InvoiceLineData {
  description: string;
  cantidad: number;
  precio_unitario: { amount: string; currency: string };
  iva_rate: string;
  subtotal: { amount: string; currency: string };
  iva_amount: { amount: string; currency: string };
}

export interface NotaCreditoData {
  id: string;
  consorcio_id: string;
  factura_id: string;
  punto_venta: number;
  numero_comprobante: number;
  cae: string;
  cae_expiry: string;
  emision_date: string;
  motivo: string;
  amount: { amount: string; currency: string };
  status: string;
  hash: string;
  created_at: string;
}

export interface NotaDebitoData {
  id: string;
  consorcio_id: string;
  factura_id: string;
  punto_venta: number;
  numero_comprobante: number;
  cae: string;
  cae_expiry: string;
  emision_date: string;
  motivo: string;
  amount: { amount: string; currency: string };
  status: string;
  hash: string;
  created_at: string;
}

export interface ReciboData {
  id: string;
  consorcio_id: string;
  tipo: string;
  numero: number;
  emision_date: string;
  amount: { amount: string; currency: string };
  factura_id: string | null;
  liquidacion_id: string | null;
  medio_pago: string;
  status: string;
  hash: string;
  created_at: string;
}

export interface LiquidacionData {
  id: string;
  consorcio_id: string;
  period_code: string;
  unidad_funcional_id: string;
  unit_code: string;
  status: string;
  allocations: ExpenseAllocationData[];
  previous_balance: { amount: string; currency: string };
  total_expenses: { amount: string; currency: string };
  total_payments: { amount: string; currency: string };
  punitive_interest: { amount: string; currency: string };
  compensatory_interest: { amount: string; currency: string };
  round_off: { amount: string; currency: string };
  current_balance: { amount: string; currency: string };
  qr_code: string;
  hash: string;
  version: number;
  created_at: string;
  issued_at: string | null;
}

export interface ExpenseAllocationData {
  expense_id: string;
  description: string;
  group: string;
  total_cost: { amount: string; currency: string };
  unit_share: { amount: string; currency: string };
  percentage: string;
}

export interface CertificadoDeudaData {
  id: string;
  consorcio_id: string;
  liquidacion_id: string;
  unidad_funcional_id: string;
  unit_code: string;
  period_code: string;
  amount: { amount: string; currency: string };
  status: string;
  is_executive_title: boolean;
  consejo_approval: string[];
  expires_at: string;
  hash: string;
  created_at: string;
  signed_at: string | null;
}

export interface PaymentData {
  id: string;
  consorcio_id: string;
  unidad_funcional_id: string;
  period_code: string;
  amount: { amount: string; currency: string };
  medio_pago: string;
  voucher_number: string | null;
  no_voucher_warning: boolean;
  recibo_id: string | null;
  status: string;
  hash: string;
  version: number;
  created_at: string;
}

export interface IncomeOutputData {
  id: string;
  consorcio_id: string;
  period_code: string;
  direction: string;
  sub_type: string;
  description: string;
  amount: { amount: string; currency: string };
  date: string;
  invoice_id: string | null;
  migration_tag: string | null;
  status: string;
  hash: string;
  version: number;
  tombstone: boolean;
  created_at: string;
}

export interface UserData {
  id: string;
  username: string;
  role: string;
  consorcio_id: string | null;
  nombre_completo: string;
}

export const TORRE_NORTE_ID = "550e8400-e29b-41d4-a716-446655440001";
export const TORRE_NORTE_CUIT = "30711111111";
export const UF_1A_ID = "550e8400-e29b-41d4-a716-446655440101";
export const UF_1B_ID = "550e8400-e29b-41d4-a716-446655440102";
export const UF_2A_ID = "550e8400-e29b-41d4-a716-446655440103";
export const ADMIN_USER_ID = "550e8400-e29b-41d4-a716-446655449999";

// --- Consorcio ---
export const consorcioTorreNorte: ConsorcioData = {
  id: TORRE_NORTE_ID,
  cuit: TORRE_NORTE_CUIT,
  razon_social: "Consorcio Torre Norte",
  nombre_fantasia: "Torre Norte",
  matricula_caba: "MAT-2024-001234",
  domicilio: "Av. Corrientes 4500, Piso 12, CABA",
  iva_condition: "RI",
  status: "ACTIVE",
  created_at: "2026-01-15T10:00:00Z",
  updated_at: "2026-06-20T14:30:00Z",
};

export const unidadesFuncionales: UnidadFuncionalData[] = [
  {
    id: UF_1A_ID,
    consorcio_id: TORRE_NORTE_ID,
    uf_code: "1A",
    floor: "1",
    unit: "A",
    percentage_a: "40.00",
    percentage_b: "35.00",
    percentage_c: "35.00",
    exempt_from: [],
  },
  {
    id: UF_1B_ID,
    consorcio_id: TORRE_NORTE_ID,
    uf_code: "1B",
    floor: "1",
    unit: "B",
    percentage_a: "35.00",
    percentage_b: "35.00",
    percentage_c: "35.00",
    exempt_from: ["C"],
  },
  {
    id: UF_2A_ID,
    consorcio_id: TORRE_NORTE_ID,
    uf_code: "2A",
    floor: "2",
    unit: "A",
    percentage_a: "25.00",
    percentage_b: "30.00",
    percentage_c: "30.00",
    exempt_from: [],
  },
];

export const propietarios: PropietarioData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440201",
    consorcio_id: TORRE_NORTE_ID,
    unidad_funcional_id: UF_1A_ID,
    tax_id: "20123456781",
    tax_id_type: "CUIT",
    nombre_completo: "Juan Carlos López",
    iva_condition: "RI",
    email: "jlopez@email.com",
    phone: "1155550101",
    is_owner: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440202",
    consorcio_id: TORRE_NORTE_ID,
    unidad_funcional_id: UF_1B_ID,
    tax_id: "27345678901",
    tax_id_type: "CUIT",
    nombre_completo: "María Inés Rodríguez",
    iva_condition: "MONOTRIBUTISTA",
    email: "mrodriguez@email.com",
    phone: "1155550102",
    is_owner: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440203",
    consorcio_id: TORRE_NORTE_ID,
    unidad_funcional_id: UF_2A_ID,
    tax_id: "23456789012",
    tax_id_type: "CUIT",
    nombre_completo: "Carlos Alberto Fernández",
    iva_condition: "EXENTO",
    email: "cfernandez@email.com",
    phone: "1155550103",
    is_owner: false,
  },
];

export const periode202606: PeriodData = {
  id: "550e8400-e29b-41d4-a716-446655440301",
  consorcio_id: TORRE_NORTE_ID,
  code: "202606",
  start_date: "2026-06-01",
  end_date: "2026-06-30",
  status: "OPEN",
  created_at: "2026-05-25T10:00:00Z",
  closed_at: null,
  archived_at: null,
};

export const periode202605: PeriodData = {
  id: "550e8400-e29b-41d4-a716-446655440302",
  consorcio_id: TORRE_NORTE_ID,
  code: "202605",
  start_date: "2026-05-01",
  end_date: "2026-05-31",
  status: "CLOSED",
  created_at: "2026-04-25T10:00:00Z",
  closed_at: "2026-06-01T10:00:00Z",
  archived_at: null,
};

// --- Expenses ---
export const providers: ProviderData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440401",
    consorcio_id: TORRE_NORTE_ID,
    cuit: "30555555551",
    nombre: "ELEVADORES SRL",
    iva_condition: "RI",
    email: "admin@elevadoressrl.com.ar",
    phone: "1144440101",
    tombstone: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440402",
    consorcio_id: TORRE_NORTE_ID,
    cuit: "27555555552",
    nombre: "LIMPIEZA TOTAL SA",
    iva_condition: "RI",
    email: "facturas@limpiezatotal.com.ar",
    phone: "1144440102",
    tombstone: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440403",
    consorcio_id: TORRE_NORTE_ID,
    cuit: "20555555553",
    nombre: "SUTERH",
    iva_condition: "EXENTO",
    email: "aportes@suterh.org.ar",
    phone: "1144440103",
    tombstone: false,
  },
];

export const concepts: ConceptData[] = [
  { id: "550e8400-e29b-41d4-a716-446655440501", group: "A", name: "Mantenimiento de ascensores", description: "Servicio de mantenimiento mensual de ascensores" },
  { id: "550e8400-e29b-41d4-a716-446655440502", group: "A", name: "Limpieza general", description: "Servicio de limpieza de espacios comunes" },
  { id: "550e8400-e29b-41d4-a716-446655440503", group: "B", name: "Sueldo encargado", description: "Sueldo y cargas sociales del encargado" },
  { id: "550e8400-e29b-41d4-a716-446655440504", group: "B", name: "Seguridad", description: "Servicio de vigilancia" },
  { id: "550e8400-e29b-41d4-a716-446655440505", group: "C", name: "Fondo de reserva", description: "Aporte al fondo de reserva" },
  { id: "550e8400-e29b-41d4-a716-446655440506", group: "A", name: "Jardinería", description: "Mantenimiento de espacios verdes" },
  { id: "550e8400-e29b-41d4-a716-446655440507", group: "C", name: "Reparación extraordinaria", description: "Reparaciones no recurrentes" },
];

export const categories: CategoryData[] = [
  { id: "550e8400-e29b-41d4-a716-446655440601", group: "A", name: "Mantenimiento" },
  { id: "550e8400-e29b-41d4-a716-446655440602", group: "A", name: "Servicios públicos" },
  { id: "550e8400-e29b-41d4-a716-446655440603", group: "B", name: "Personal" },
  { id: "550e8400-e29b-41d4-a716-446655440604", group: "B", name: "Seguros" },
  { id: "550e8400-e29b-41d4-a716-446655440605", group: "C", name: "Reserva" },
  { id: "550e8400-e29b-41d4-a716-446655440606", group: "C", name: "Extraordinarios" },
];

export const expenses: ExpenseData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440701",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    group: "A",
    type: "ORDINARIA",
    status: "APPROVED",
    concept_id: concepts[0]!.id,
    category_id: categories[0]!.id,
    provider_id: providers[0]!.id,
    total_cost: { amount: "45000.00", currency: "ARS" },
    invoice_id: null,
    description: "Mantenimiento mensual de ascensores - Junio 2026",
    terms_total: 1,
    term_current: 1,
    version: 1,
    hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    tombstone: false,
    created_at: "2026-06-01T10:00:00Z",
    approved_at: "2026-06-01T10:00:00Z",
    rejected_at: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440702",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    group: "A",
    type: "ORDINARIA",
    status: "APPROVED",
    concept_id: concepts[1]!.id,
    category_id: categories[0]!.id,
    provider_id: providers[1]!.id,
    total_cost: { amount: "35000.00", currency: "ARS" },
    invoice_id: null,
    description: "Limpieza general espacios comunes - Junio 2026",
    terms_total: 1,
    term_current: 1,
    version: 1,
    hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    tombstone: false,
    created_at: "2026-06-01T10:05:00Z",
    approved_at: "2026-06-01T10:05:00Z",
    rejected_at: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440703",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    group: "B",
    type: "ORDINARIA",
    status: "APPROVED",
    concept_id: concepts[2]!.id,
    category_id: categories[2]!.id,
    provider_id: providers[2]!.id,
    total_cost: { amount: "280000.00", currency: "ARS" },
    invoice_id: null,
    description: "Sueldo encargado - Junio 2026",
    terms_total: 1,
    term_current: 1,
    version: 1,
    hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    tombstone: false,
    created_at: "2026-06-01T10:10:00Z",
    approved_at: "2026-06-01T10:10:00Z",
    rejected_at: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440704",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    group: "C",
    type: "ORDINARIA",
    status: "APPROVED",
    concept_id: concepts[4]!.id,
    category_id: categories[4]!.id,
    provider_id: null,
    total_cost: { amount: "50000.00", currency: "ARS" },
    invoice_id: null,
    description: "Fondo de reserva - Junio 2026",
    terms_total: 1,
    term_current: 1,
    version: 1,
    hash: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    tombstone: false,
    created_at: "2026-06-01T10:15:00Z",
    approved_at: "2026-06-01T10:15:00Z",
    rejected_at: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440705",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    group: "C",
    type: "EXTRAORDINARIA",
    status: "PENDING",
    concept_id: concepts[5]!.id,
    category_id: categories[5]!.id,
    provider_id: null,
    total_cost: { amount: "150000.00", currency: "ARS" },
    invoice_id: null,
    description: "Reparación de cubierta terraza",
    terms_total: 1,
    term_current: 1,
    version: 1,
    hash: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    tombstone: false,
    created_at: "2026-06-15T14:30:00Z",
    approved_at: null,
    rejected_at: null,
  },
];

// --- Invoices ---
export const invoices: InvoiceData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440801",
    consorcio_id: TORRE_NORTE_ID,
    tipo_comprobante: "FacturaA",
    punto_venta: 1,
    numero_comprobante: 1,
    cae: "12345678901234",
    cae_expiry: "2026-07-05T23:59:59Z",
    emision_date: "2026-06-05",
    receptor_cuit: TORRE_NORTE_CUIT,
    receptor_nombre: "Consorcio Torre Norte",
    receptor_iva: "RI",
    items: [
      { description: "Mantenimiento ascensores", cantidad: 1, precio_unitario: { amount: "45000.00", currency: "ARS" }, iva_rate: "21.0", subtotal: { amount: "45000.00", currency: "ARS" }, iva_amount: { amount: "9450.00", currency: "ARS" } },
    ],
    neto: { amount: "45000.00", currency: "ARS" },
    iva: { amount: "9450.00", currency: "ARS" },
    total: { amount: "54450.00", currency: "ARS" },
    iva_contenido: { amount: "0.00", currency: "ARS" },
    adicionales_rg: { campo_17: "IVA", campo_18_1: "21%", campo_18_2: "9450.00" },
    qr_code: "https://qr.afip.gob.ar?cae=12345678901234&fecha=2026-06-05",
    status: "ACTIVE",
    hash: "f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2",
    tombstone: false,
    created_at: "2026-06-05T09:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440802",
    consorcio_id: TORRE_NORTE_ID,
    tipo_comprobante: "FacturaA",
    punto_venta: 1,
    numero_comprobante: 2,
    cae: "23456789012345",
    cae_expiry: "2026-07-05T23:59:59Z",
    emision_date: "2026-06-05",
    receptor_cuit: TORRE_NORTE_CUIT,
    receptor_nombre: "Consorcio Torre Norte",
    receptor_iva: "RI",
    items: [
      { description: "Limpieza general", cantidad: 1, precio_unitario: { amount: "35000.00", currency: "ARS" }, iva_rate: "21.0", subtotal: { amount: "35000.00", currency: "ARS" }, iva_amount: { amount: "7350.00", currency: "ARS" } },
    ],
    neto: { amount: "35000.00", currency: "ARS" },
    iva: { amount: "7350.00", currency: "ARS" },
    total: { amount: "42350.00", currency: "ARS" },
    iva_contenido: { amount: "0.00", currency: "ARS" },
    adicionales_rg: { campo_17: "IVA", campo_18_1: "21%", campo_18_2: "7350.00" },
    qr_code: "https://qr.afip.gob.ar?cae=23456789012345&fecha=2026-06-05",
    status: "ACTIVE",
    hash: "a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3",
    tombstone: false,
    created_at: "2026-06-05T09:05:00Z",
  },
];

export const notasCredito: NotaCreditoData[] = [];
export const notasDebito: NotaDebitoData[] = [];
export const recibos: ReciboData[] = [];

// --- Debt ---
export const liquidaciones: LiquidacionData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440901",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    unidad_funcional_id: UF_1A_ID,
    unit_code: "1A",
    status: "DRAFT",
    allocations: [
      { expense_id: expenses[0]!.id, description: "Mantenimiento ascensores", group: "A", total_cost: { amount: "45000.00", currency: "ARS" }, unit_share: { amount: "18000.00", currency: "ARS" }, percentage: "40.00" },
      { expense_id: expenses[1]!.id, description: "Limpieza general", group: "A", total_cost: { amount: "35000.00", currency: "ARS" }, unit_share: { amount: "7954.55", currency: "ARS" }, percentage: "40.00" },
    ],
    previous_balance: { amount: "0.00", currency: "ARS" },
    total_expenses: { amount: "25954.55", currency: "ARS" },
    total_payments: { amount: "0.00", currency: "ARS" },
    punitive_interest: { amount: "0.00", currency: "ARS" },
    compensatory_interest: { amount: "0.00", currency: "ARS" },
    round_off: { amount: "0.00", currency: "ARS" },
    current_balance: { amount: "25954.55", currency: "ARS" },
    qr_code: "https://qr.afip.gob.ar?liq=202606-UF1A",
    hash: "a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4",
    version: 1,
    created_at: "2026-06-16T10:00:00Z",
    issued_at: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440902",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202605",
    unidad_funcional_id: UF_1A_ID,
    unit_code: "1A",
    status: "ISSUED",
    allocations: [
      { expense_id: "EXP-MAY-001", description: "Mantenimiento ascensores Mayo", group: "A", total_cost: { amount: "45000.00", currency: "ARS" }, unit_share: { amount: "18000.00", currency: "ARS" }, percentage: "40.00" },
    ],
    previous_balance: { amount: "0.00", currency: "ARS" },
    total_expenses: { amount: "18000.00", currency: "ARS" },
    total_payments: { amount: "0.00", currency: "ARS" },
    punitive_interest: { amount: "0.00", currency: "ARS" },
    compensatory_interest: { amount: "0.00", currency: "ARS" },
    round_off: { amount: "0.00", currency: "ARS" },
    current_balance: { amount: "18000.00", currency: "ARS" },
    qr_code: "https://qr.afip.gob.ar?liq=202605-UF1A",
    hash: "b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5",
    version: 1,
    created_at: "2026-06-01T10:00:00Z",
    issued_at: "2026-06-01T12:00:00Z",
  },
];

export const certifidadosDeuda: CertificadoDeudaData[] = [];

// --- Payments ---
export const payments: PaymentData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655441001",
    consorcio_id: TORRE_NORTE_ID,
    unidad_funcional_id: UF_1A_ID,
    period_code: "202605",
    amount: { amount: "18000.00", currency: "ARS" },
    medio_pago: "TRANSFER",
    voucher_number: "TRF-20260610-001",
    no_voucher_warning: false,
    recibo_id: null,
    status: "ACTIVE",
    hash: "c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6",
    version: 1,
    created_at: "2026-06-10T14:00:00Z",
  },
];

// --- Incomes/Outputs ---
export const incomesOutputs: IncomeOutputData[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655441101",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    direction: "INCOME",
    sub_type: "INCOME_RENT",
    description: "Alquiler de espacio publicitario en hall",
    amount: { amount: "35000.00", currency: "ARS" },
    date: "2026-06-10",
    invoice_id: null,
    migration_tag: null,
    status: "ACTIVE",
    hash: "d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7",
    version: 1,
    tombstone: false,
    created_at: "2026-06-10T10:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655441102",
    consorcio_id: TORRE_NORTE_ID,
    period_code: "202606",
    direction: "OUTPUT",
    sub_type: "OUTPUT_SALARY_TEMP",
    description: "Sueldo encargado - aportes SUTERH",
    amount: { amount: "85000.00", currency: "ARS" },
    date: "2026-06-05",
    invoice_id: null,
    migration_tag: "TEMP_SALARY",
    status: "ACTIVE",
    hash: "e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1a3b4c5d6e7f1",
    version: 1,
    tombstone: false,
    created_at: "2026-06-05T12:00:00Z",
  },
];

// --- Users ---
export const adminUser: UserData = {
  id: ADMIN_USER_ID,
  username: "admin",
  role: "ADMIN",
  consorcio_id: TORRE_NORTE_ID,
  nombre_completo: "Administrador General",
};

export const accountantUser: UserData = {
  id: "550e8400-e29b-41d4-a716-446655449998",
  username: "contador",
  role: "ACCOUNTANT",
  consorcio_id: TORRE_NORTE_ID,
  nombre_completo: "Contador Público",
};
