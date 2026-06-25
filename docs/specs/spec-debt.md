# SPEC — Debt

> **Feature:** Liquidacion generation and Certificado de Deuda management
> **Phase:** SPEC
> **Depends on:** Auth (role guard), Layout (app shell), Consorcios (UFs, periods), Expenses (cost data)
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Generate liquidaciones de expensas for individual or all unidades funcionales
within a fiscal period, issue them (making them immutable), generate
certificados de deuda for unpaid liquidaciones, and sign them to create
executive titles (título ejecutivo) under CCC law.

### API Surface

9 endpoints (all ADMIN-only):

| Endpoint | Method | Purpose |
|---|---|---|
| `/debt/liquidaciones` | POST | Generate liquidacion for single unit |
| `/debt/liquidaciones/batch` | POST | Generate liquidaciones for all units |
| `/debt/liquidaciones` | GET | List liquidaciones (filters: consorcio, period, unit, status) |
| `/debt/liquidaciones/{id}` | GET | Get liquidacion detail with expense allocation |
| `/debt/liquidaciones/{id}/issue` | PUT | Issue liquidacion (DRAFT → ISSUED, immutable) |
| `/debt/liquidaciones/{id}/pdf` | GET | Download PDF (returns 501 — not yet implemented) |
| `/debt/certificados` | POST | Generate certificado de deuda |
| `/debt/certificados/{id}` | GET | Get certificado detail |
| `/debt/certificados/{id}/sign` | PUT | Sign certificado (makes executive title) |

### Key Design Constraint: No Domain Math on Client

All prorrateo, interest calculation, cascade, round-off, and financial
computations are performed by the CESAR backend. The frontend **only
displays** pre-computed values. This is a CFFD architectural invariant:

- `total_expenses`, `total_payments`, `punitive_interest`,
  `compensatory_interest`, `round_off`, `current_balance` are all received
  from the API as `Money` objects — never computed client-side.
- The expense allocation table (`unit_share`, `percentage`) displays
  backend-determined values.
- No frontend code performs prorrateo, interest, or balance arithmetic beyond
  formatting (cents → ARS display).

### Domain Concepts

- **Liquidacion status**: `DRAFT` (recalculable, editable) → `ISSUED`
  (immutable, legally binding). No intermediate states.
- **Issued liquidacion**: Cannot be recalculated. Conflict if batch generation
  targets a unit with an ISSUED liquidacion for the same period.
- **Expense allocation**: Each liquidacion has an `allocations` array showing
  which expenses contributed, the unit's share, and the percentage.
- **Previous balance → Current balance cascade**: The first period's
  previous_balance is 0. Subsequent periods chain: previous_balance is the
  prior period's current_balance minus payments applied.
- **Interest**: Punitive (mora) on previous_balance at configured rate.
  Compensatory per-unit config. Both server-computed.
- **Round-off**: Server-applied to configured cent limit to prevent
  cumulative errors.
- **QR code**: Displayed on liquidacion per DI-1146/24.
- **Certificado de Deuda**: Generated from an ISSUED liquidacion. Status:
  `VIGENTE` → `EJECUTADO` (signed, becomes executive title) → can expire
  after 3 business days (VENCIDO).
- **PDF download**: `GET /debt/liquidaciones/{id}/pdf` returns 501.
  Frontend shows disabled button with tooltip until CESAR implements it.

---

## 2. Pages

| Page | Route | Auth | Description |
|---|---|---|---|
| `LiquidacionListPage` | `/debt` | ADMIN | Table filtered by consorcio, period_code, UF, status (DRAFT/ISSUED). Generate buttons (single + batch). |
| `LiquidacionDetailPage` | `/debt/:id` | ADMIN | Full detail: unit, period, status badge, expense allocation table, financial summary (previous balance → expenses → payments → interest → round-off → current balance), QR code. Issue button (DRAFT only). PDF button (disabled + tooltip). |
| `CertificadoListPage` | `/debt/certificados` | ADMIN | Table filtered by unit_id. Status badges (VIGENTE/EJECUTADO/VENCIDO). Generate button. |
| `CertificadoDetailPage` | `/debt/certificados/:id` | ADMIN | Detail: linked liquidacion info, amount, period, unit, status, expires_at date, consejo_approval list, hash. Sign button (VIGENTE only). |

---

## 3. User Flows

### 3.1 Generate Liquidacion — Single Unit

1. ADMIN navigates to `/debt`.
2. Clicks "Generar Liquidación".
3. Modal: consorcio (pre-selected), period_code dropdown, UF selector (single unit).
4. Submit → `POST /debt/liquidaciones`.
5. On 201: redirect to `/debt/:id`. Status: DRAFT.
6. Detail shows expense allocation breakdown and financial summary.

### 3.2 Generate Liquidaciones — Batch

1. ADMIN clicks "Generar Todas" on the liquidacion list.
2. Confirmation dialog (DEC-002): _"¿Generar liquidaciones para todas las unidades funcionales del período 202606?"_
3. On confirm → `POST /debt/liquidaciones/batch`.
4. On 201: list refreshes showing new DRAFT liquidaciones.
5. No redirect — user stays on list to review results.

