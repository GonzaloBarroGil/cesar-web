# SPEC — Payments

> **Feature:** Payment registration, reversal, unit balance, and payment history
> **Phase:** SPEC
> **Depends on:** Auth (role guard), Layout (app shell), Consorcios (UFs, periods), Debt (liquidaciones)
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Register payments from propietarios, track balances per unidad funcional,
reverse payments when necessary, and maintain a full payment history.
Payments are append-only: reversals create new REVERSED entries rather than
deleting the original.

### API Surface

6 endpoints (all ADMIN-only):

| Endpoint | Method | Purpose |
|---|---|---|
| `/payments` | POST | Register payment (auto-generates Recibo B/C) |
| `/payments` | GET | List payments (filters: consorcio, period, unit, pagination) |
| `/payments/{id}` | GET | Get payment detail with linked recibo |
| `/payments/{id}/reverse` | POST | Reverse payment (creates compensating REVERSED entry) |
| `/payments/unit/{unit_id}/balance` | GET | Balance summary: total_paid, payment_count per unit |
| `/payments/unit/{unit_id}/history` | GET | Payment history per unit, descending by date |

### Domain Concepts

- **Payment method (medio_pago)**: CASH, TRANSFER, DEPOSIT, MERCADOPAGO, OTHER.
  All treated equally as dropdown options at this stage.
- **NO_VOUCHER warning**: When medio_pago is CASH and no `voucher_number`
  provided, the payment receives a warning badge. Not a blocker — just
  informational.
- **Auto Recibo**: `POST /payments` auto-generates a Recibo B (RI consorcio)
  or Recibo C (EXENTO/CF consorcio). The linked recibo is displayed in the
  payment detail.
- **Append-only reversals**: `POST /payments/{id}/reverse` creates a new
  REVERSED entry — a compensating record. The original payment remains in
  history with updated status.
- **Reversal is irreversible**: No undo for a reversal — confirmed via
  DEC-002 dialog with reason field.
- **Voucher conditional**: The `voucher_number` field is only displayed and
  required when medio_pago is CASH. Hidden for other methods.

---

## 2. Pages

| Page/View | Location | Auth | Description |
|---|---|---|---|
| `PaymentListPage` | `/payments` | ADMIN | Table with filters and pagination. Two tabs: "Pagos" (list) and "Balances" (unit balances). |
| **Payments tab** | Tab 1 | — | Table: unit, period, amount, method, status, date. Create payment button. Reverse action per row. |
| **Balances tab** | Tab 2 | — | Per-unit balance summary. Select UF → balance card + payment history table. |
| `PaymentDetailPage` | `/payments/:id` | ADMIN | Detail: amount, method, period, unit, voucher, status, linked recibo. Reverse button (if ACTIVE). |

### Tab Design Rationale

`UnitBalancePage` is embedded as a tab within the payments list rather than a
standalone page. The balance and history endpoints are queried per selected UF.
This avoids route fragmentation and keeps all payment-related views in one
navigation entry. No coupling issues: the balance tab queries different
endpoints from the list tab.

### Sub-routing

- Payments have no sidebar sub-items. The sidebar shows only "Pagos".
- Payment detail is reached by clicking a row in the payments tab.
- Payment creation is a modal from the list page, not a separate route.

---

## 3. User Flows

### 3.1 Payment — Register

1. ADMIN navigates to `/payments`, Payments tab.
2. Clicks "Registrar Pago".
3. Modal form: UF selector, period_code dropdown, amount (positive, ARS),
   medio_pago dropdown (CASH / TRANSFER / DEPOSIT / MERCADOPAGO / OTHER).
4. If medio_pago is CASH: `voucher_number` field appears (optional but
   recommended). If any other method: field hidden.
5. ADMIN submits → `POST /payments`.
6. On 201: modal closes, list refreshes. New payment row with linked recibo.
7. If medio_pago is CASH and no voucher_number: warning badge displayed.
8. On validation error: field-level errors in modal.

### 3.2 Payment — List

1. `GET /payments` with filters: consorcio_id, period_code, unit_id.
2. Table: date, unit_code, amount (formatted ARS), medio_pago badge,
   voucher_number (if CASH), NO_VOUCHER warning badge, status badge (ACTIVE/REVERSED),
   linked recibo number.
3. Pagination: limit/offset at bottom.
4. Click row → navigate to `/payments/:id`.
5. Actions column: "Revertir" button for ACTIVE payments.
6. Empty state: _"No hay pagos registrados."_ with CTA.

### 3.3 Payment — Detail

1. `GET /payments/{id}` fetches detail.
2. Display: amount, medio_pago, period_code, unit_code, voucher_number
   (or "Sin comprobante" warning if CASH without voucher), status, created_at,
   hash.
3. Linked recibo section: recibo number, type (B/C), amount, status.
   Link to open recibo detail in invoices module.
4. Reverse button visible if ACTIVE. Hidden if REVERSED.

### 3.4 Payment — Reverse

1. ADMIN clicks "Revertir" on an ACTIVE payment.
2. DEC-002: Confirmation dialog: _"¿Revertir este pago? Se creará un registro compensatorio y el pago original quedará marcado como REVERSED. (Opcional) Motivo:"_
3. On confirm → `POST /payments/{id}/reverse`.
4. DEC-001: Optimistic update → original payment status changes to REVERSED
   immediately. Reverse button hidden.
5. On success: list refreshes showing the new compensating REVERSED entry.
6. On failure: rollback + toast: _"No se pudo revertir el pago."_

### 3.5 Unit Balance — View

1. ADMIN switches to "Balances" tab on `/payments`.
2. Selects a UF from dropdown.
3. `GET /payments/unit/{unit_id}/balance` → displays balance card:
   - Total pagado: `total_paid` (formatted ARS)
   - Cantidad de pagos: `payment_count`
