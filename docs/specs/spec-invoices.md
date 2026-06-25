# SPEC — Invoices

> **Feature:** ARCA-compliant invoicing: Factura A/B/C, Notas de Crédito/Débito, Recibos
> **Phase:** SPEC
> **Depends on:** Auth (role guard for ADMIN + ACCOUNTANT), Layout (app shell), Consorcios (IVA condition)
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Provide ARCA-compliant electronic invoice creation and management for Argentine
condominium administration. Covers three ARCA invoice types (Factura A/B/C),
adjustment documents (Nota de Crédito, Nota de Débito), and payment receipts
(Recibos B/C). Multi-role access: ADMIN and ACCOUNTANT.

### API Surface

12 endpoints:

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/invoices/factura-a` | POST | ADMIN, ACCOUNTANT | Create Factura A (RI → RI, IVA discriminado) |
| `/invoices/factura-b` | POST | ADMIN, ACCOUNTANT | Create Factura B (RI → CF/Exento/Monotributista) |
| `/invoices/factura-c` | POST | ADMIN, ACCOUNTANT | Create Factura C (CF) |
| `/invoices/{id}` | GET | ADMIN, ACCOUNTANT | Get invoice detail |
| `/invoices/cae/{cae}` | GET | ADMIN, ACCOUNTANT | Get invoice by CAE |
| `/invoices/{id}/anular` | PUT | ADMIN | Annul invoice (ADMIN only) |
| `/invoices/{id}/nota-credito` | POST | ADMIN, ACCOUNTANT | Create Nota de Crédito linked to invoice |
| `/invoices/nota-credito/{id}/anular` | PUT | ADMIN | Annul NC |
| `/invoices/{id}/nota-debito` | POST | ADMIN, ACCOUNTANT | Create Nota de Débito linked to invoice |
| `/invoices/nota-debito/{id}/anular` | PUT | ADMIN | Annul ND |
| `/recibos` | POST | ADMIN, ACCOUNTANT | Create Recibo |
| `/recibos/{id}/anular` | PUT | ADMIN | Annul Recibo |

### Domain Concepts

- **Factura A**: RI → RI. IVA discriminado (neto + iva breakdown per rate).
  Requires receptor CUIT. Includes `adicionales_rg` (field 17, 18.1, 18.2).
- **Factura B**: RI → CF/Exento/Monotributista. IVA no discriminado (total
  includes IVA). CUIT required if amount ≥ $5,000 or receptor is wholesale.
- **Factura C**: CF emisor. Simplified, no IVA, no CUIT.
- **CAE**: Código de Autorización Electrónica (14 digits). Unique, expiry date,
  displayed with QR code link.
- **Nota de Crédito**: Reduces original invoice amount. Linked to parent
  invoice. Remaining amount validation. Motivo required.
- **Nota de Débito**: Increases original invoice amount. Linked to parent
  invoice. No upper bound. Motivo required.
- **Recibo**: Payment receipt. Type B (RI consorcio) or C (EXENTO/CF consorcio).
  Links to invoice or liquidación. Medio de pago required.
- **Annul**: All annul mutations are ADMIN-only. Use DEC-001 (optimistic) +
  DEC-002 (confirmation dialog). Add a comment field for audit traceability.
- **IVA Contenido**: Display label per RG 5614/2024 for Factura B/C.
- **QR Code**: Display as image/link per RG 4892/2020.

### Roles

| Action | ADMIN | ACCOUNTANT |
|---|---|---|
| Create invoices (A/B/C) | Yes | Yes |
| Create NC/ND | Yes | Yes |
| Create Recibos | Yes | Yes |
| View invoices | Yes | Yes |
| Annul any document | Yes | No |
| Access `/invoices` route | Yes | Yes |

---

## 2. Pages

| Page | Route | Auth | Description |
|---|---|---|---|
| `InvoiceListPage` | `/invoices` | ADMIN, ACCOUNTANT | Table filtered by tipo, date range, status. |
| `InvoiceDetailPage` | `/invoices/:id` | ADMIN, ACCOUNTANT | Full invoice display: header, items table, IVA breakdown, CAE, QR code. Annul button (ADMIN only). NC/ND creation links. |
| `FacturaACreatePage` | `/invoices/factura-a/new` | ADMIN, ACCOUNTANT | Complex form: receptor CUIT, IVA rate selector per item, items table with subtotals, IVA breakdown preview, adicionales RG fields. |
| `FacturaBCreatePage` | `/invoices/factura-b/new` | ADMIN, ACCOUNTANT | Similar to A but CUIT conditional (tooltip: ≥$5k or wholesale). IVA no discriminado. |
| `FacturaCCreatePage` | `/invoices/factura-c/new` | ADMIN, ACCOUNTANT | Simplified: no CUIT, no IVA fields. |
| `NotaCreditoCreatePage` | `/invoices/:id/nc/new` | ADMIN, ACCOUNTANT | Linked to parent invoice. Motivo selector. Amount field with remaining validation. |
| `NotaDebitoCreatePage` | `/invoices/:id/nd/new` | ADMIN, ACCOUNTANT | Linked to parent invoice. Motivo selector. Amount field (no upper bound). |
| `ReciboCreatePage` | `/invoices/recibos/new` | ADMIN, ACCOUNTANT | Reference selector: invoice or liquidación. Medio de pago dropdown. Auto-type based on consorcio IVA. |
| `ReciboDetailPage` | `/invoices/recibos/:id` | ADMIN, ACCOUNTANT | Detail + annul (ADMIN). |

---

## 3. User Flows

### 3.1 Factura A — Create

1. User navigates to `/invoices/factura-a/new`.
2. Receptor section: CUIT field (required), nombre, IVA condition display (auto: RI).
3. Items table: add row → description, cantidad, precio unitario, IVA rate (21%, 10.5%, 27%, 0%).
4. Each row auto-computes subtotal and IVA amount.
5. Totals section: neto (sum of subtotals), iva (sum of IVA by rate bucket), total.
6. Adicionales RG section: field 17 (tipo), field 18.1 (alícuota), field 18.2 (monto IVA).
7. Submit → `POST /invoices/factura-a`.
8. On 201: redirect to `/invoices/:id`. CAE and QR displayed.
9. On 422: field-level errors (invalid CUIT, IVA rate mismatch).

### 3.2 Factura B — Create

1. Same structure as A, but:
   - Receptor CUIT: optional by default. Required if total ≥ $5,000 → field becomes required with tooltip: _"El CUIT es obligatorio para montos ≥ $5.000 o receptor mayorista."_
   - No IVA discrimination per item — only one precio_unitario field.
   - IVA total shown as iva_contenido (informational, per RG 5614/2024).
   - Totals: neto (subtotal - iva), iva_contenido, total.
   - Adicionales RG: simplified.

### 3.3 Factura C — Create

1. Simplified form:
   - No receptor CUIT field.
   - No IVA fields (rate, breakdown, contenido).
   - Only description, cantidad, precio_unitario per item.
   - Totals: only total (auto-computed).

### 3.4 Invoice — View Detail

1. User navigates to `/invoices/:id`.
2. `GET /invoices/{id}` fetches invoice.
3. Header: tipo_comprobante badge (A/B/C), punto_venta, numero_comprobante.
4. Emisor info: consorcio CUIT + razón social (from consorcio context).
5. Receptor info: CUIT (or "Consumidor Final" if absent), nombre, IVA condition.
6. Items table: same columns as form, non-editable.
7. IVA breakdown section (only for Factura A): per-rate buckets.
8. CAE display: 14-digit with expiry date. QR code image/link.
9. Status badge: ACTIVE / ANULADA.
10. Annul button (ADMIN only) → DEC-002 confirmation → DEC-001 optimistic.
11. _"Crear Nota de Crédito"_ and _"Crear Nota de Débito"_ links → navigate to NC/ND create pages.

### 3.5 Invoice — Annul

1. ADMIN clicks "Anular" on an ACTIVE invoice.
2. DEC-002: Confirmation dialog _"¿Anular esta factura? La factura quedará marcada como ANULADA y no podrá reactivarse. (Opcional) Motivo:"_.
3. On confirm → `PUT /invoices/{id}/anular`.
4. DEC-001: Optimistic update → status changes to ANULADA immediately.
5. On success: annul button hidden. On failure: rollback + toast.
6. Annulled invoices appear greyed out in list with strikethrough.

### 3.6 Nota de Crédito — Create

1. From an invoice detail page, user clicks "Crear Nota de Crédito".
2. Form: parent invoice info (read-only), motivo selector (dropdown), amount field.
3. Remaining amount validation: amount cannot exceed original invoice total
   minus existing NCs. Shown as _"Monto disponible: $ X.XXX,XX"_.
4. `POST /invoices/{id}/nota-credito`.
5. On 201: redirect to NC detail. CAE displayed.

### 3.7 Nota de Débito — Create

1. Same flow as NC but no upper amount bound.
2. `POST /invoices/{id}/nota-debito`.
3. Lists interest reasons in motivo selector (intereses punitorios,
   compensatorios, ajuste).

### 3.8 Recibo — Create

1. User navigates to `/invoices/recibos/new`.
2. Reference selector: "Factura" or "Liquidación" → search/select ID.
3. Amount field auto-filled from reference total. Editable for partial payments.
4. Medio de pago dropdown: EFECTIVO, TRANSFERENCIA, DEPÓSITO, MERCADOPAGO, OTRO.
5. Auto-type: Recibo B if consorcio IVA = RI; Recibo C if EXENTO/CF.
6. `POST /recibos`.
7. On 201: redirect to recibo detail.

### 3.9 Invoice — Search by CAE

1. Search bar at top of invoice list: CAE input.
2. `GET /invoices/cae/{cae}`.
3. On 200: redirect to `/invoices/:id`. On 404: _"No se encontró factura con ese CAE."_

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **InvoiceList** | Table | none | `loading` — skeleton. `ready` — rows with tipo/status badges. `empty` — CTA. `error` — retry. CAE search bar at top. |
| **FacturaAForm** | Form | none | `idle` — empty. `submitting`. `error`. Items table with add/remove rows. IVA breakdown auto-computed preview. CUIT validation. |
| **FacturaBForm** | Form | none | Same as A. CUIT conditional (total ≥ $5k → required). No IVA rate per item. |
| **FacturaCForm** | Form | none | Simplified. No CUIT. No IVA. |
| **InvoiceDetail** | Display | `invoiceId` | `loading` — skeleton. `ready` — full detail. `error` — not found. `anulled` — strikethrough styling. |
| **InvoiceItems** | Table | `items`, `readonly` | `display` — rows with computed totals. `edit` — add/remove/inline edit (in form context). |
| **InvoiceTotals** | Display | `neto`, `iva`, `total`, `ivaContenido` | Shows per-rate IVA breakdown for Factura A. Shows iva_contenido for B. Simple total for C. |
| **CaeQrDisplay** | Display | `cae`, `caeExpiry`, `qrCode` | Valid CAE → green badge + QR. Expired CAE → yellow badge + warning. |
| **NotaForm** | Form | `invoiceId`, `tipo` (NC/ND) | Tipo-specific: NC shows remaining amount; ND shows no upper bound. Motivo selector. |
| **ReciboForm** | Form | none | Reference selector. Auto-amount fill. Medio de pago. Auto-type display. |
| **ReciboDetail** | Display | `reciboId` | Same pattern as InvoiceDetail. |
| **AnnulButton** | Action | `onAnnul`, `disabled?` | `idle` — visible. `confirming` — dialog open (DEC-002). `optimistic` — spinner during mutation (DEC-001). `hidden` — already ANULADA or not ADMIN. |

---

## 5. State Management

### TanStack Query Keys

| Query | Key | Endpoint |
|---|---|---|
| Invoice detail | `["invoices", id]` | `GET /invoices/{id}` |
| Invoice by CAE | `["invoices", "cae", cae]` | `GET /invoices/cae/{cae}` |
| Recibo detail | `["recibos", id]` | `GET /recibos/{id}` |
| Invoice list (derived) | (list endpoint not in spec — MSW returns array; filtered client-side) | N/A |

### Mutations

| Mutation | Key | Endpoint | DEC-001 | DEC-002 |
|---|---|---|---|---|
| `useCreateFacturaA` | `facturaA.create` | `POST /invoices/factura-a` | No | No |
| `useCreateFacturaB` | `facturaB.create` | `POST /invoices/factura-b` | No | No |
| `useCreateFacturaC` | `facturaC.create` | `POST /invoices/factura-c` | No | No |
| `useAnularInvoice` | `invoices.annul` | `PUT /invoices/{id}/anular` | Yes | Yes |
| `useCreateNotaCredito` | `nc.create` | `POST /invoices/{id}/nota-credito` | No | No |
| `useAnularNotaCredito` | `nc.annul` | `PUT /invoices/nota-credito/{id}/anular` | Yes | Yes |
| `useCreateNotaDebito` | `nd.create` | `POST /invoices/{id}/nota-debito` | No | No |
| `useAnularNotaDebito` | `nd.annul` | `PUT /invoices/nota-debito/{id}/anular` | Yes | Yes |
| `useCreateRecibo` | `recibos.create` | `POST /recibos` | No | No |
| `useAnularRecibo` | `recibos.annul` | `PUT /recibos/{id}/anular` | Yes | Yes |

### Client-Side Computations

- **IVA breakdown per rate**: Items table computes subtotal and IVA per row.
  FacturaAForm groups IVA by rate (21%, 10.5%, 27%, 0%) for display.
- **Factura B CUIT required**: Watch `total` → if parseFloat ≥ 5000, set
  receptor_cuit field to required.
- **NC remaining amount**: Original invoice `total.amount` minus sum of
  existing NC `amount` values (fetched or computed from list).
- **Recibo type**: Read consorcio IVA condition from `ConsorcioContext` →
  ReciboB for RI/Monotributista, ReciboC for EXENTO/CF.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| CUIT inválido | Zod validation on Factura A form | Inline error: _"CUIT inválido. Debe tener 11 dígitos."_ | FacturaAForm |
| CUIT faltante (A) | Submit Factura A without CUIT | Inline error: _"CUIT del receptor es requerido para Factura A."_ | FacturaAForm |
| CUIT faltante (B, ≥$5k) | Factura B total ≥ $5,000 without CUIT | Inline error: _"CUIT requerido para montos ≥ $5.000."_ | FacturaBForm |
| IVA rate mismatch | Backend 422 | Field-level error on items row | FacturaAForm |
| NC exceeds remaining | Amount > original - existing NCs | Inline error: _"El monto supera el disponible ($ X.XXX,XX)."_ | NotaForm |
| Invoice not found | 404 from GET /invoices/{id} | _"Factura no encontrada."_ with back link | InvoiceDetail |
| CAE not found | 404 from GET /invoices/cae/{cae} | Inline: _"No se encontró factura con ese CAE."_ | InvoiceList search |
| Annul fails | 422 from annul mutation | DEC-001 rollback: status reverts, buttons reappear. Toast: _"No se pudo anular el documento."_ | AnnulButton |
| Invoice already annulled | 422 from annul | Toast: _"La factura ya está anulada."_ | AnnulButton |

---

## 7. BDD Scenario Coverage

Estimated **28 scenarios** across 6 feature files:

| # | File | Scenarios | Focus |
|---|---|---|---|
| 1 | `features/invoices/factura-a.feature` | 6 | Create A (RI→RI), invalid CUIT, missing CUIT, IVA rate breakdown display, CAE+QR display, create A with multiple items |
| 2 | `features/invoices/factura-b.feature` | 5 | Create B (CF receptor), CUIT required at ≥$5k, CUIT optional below $5k, IVA contenido display, no IVA discrimination |
| 3 | `features/invoices/factura-c.feature` | 3 | Create C (CF), simplified form hides IVA/CUIT fields, total computation |
| 4 | `features/invoices/ajustes.feature` | 7 | Create NC linked, Create ND linked, NC remaining validation, NC amount exceeded, NC/ND motivo selector, NC/ND annul confirmation, optimistic annul rollback |
| 5 | `features/invoices/recibo.feature` | 4 | Create recibo linked to invoice, create recibo linked to liquidacion, auto-type (B vs C), annul recibo |
| 6 | `features/invoices/anulacion.feature` | 3 | Annul invoice with confirmation (DEC-002), ACCOUNTANT cannot see annul button, optimistic annul (DEC-001) with rollback |

---

## 8. API Coverage Checklist

All 12 invoices endpoints defined in the OpenAPI spec:

- [ ] `POST /invoices/factura-a` — consumed by `useCreateFacturaA()` in FacturaAForm
- [ ] `POST /invoices/factura-b` — consumed by `useCreateFacturaB()` in FacturaBForm
- [ ] `POST /invoices/factura-c` — consumed by `useCreateFacturaC()` in FacturaCForm
- [ ] `GET /invoices/{id}` — consumed by `useInvoice()` in InvoiceDetail
- [ ] `GET /invoices/cae/{cae}` — consumed by CAE search in InvoiceList
- [ ] `PUT /invoices/{id}/anular` — consumed by `useAnularInvoice()` in InvoiceDetail. DEC-001 + DEC-002.
- [ ] `POST /invoices/{id}/nota-credito` — consumed by `useCreateNotaCredito()` in NotaForm
- [ ] `PUT /invoices/nota-credito/{id}/anular` — consumed by `useAnularNotaCredito()`. DEC-001 + DEC-002.
- [ ] `POST /invoices/{id}/nota-debito` — consumed by `useCreateNotaDebito()` in NotaForm
- [ ] `PUT /invoices/nota-debito/{id}/anular` — consumed by `useAnularNotaDebito()`. DEC-001 + DEC-002.
- [ ] `POST /recibos` — consumed by `useCreateRecibo()` in ReciboForm
- [ ] `PUT /recibos/{id}/anular` — consumed by `useAnularRecibo()`. DEC-001 + DEC-002.
- [ ] All endpoints have orval-generated hooks in `src/api/generated/invoices/invoices.ts`
- [ ] All endpoints have MSW handlers in `src/mocks/handlers/invoices.ts`
- [ ] Annul endpoints are ADMIN-only in MSW handlers (verified: ACCOUNTANT gets 403)

### No new gaps.

---

*End of SPEC — Invoices.*