### 3.3 Liquidacion — View Detail

1. ADMIN clicks a row or navigates to `/debt/:id`.
2. `GET /debt/liquidaciones/{id}` fetches detail.
3. Header: UF code, period_code, status badge (DRAFT/ISSUED).
4. Expense allocation table: expense description, group badge, total cost,
   unit share (formatted ARS), percentage.
5. Financial summary card:
   - Saldo anterior: `previous_balance`
   - + Gastos: `total_expenses`
   - - Pagos: `total_payments`
   - + Intereses punitorios: `punitive_interest`
   - + Intereses compensatorios: `compensatory_interest`
   - + Redondeo: `round_off`
   - = Saldo actual: `current_balance` (highlighted)
6. QR code displayed.
7. Hash displayed (truncated + copy button).
8. Issue button visible if DRAFT. PDF button always visible but disabled if
   liquidacion is DRAFT or endpoint returns 501.

### 3.4 Liquidacion — Issue

1. On a DRAFT liquidacion, ADMIN clicks "Emitir".
2. DEC-002: Confirmation dialog: _"¿Emitir esta liquidación? Una vez emitida no podrá modificarse."_
3. On confirm → `PUT /debt/liquidaciones/{id}/issue`.
4. DEC-001: Optimistic update → status changes to ISSUED. Issue button hidden.
5. On success: PDF button enabled (but still 501 until backend implements it).
6. On failure: rollback.

### 3.5 Liquidacion — PDF Download (Placeholder)

1. PDF button visible on liquidacion detail.
2. If liquidacion is DRAFT: button disabled. Tooltip: _"Emita la liquidación primero."_
3. If liquidacion is ISSUED but endpoint returns 501: button disabled.
   Tooltip: _"Descarga de PDF no disponible próximamente."_
4. When CESAR implements the endpoint and returns 200: button enabled.
   Click → download binary PDF.

### 3.6 Certificado — Generate

1. ADMIN navigates to `/debt/certificados`.
2. Clicks "Generar Certificado".
3. Modal: consorcio, select an ISSUED liquidacion with outstanding balance.
4. `POST /debt/certificados`.
5. On 201: redirect to `/debt/certificados/:id`. Status: VIGENTE.
6. Detail shows: linked liquidacion, amount, period_code, unit, consejo_approval (empty until signed), expires_at (3 business days from creation), hash.

### 3.7 Certificado — Sign

1. On a VIGENTE certificado, ADMIN clicks "Firmar".
2. DEC-002: Confirmation dialog: _"¿Firmar este certificado? Se convertirá en título ejecutivo y no podrá revertirse."_
3. On confirm → `PUT /debt/certificados/{id}/sign`.
4. DEC-001: Optimistic update → is_executive_title: true, status: EJECUTADO.
   Sign button hidden.
5. On failure: rollback.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **LiquidacionList** | Table | none | `loading` — skeleton. `ready` — rows with status badges. `empty` — _"No hay liquidaciones. Genere la primera."_ `error` — retry. |
| **GenerateModal** | Modal | `onGenerate`, `type` (single/batch) | `idle` — form visible. `submitting`. `error`. Single: UF selector. Batch: confirmation message. |
| **LiquidacionDetail** | Display | `liquidacionId` | `loading` — skeleton. `ready` — full detail. `error` — not found. |
| **ExpenseAllocationTable** | Table | `allocations` | `ready` — rows with costs and shares. Empty — _"Sin asignaciones"_ (unusual, data issue). |
| **FinancialSummary** | Card | `previous_balance`, `total_expenses`, `total_payments`, `punitive_interest`, `compensatory_interest`, `round_off`, `current_balance` | `ready` — formatted amounts with +/- signs. Current balance highlighted. |
| **IssueButton** | Action | `liquidacionStatus` | DRAFT → visible. ISSUED → hidden. `optimistic` — spinner (DEC-001). `confirming` — dialog open (DEC-002). |
| **PdfButton** | Action | `liquidacionStatus`, `pdfAvailable?` | DRAFT → disabled + tooltip "Emita primero". ISSUED + 501 → disabled + tooltip "No disponible". ISSUED + 200 → enabled. Download initiates. |
| **CertificadoList** | Table | none | `loading`, `ready` with status badges, `empty`, `error`. |
| **CertificadoDetail** | Display | `certificadoId` | `loading`, `ready`, `error`. Sign button (VIGENTE only). Expiry date with countdown visual. |
| **SignButton** | Action | `certificadoStatus` | VIGENTE → visible. EJECUTADO → hidden. VENCIDO → hidden. `optimistic` + `confirming` (DEC-001 + DEC-002). |

---

## 5. State Management

### TanStack Query Keys