4. `GET /payments/unit/{unit_id}/history` → table below:
   - Date descending, amount, method, status, period_code.
5. Empty state if no payments: _"Sin historial de pagos para esta unidad."_
6. Filter by period_code on history.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **PaymentList** | Table | none | `loading` — skeleton. `ready` — rows with badges. `empty` — CTA. `error` — retry. Pagination at bottom. |
| **PaymentFilters** | Filter bar | `onFilterChange` | Consorcio, period_code, UF dropdowns. |
| **PaymentCreateModal** | Modal + Form | `onSuccess` | `idle` — form. `submitting`. `error`. Medio_pago selector toggles voucher_number visibility. |
| **PaymentDetail** | Display | `paymentId` | `loading`. `ready` — detail + linked recibo. `error` — not found. Reverse button (ACTIVE only). |
| **ReverseButton** | Action | `paymentStatus` | ACTIVE → visible. REVERSED → hidden. `optimistic` (DEC-001). `confirming` (DEC-002). |
| **UnitBalanceCard** | Card | `unitId` | `loading`. `ready` — total_paid + payment_count. `error` — retry. |
| **UnitHistoryTable** | Table | `unitId`, `period_code?` | `loading`. `ready` — rows descending. `empty` — _"Sin historial."_ |
| **PaymentMethodBadge** | Badge | `medio_pago` | Colored badge per method: green for TRANSFER, blue for DEPOSIT, grey for CASH, orange for MERCADOPAGO, default for OTHER. |
| **NoVoucherWarning** | Badge | `visible: boolean` | Yellow warning badge: _"Sin comprobante"_. Only on CASH payments without voucher. |

---

## 5. State Management

### TanStack Query Keys

| Query | Key | Endpoint |
|---|---|---|
| Payment list | `["payments", { consorcio_id, period_code, unit_id, page }]` | `GET /payments` |
| Payment detail | `["payments", id]` | `GET /payments/{id}` |
| Unit balance | `["payments", "unit", unitId, "balance"]` | `GET /payments/unit/{unit_id}/balance` |
| Unit history | `["payments", "unit", unitId, "history", { period_code }]` | `GET /payments/unit/{unit_id}/history` |

### Mutations

| Mutation | Key | Endpoint | DEC-001 | DEC-002 |
|---|---|---|---|---|
| `useCreatePayment` | `payments.create` | `POST /payments` | No | No |
| `useReversePayment` | `payments.reverse` | `POST /payments/{id}/reverse` | Yes | Yes |

### Voucher Conditional Logic

```typescript
const medioPago = watch("medio_pago");
const showVoucherField = medioPago === "CASH";
```

- When `showVoucherField` is true: `voucher_number` input rendered.
- When false: field hidden, value cleared.

### Linked Recibo Display

After `useCreatePayment` succeeds, the response includes `recibo_id`. The
payment detail page can link to `/invoices/recibos/:reciboId` using
React Router's `<Link>`.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Amount must be positive | Zod validation | Inline error: _"El monto debe ser mayor a 0."_ | PaymentCreateModal |
| Payment not found | 404 from GET /payments/{id} | _"Pago no encontrado."_ with back link | PaymentDetail |
| Cannot reverse (already reversed) | 422 from reverse | Toast: _"El pago ya fue revertido."_ | ReverseButton |
| Reverse fails (DEC-001 rollback) | Network/422 | Original status restored. Toast: _"No se pudo revertir el pago."_ | ReverseButton |
| Unit not found (balance) | 404 from balance endpoint | _"Unidad no encontrada."_ | UnitBalanceCard |
| Empty payment list | No payments for filters | _"No hay pagos registrados."_ with CTA | PaymentList |
| Empty unit history | No payments for selected UF | _"Sin historial de pagos para esta unidad."_ | UnitHistoryTable |
| Network error on create | Fetch failure | Toast with retry. Modal stays open. | PaymentCreateModal |

---

## 7. BDD Scenario Coverage

Estimated **18 scenarios** across 3 feature files:

| # | File | Scenarios | Focus |
|---|---|---|---|
| 1 | `features/payments/creation.feature` | 8 | Create with TRANSFER, CASH with voucher, CASH without voucher (NO_VOUCHER warning), amount > 0 validation, CASH shows voucher field, non-CASH hides voucher field, empty list, list with filters |
| 2 | `features/payments/reversal.feature` | 5 | Reverse with confirmation and optimistic update, reverse rollback on error, REVERSED payment hides reverse button, compensating entry appears in list, cannot reverse already-reversed |
| 3 | `features/payments/balance.feature` | 5 | Unit balance display, payment history descending, empty balance for unit with no payments, balance with multiple payments, period filter on history |

---

## 8. API Coverage Checklist

All 6 payments endpoints defined in the OpenAPI spec:

- [ ] `POST /payments` — consumed by `useCreatePayment()` in PaymentCreateModal
- [ ] `GET /payments` — consumed by `usePayments()` in PaymentList
- [ ] `GET /payments/{id}` — consumed by `usePayment()` in PaymentDetail
- [ ] `POST /payments/{id}/reverse` — consumed by `useReversePayment()`. DEC-001 + DEC-002.
- [ ] `GET /payments/unit/{unit_id}/balance` — consumed by `useUnitBalance()` in UnitBalanceCard
- [ ] `GET /payments/unit/{unit_id}/history` — consumed by `useUnitHistory()` in UnitHistoryTable
- [ ] All endpoints have orval-generated hooks in `src/api/generated/payments/payments.ts`
- [ ] All endpoints have MSW handlers in `src/mocks/handlers/payments.ts`

### No new gaps.

---

*End of SPEC — Payments.*
