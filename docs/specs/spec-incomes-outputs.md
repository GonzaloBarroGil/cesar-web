# SPEC — Incomes/Outputs

> **Feature:** Cash-flow entries (income and output) with period summaries
> **Phase:** SPEC
> **Depends on:** Auth (role guard), Layout (app shell), Consorcios (periods), Invoices (INCOME_RENT invoice linking)
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Record income and output entries for a consorcio within a fiscal period,
track version history (append-only with hash chain), generate single-period
and cross-period financial summaries, and cancel entries via soft-delete.

### API Surface

6 endpoints (7 paths), all ADMIN-only:

| Endpoint | Method | Purpose |
|---|---|---|
| `/incomes-outputs` | POST | Create entry (income or output) |
| `/incomes-outputs` | GET | List entries (filters: direction, date range) |
| `/incomes-outputs/{id}` | GET | Get entry detail with version history |
| `/incomes-outputs/{id}` | PUT | Update entry (append-only versioning + new hash) |
| `/incomes-outputs/{id}/cancel` | PUT | Cancel entry (tombstone) |
| `/incomes-outputs/summary/{period_code}` | GET | Single-period summary (income/output/net) |
| `/incomes-outputs/summary` | GET | Cross-period summary (opening/closing balances) |

### Domain Concepts

- **Direction**: `INCOME` — funds received. `OUTPUT` — funds paid.
- **Sub-types by direction**:

  | Direction | Sub-type | Description | Invoice Linking |
  |---|---|---|---|
  | INCOME | `INCOME_RENT` | Rental income | May link to invoice if renter requires Factura A |
  | INCOME | `INCOME_SERVICE` | On-demand service income | No invoice link |
  | INCOME | `INCOME_INSURANCE` | Insurance recovery | No invoice link |
  | OUTPUT | `OUTPUT_SALARY_TEMP` | Temporary salary (Phase 2 bridge) | No invoice link. Shows migration tag. |
  | OUTPUT | `OUTPUT_INVESTMENT_TEMP` | Temporary investment (Phase 2 bridge) | No. Shows migration tag. |
  | OUTPUT | `OUTPUT_LEGAL_TEMP` | Temporary legal (Phase 2 bridge) | No. Shows migration tag. |

- **Sub-type conditional fields**: `invoice_id` field is shown only when
  sub_type is `INCOME_RENT`. Hidden for all other sub-types.
- **Migration tags**: OUTPUT sub-types with `_TEMP` suffix display a badge
  _"Migración pendiente"_ indicating they will migrate to dedicated Phase 2
  modules.
- **Append-only**: Updates create new versions with incremented version
  number and new SHA-256 hash. Cancel adds tombstone flag. No hard DELETE.
- **Period validation**: Entry `date` must fall within the period's
  `start_date..end_date` range. Frontend Zod validation warns; backend is
  the final authority. Cannot create or update entries for ARCHIVED periods.
- **Summary calculations**: Server-computed. Frontend only formats and
  displays `total_income`, `total_output`, `net_flow`, `opening_balance`,
  `closing_balance`.

---

## 2. Pages

| Page/View | Location | Auth | Description |
|---|---|---|---|
| `EntryListPage` | `/incomes-outputs` | ADMIN | Table with direction filter (TODOS/INCOME/OUTPUT), date range picker. Create button. Cancel action per row. |
| Entry create modal | From list page | ADMIN | Form with direction toggle, sub_type selector (dynamic), amount, date, description, invoice_id (conditional). |
| `EntryDetailPage` | `/incomes-outputs/:id` | ADMIN | Detail: direction badge, sub_type, description, amount, date, invoice link, hash. Version history tab. Update form section. Cancel button. |
| `SummaryPage` | `/incomes-outputs/summary` | ADMIN | Two tabs: "Por Período" (single-period) and "Acumulado" (cross-period). |

### Single-Period Summary Tab

- Period selector (dropdown of consorcio periods).
- Card: `total_income`, `total_output`, `net_flow` — all formatted ARS.
- Net flow highlighted: green if positive, red if negative.

### Cross-Period Summary Tab

- Opening balance, total income, total output, net flow, closing balance.
- Cascade display: opening → + income → - output → closing.
- Multiple periods in view.

### Sub-routing

No sidebar sub-items. Sidebar shows only "Ingresos/Egresos". Summary is a
tab within the list page, not a separate route.

---

## 3. User Flows

### 3.1 Entry — Create INCOME

1. ADMIN navigates to `/incomes-outputs`, clicks "Registrar Entrada".
2. Modal: direction set to INCOME.
3. Sub_type dropdown: "Alquiler", "Servicio", "Seguro".
4. ADMIN selects "Alquiler" (INCOME_RENT) → `invoice_id` field appears.
5. ADMIN optionally selects an invoice to link.
6. ADMIN fills amount, date (date picker), description.
7. Submit → `POST /incomes-outputs`.
8. On 201: modal closes, list refreshes.