| Query | Key | Endpoint |
|---|---|---|
| Liquidacion list | `["liquidaciones", { consorcio_id, period_code, unit_id, status }]` | `GET /debt/liquidaciones` |
| Liquidacion detail | `["liquidaciones", id]` | `GET /debt/liquidaciones/{id}` |
| Certificado list | `["certificados", { unit_id }]` | `GET /debt/certificados` |
| Certificado detail | `["certificados", id]` | `GET /debt/certificados/{id}` |

### Mutations

| Mutation | Key | Endpoint | DEC-001 | DEC-002 |
|---|---|---|---|---|
| `useGenerateLiquidacion` | `liquidaciones.generate` | `POST /debt/liquidaciones` | No | No (single) |
| `useBatchGenerateLiquidaciones` | `liquidaciones.batchGenerate` | `POST /debt/liquidaciones/batch` | No | Yes |
| `useIssueLiquidacion` | `liquidaciones.issue` | `PUT /debt/liquidaciones/{id}/issue` | Yes | Yes |
| `useGenerateCertificado` | `certificados.generate` | `POST /debt/certificados` | No | No |
| `useSignCertificado` | `certificados.sign` | `PUT /debt/certificados/{id}/sign` | Yes | Yes |

### Display Formatting

All `Money` objects are received as `{ amount: string, currency: "ARS" }`. The
frontend formats them:
- Parse `amount` to float
- Divide by 100? No — the spec uses decimal strings (not cents). Example:
  `"45000.00"` → `$ 45.000,00`.
- Use `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`.

### PDF Not Yet Implemented

No TanStack Query hook for the PDF endpoint. When CESAR implements it, a
`useLiquidacionPdf(id)` hook will fetch the binary and trigger download.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Liquidacion not found | 404 | _"Liquidación no encontrada."_ with back link | LiquidacionDetail |
| Certificado not found | 404 | _"Certificado no encontrado."_ with back link | CertificadoDetail |
| Cannot issue (wrong state) | 422 from issue | Toast: _"La liquidación no está en estado DRAFT."_ | IssueButton |
| Issue fails (DEC-001 rollback) | Network/422 | Status rolls back to DRAFT. Toast: _"No se pudo emitir la liquidación."_ | IssueButton |
| Sign fails (DEC-001 rollback) | Network/422 | Status rolls back to VIGENTE. Toast: _"No se pudo firmar el certificado."_ | SignButton |
| PDF not available | 501 from endpoint | Disabled button. Tooltip per state. | PdfButton |
| Empty liquidacion list | No liquidaciones for period | _"No hay liquidaciones. Genere la primera."_ with CTA | LiquidacionList |
| Empty certificado list | No certificados for unit | _"No hay certificados de deuda."_ with CTA | CertificadoList |

---

## 7. BDD Scenario Coverage

Estimated **22 scenarios** across 3 feature files:

| # | File | Scenarios | Focus |
|---|---|---|---|
| 1 | `features/debt/liquidacion.feature` | 10 | Generate single, generate batch with confirmation, list with filters, view detail with allocation table and financial summary, QR display, hash display, empty state, DRAFT shows issue button, ISSUED hides issue button, PDF button states |
| 2 | `features/debt/certificado.feature` | 7 | Generate certificado, view detail with expiry, sign with confirmation (DEC-002), sign optimistic (DEC-001), EJECUTADO hides sign button, empty state, certificado not found |
| 3 | `features/debt/liquidacion-states.feature` | 5 | Issue with confirmation and optimistic update, issue rollback on error, DRAFT liquidacion shows recalculable notice, ISSUED liquidacion shows immutable badge, batch generation skip for already-issued units |

---

## 8. API Coverage Checklist

All 9 debt endpoints defined in the OpenAPI spec:

- [ ] `POST /debt/liquidaciones` — consumed by `useGenerateLiquidacion()` in GenerateModal
- [ ] `POST /debt/liquidaciones/batch` — consumed by `useBatchGenerateLiquidaciones()`. DEC-002.
- [ ] `GET /debt/liquidaciones` — consumed by `useLiquidaciones()` in LiquidacionList
- [ ] `GET /debt/liquidaciones/{id}` — consumed by `useLiquidacion()` in LiquidacionDetail
- [ ] `PUT /debt/liquidaciones/{id}/issue` — consumed by `useIssueLiquidacion()`. DEC-001 + DEC-002.
- [ ] `GET /debt/liquidaciones/{id}/pdf` — not consumed (501 placeholder). Tooltip states documented.
- [ ] `POST /debt/certificados` — consumed by `useGenerateCertificado()` in CertificadoList modal
- [ ] `GET /debt/certificados/{id}` — consumed by `useCertificado()` in CertificadoDetail
- [ ] `PUT /debt/certificados/{id}/sign` — consumed by `useSignCertificado()`. DEC-001 + DEC-002.
- [ ] All endpoints have orval-generated hooks in `src/api/generated/debt/debt.ts` (verified during contract setup)
- [ ] All endpoints have MSW handlers in `src/mocks/handlers/debt.ts` (verified during contract setup)
- [ ] PDF endpoint returns 501 in MSW handler (matching backend behavior)

### No new gaps.

---

*End of SPEC — Debt.*