### 3.2 Entry — Create OUTPUT

1. Same modal, direction set to OUTPUT.
2. Sub_type dropdown: "Salario (temp)", "Inversión (temp)", "Legal (temp)".
3. `invoice_id` field hidden (no invoice linking for outputs).
4. Migration tag: each OUTPUT sub-type shows a badge in the list.
5. Submit → `POST /incomes-outputs`.

### 3.3 Entry — List with Filters

1. `GET /incomes-outputs` with optional filters.
2. Direction filter tabs: TODOS | INGRESOS | EGRESOS.
3. Date range picker: from → to.
4. Table: date, description, sub_type badge, direction badge (green INCOME /
   red OUTPUT), amount (formatted ARS), status, actions.
5. Tombstoned entries greyed out with strikethrough.
6. Empty state: _"No hay entradas registradas."_ with CTA.

### 3.4 Entry — Detail & Version History

1. Click row → `/incomes-outputs/:id`.
2. `GET /incomes-outputs/{id}` fetches detail.
3. Detail card: direction badge, sub_type, amount, date, period_code,
   description, invoice link (if INCOME_RENT), migration tag (if OUTPUT_TEMP),
   hash (truncated + copy), status.
4. "Historial" tab: version table — version number, timestamp, hash, tombstone
   flag. Current version highlighted.
5. "Editar" section: inline form pre-filled. Submit → `PUT /incomes-outputs/{id}`.
   Creates new version.
6. "Cancelar" button → DEC-002 confirmation → DEC-001 optimistic.

### 3.5 Entry — Cancel

1. ADMIN clicks "Cancelar" on an ACTIVE entry.
2. DEC-002: Confirmation dialog: _"¿Cancelar esta entrada? Quedará marcada como anulada. (Opcional) Motivo:"_
3. On confirm → `PUT /incomes-outputs/{id}/cancel`.
4. DEC-001: Optimistic update → status changes to CANCELLED, tombstone: true.
5. Cancel button hidden.
6. On failure: rollback + toast.

### 3.6 Single-Period Summary

1. ADMIN navigates to `/incomes-outputs`, clicks "Resumen" tab, "Por Período" sub-tab.
2. Selects period from dropdown.
3. `GET /incomes-outputs/summary/{period_code}` fetches data.
4. Card shows: Ingresos ($), Egresos ($), Resultado neto ($) — green/red.

### 3.7 Cross-Period Summary

1. "Acumulado" sub-tab.
2. `GET /incomes-outputs/summary` fetches all periods.
3. Cascade display: Saldo inicial → + Ingresos → - Egresos → = Saldo final.
4. Table or card view showing per-period breakdown.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **EntryList** | Table | none | `loading` — skeleton. `ready` — rows with badges. `empty` — CTA. `error` — retry. |
| **DirectionFilter** | Tab bar | `onChange` | TODOS / INGRESOS / EGRESOS tabs. Active tab highlighted. |
| **DateRangeFilter** | Date pickers | `from`, `to`, `onChange` | `idle`. `filtered` — active range shown. |
| **EntryCreateModal** | Modal + Form | `onSuccess` | `idle` — form. `submitting`. `error`. Direction toggle. Sub_type conditional logic. |
| **EntryDetail** | Display | `entryId` | `loading`. `ready` — detail + tabs. `error` — not found. |
| **VersionHistory** | Table | `versions` | `loading`. `ready` — version rows. Single version — no history message. |
| **EntryUpdateForm** | Form | `entry`, `onSuccess` | Pre-filled. `submitting`. `error`. |
| **CancelButton** | Action | `entryStatus` | ACTIVE → visible. CANCELLED → hidden. `optimistic` (DEC-001). `confirming` (DEC-002). |
| **DirectionBadge** | Badge | `direction` | Green for INCOME. Red for OUTPUT. |
| **SubTypeSelector** | Dropdown | `direction` | Options change based on direction. INCOME_RENT triggers invoice_id visibility. |
| **SinglePeriodSummary** | Card | `period_code` | `loading`. `ready` — income/output/net. `error`. Net positive/negative coloring. |
| **CrossPeriodSummary** | Cascade + Table | none | `loading`. `ready` — cascade view. `empty` — "Sin datos acumulados." |

---

## 5. State Management

### TanStack Query Keys

| Query | Key | Endpoint |
|---|---|---|
| Entry list | `["incomes-outputs", { direction, from_date, to_date }]` | `GET /incomes-outputs` |
| Entry detail | `["incomes-outputs", id]` | `GET /incomes-outputs/{id}` |
| Single-period summary | `["incomes-outputs", "summary", period_code]` | `GET /incomes-outputs/summary/{period_code}` |
| Cross-period summary | `["incomes-outputs", "summary", "all"]` | `GET /incomes-outputs/summary` |

### Mutations

| Mutation | Key | Endpoint | DEC-001 | DEC-002 |
|---|---|---|---|---|
| `useCreateEntry` | `entries.create` | `POST /incomes-outputs` | No | No |
| `useUpdateEntry` | `entries.update` | `PUT /incomes-outputs/{id}` | No | No |
| `useCancelEntry` | `entries.cancel` | `PUT /incomes-outputs/{id}/cancel` | Yes | Yes |

### Sub-Type Conditional Logic

```typescript
const direction = watch("direction");
const subType = watch("sub_type");

const availableSubTypes = direction === "INCOME"
  ? ["INCOME_RENT", "INCOME_SERVICE", "INCOME_INSURANCE"]
  : ["OUTPUT_SALARY_TEMP", "OUTPUT_INVESTMENT_TEMP", "OUTPUT_LEGAL_TEMP"];

const showInvoiceField = subType === "INCOME_RENT";
const showMigrationTag = subType?.endsWith("_TEMP");
```

### Migration Tag Display

OUTPUT entries with `_TEMP` sub-types display a yellow badge:
_"Migración pendiente"_ with tooltip: _"Este tipo de egreso será migrado a
su módulo dedicado en una fase futura del sistema."_

### Display Formatting

All `Money` objects formatted via `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`.
Net flow colored: positive → text-green-600, negative → text-red-600.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Date outside period range | Zod validation / Backend 422 | Inline error: _"La fecha debe estar dentro del período {start} – {end}."_ | EntryCreateModal |
| Period is ARCHIVED | Backend 422 | Toast: _"No se pueden crear entradas en un período archivado."_ | EntryCreateModal |
| Entry not found | 404 | _"Entrada no encontrada."_ with back link | EntryDetail |
| Update fails (version conflict) | 422 from PUT | Toast: _"No se pudo actualizar. Intente nuevamente."_ | EntryUpdateForm |
| Cancel fails (DEC-001 rollback) | Network/422 | Status rolls back to ACTIVE. Toast: _"No se pudo cancelar la entrada."_ | CancelButton |
| Cannot cancel already cancelled | 422 | Toast: _"La entrada ya está cancelada."_ | CancelButton |
| Invoice not found (linking) | 404 from invoice lookup | Inline error: _"Factura no encontrada."_ | EntryCreateModal |
| Empty entry list | No entries for filters | _"No hay entradas registradas."_ with CTA | EntryList |

---

## 7. BDD Scenario Coverage

Estimated **18 scenarios** across 3 feature files:

| # | File | Scenarios | Focus |
|---|---|---|---|
| 1 | `features/incomes-outputs/crud.feature` | 8 | Create INCOME_RENT with invoice link, create OUTPUT with migration tag, list with direction filter, date range filter, view detail with version history, update entry (new version), empty state, validation errors |
| 2 | `features/incomes-outputs/cancel.feature` | 5 | Cancel with confirmation + optimistic, rollback on failure, cancelled entries greyed out, cannot update cancelled, cannot create for archived period |
| 3 | `features/incomes-outputs/summary.feature` | 5 | Single-period summary with income/output/net, cross-period with cascade, empty period, period selector, multiple entries aggregation |

---

## 8. API Coverage Checklist

All 6 incomes-outputs endpoints (7 paths) defined in the OpenAPI spec:

- [ ] `POST /incomes-outputs` — consumed by `useCreateEntry()` in EntryCreateModal
- [ ] `GET /incomes-outputs` — consumed by `useEntries()` in EntryList
- [ ] `GET /incomes-outputs/{id}` — consumed by `useEntry()` in EntryDetail
- [ ] `PUT /incomes-outputs/{id}` — consumed by `useUpdateEntry()` in EntryUpdateForm
- [ ] `PUT /incomes-outputs/{id}/cancel` — consumed by `useCancelEntry()`. DEC-001 + DEC-002.
- [ ] `GET /incomes-outputs/summary/{period_code}` — consumed by `useSinglePeriodSummary()` in SinglePeriodSummary
- [ ] `GET /incomes-outputs/summary` — consumed by `useCrossPeriodSummary()` in CrossPeriodSummary
- [ ] All endpoints have orval-generated hooks in `src/api/generated/incomes-outputs/incomes-outputs.ts`
- [ ] All endpoints have MSW handlers in `src/mocks/handlers/incomes-outputs.ts`

### No new gaps.

---

*End of SPEC — Incomes/Outputs.*
