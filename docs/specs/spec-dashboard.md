# SPEC — Dashboard

> **Feature:** Landing page with key consorcio metrics
> **Phase:** SPEC (final feature — PLAN phase follows after HITL approval)
> **Depends on:** Auth (role guard), Layout (app shell, consorcio selector), Expenses (data), Debt (data), Payments (data), Incomes/Outputs (data)
> **Status:** Approved (2026-06-25)
> **Next:** PLAN phase (all 9 SPECs complete)

---

## 1. Feature Overview

### Purpose

Provide an at-a-glance view of key consorcio metrics: total debt, collection
rate, pending approvals, recent activity, and income/expense summary. The
dashboard is the landing page (`/`) for ADMIN users after login.

### Unique Characteristic: Read-Only, Zero Owned Endpoints

Dashboard owns **no API endpoints**. All data is aggregated client-side from
existing queries across 4 modules. This is a known limitation (backend
concerns §4) — acceptable for v0.1 with one consorcio and a manageable
number of periods. A dedicated `GET /dashboard` endpoint is recommended for
future phases.

### Metric Sources

| Metric | Source Module | Query | Client-Side Computation |
|---|---|---|---|
| Deuda total | Debt | `useLiquidaciones({ period_code })` | Sum of `current_balance.amount` for DRAFT + ISSUED liquidaciones |
| Tasa de cobranza | Debt + Payments | `useLiquidaciones()` + `usePayments()` | total_paid / (total_debt + total_paid) × 100 |
| Aprobaciones pendientes | Expenses | `useExpenses({ type: EXTRAORDINARIA, status: PENDING })` | Count of results |
| Liquidaciones activas | Debt | `useLiquidaciones({ period_code })` | Count of DRAFT + ISSUED |
| Ingresos / Egresos | Incomes/Outputs | `useSinglePeriodSummary(period_code)` | Display `total_income`, `total_output`, `net_flow` |
| Actividad reciente | Payments | `usePayments()` | Last 5 by `created_at` descending |

### Period Default

Default to the **current OPEN period** for the selected consorcio. If no
OPEN period exists, default to the most recent period. If no periods exist,
show empty state.

### After Approval

This is the final SPEC document (9 of 9). Per SPEC-CONVENTIONS §2, the next
phase is **PLAN** — task decomposition, dependency graph, and agent assignment.

---

## 2. Pages

| Page | Route | Auth | Description |
|---|---|---|---|
| `DashboardPage` | `/` | ADMIN | Landing page showing metric cards grid, period selector, and recent activity. ACCOUNTANT users redirect to `/invoices` on `/`. |

### Layout

- Metric cards: **2 rows × 3 columns grid** on desktop (≥ 768px).
- On mobile (< 768px): cards **stack vertically**, single column.
- Period selector: top-right of the dashboard area (or in header next to
  consorcio selector).
- Recent activity and income/expense cards share the third row.

### Row Layout

```
Row 1:  [ Deuda Total ]  [ Tasa de Cobranza ]  [ Pendientes de Aprobación ]
Row 2:  [ Liq. Activas ]  [ Ingresos/Egresos ]  [ Actividad Reciente         ]
```

---

## 3. User Flows

### 3.1 Dashboard Load — With Data

1. ADMIN logs in → redirected to `/`.
2. Period defaults to current OPEN period.
3. `useQueries([...])` fires all metric queries in parallel.
4. Cards show skeleton placeholders until all queries resolve.
5. Cards populate with formatted values.
6. Tasa de cobranza shows percentage with color band (green > 80%, yellow
   50-80%, red < 50%).
7. Ingresos/Egresos card shows net flow colored (green positive, red negative).

### 3.2 Period Selector Interaction

1. ADMIN selects a different period from the dropdown.
2. All metric queries refetch with the new `period_code` filter.
3. Cards show skeletons during refetch.
4. Cards update with new period's data.

### 3.3 Drill-Down from Metric Cards

1. ADMIN clicks "Deuda Total" card → navigates to `/debt` (liquidacion list).
2. ADMIN clicks "Pendientes de Aprobación" card → navigates to
   `/expenses?type=EXTRAORDINARIA&status=PENDING`.
3. ADMIN clicks "Actividad Reciente" row → navigates to `/payments/:id`.

### 3.4 Empty State

1. New consorcio with no data → all cards show contextual messages:
   - Deuda: _"Sin liquidaciones generadas."_
   - Cobranza: _"Sin datos de cobranza."_
   - Pendientes: _"Sin aprobaciones pendientes."_
   - Actividad: _"Sin actividad reciente."_
2. CTA button: _"Comenzar"_ → navigates to expense create or consorcio setup.

### 3.5 Error State

1. One or more queries fail → affected card shows error message with retry
   button: _"No se pudo cargar. Reintentar."_
2. All queries fail → full-page error: _"No se pudieron cargar los datos
   del panel. Verifique su conexión."_ with global retry.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **DashboardPage** | Page | none | `loading` — skeleton grid. `ready` — metric cards. `error` — retry. `empty` — CTA for new consorcio. |
| **MetricCard** | Card | `title`, `value`, `description?`, `onClick?`, `color?` | `loading` — skeleton. `ready` — formatted value. `error` — retry link. `empty` — contextual message. `clickable` — cursor pointer + hover effect. |
| **PeriodSelector** | Dropdown | `onChange`, `consorcioId` | `loading` — periods fetching. `ready` — list of periods. `empty` — _"Sin períodos."_ Defaults to current OPEN period. |
| **RecentActivityFeed** | List | `payments` | `loading` — skeleton rows. `ready` — last 5 payments. `empty` — _"Sin actividad reciente."_ Each row: date, unit_code, amount, medio_pago badge. |
| **IncomeExpenseCard** | Card | `summary` | `loading`. `ready` — ingresos/egresos/neto with colors. `error`. `empty` — _"Sin movimientos en este período."_ |
| **DashboardGrid** | Grid container | `children` | Grid of 2×3 cards on desktop. Single column on mobile. |

---

## 5. State Management

### TanStack Query Composition

The dashboard uses `useQueries` to fire all source queries in parallel with
a single combined loading/error state:

```typescript
const results = useQueries({
  queries: [
    {
      queryKey: ["liquidaciones", { consorcio_id, period_code }],
      queryFn: () => fetchLiquidaciones({ consorcio_id, period_code }),
    },
    {
      queryKey: ["payments", { consorcio_id, period_code }],
      queryFn: () => fetchPayments({ consorcio_id, period_code }),
    },
    {
      queryKey: ["expenses", { consorcio_id, period_code, type: "EXTRAORDINARIA", status: "PENDING" }],
      queryFn: () => fetchExpenses({ consorcio_id, period_code, type: "EXTRAORDINARIA", status: "PENDING" }),
    },
    {
      queryKey: ["incomes-outputs", "summary", period_code],
      queryFn: () => fetchSinglePeriodSummary(period_code),
    },
  ],
});
```

### Metric Derivation

```typescript
// 1. Deuda Total
const activeLiquidaciones = liquidaciones.filter(l => l.status === "DRAFT" || l.status === "ISSUED");
const totalDebt = activeLiquidaciones.reduce((s, l) => s + parseFloat(l.current_balance.amount), 0);

// 2. Tasa de Cobranza
const totalPaid = payments.filter(p => p.status === "ACTIVE").reduce((s, p) => s + parseFloat(p.amount.amount), 0);
const collectionRate = totalDebt + totalPaid > 0 ? (totalPaid / (totalDebt + totalPaid) * 100) : 0;

// 3. Aprobaciones Pendientes
const pendingCount = expenses.length;

// 4. Liquidaciones Activas
const activeCount = activeLiquidaciones.length;

// 5. Ingresos/Egresos (from summary query)
// Already computed server-side — just display

// 6. Actividad Reciente
const recentPayments = [...payments]
  .sort((a, b) => b.created_at.localeCompare(a.created_at))
  .slice(0, 5);
```

### Period Resolution

```typescript
const periods = usePeriods(consorcioId); // from consorcios query
const defaultPeriod = periods.find(p => p.status === "OPEN")
  || periods.sort((a, b) => b.start_date.localeCompare(a.start_date))[0]
  || null;
```

### Consorcio Context

`consorcio_id` is read from `ConsorcioContext` (provided by the layout).
When the consorcio selector changes, all dashboard queries refetch.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Single query fails | Network/404 on one source | Affected card shows: _"No se pudo cargar. Reintentar."_ with retry button. Other cards unaffected. | MetricCard |
| All queries fail | Network down | Full page: _"No se pudieron cargar los datos del panel. Verifique su conexión."_ with global retry. | DashboardPage |
| No consorcio selected | ConsorcioContext is null | CTA: _"Seleccione un consorcio para ver el panel."_ | DashboardPage |
| No periods exist | Periods list empty | _"Cree su primer período fiscal."_ with link to consorcio detail periods tab. | PeriodSelector |
| New consorcio (no data) | All metrics are 0 / empty | Cards show empty messages. CTA: _"Comenzar"_ → prompts user to create first expense. | DashboardPage |
| Period has no liquidaciones | Liquidacion list empty | Deuda card: _"Sin liquidaciones generadas."_ with link to `/debt`. | MetricCard |

---

## 7. BDD Scenario Coverage

Estimated **12 scenarios** — single feature file (no sub-features, read-only):

| # | Scenario | Tags |
|---|---|---|
| 1 | Dashboard loads all metric cards with data for current period | `@happy-path` |
| 2 | Deuda total muestra suma de saldos de liquidaciones activas | `@display` |
| 3 | Tasa de cobranza se muestra como porcentaje con color según rango | `@display` |
| 4 | Pendientes de aprobación muestra el conteo correcto | `@display` |
| 5 | Cambiar período actualiza todas las métricas | `@happy-path` |
| 6 | Dashboard muestra esqueletos durante la carga inicial | `@display` |
| 7 | Estado vacío cuando no hay consorcio seleccionado | `@empty-state` |
| 8 | Estado vacío para consorcio nuevo sin datos | `@empty-state` |
| 9 | Tarjeta con error muestra botón de reintentar cuando falla una consulta | `@error-state` |
| 10 | Actividad reciente muestra últimos 5 pagos en orden | `@display` |
| 11 | Tarjeta de ingresos/egresos muestra flujo neto coloreado | `@display` |
| 12 | Todas las tarjetas visibles en simultáneo en grilla | `@display` |

---

## 8. API Coverage Checklist

Dashboard owns no endpoints. Cross-feature dependency verification:

- [ ] `useLiquidaciones` — imported from `features/debt` (orval-generated hook)
- [ ] `usePayments` — imported from `features/payments`
- [ ] `useExpenses` — imported from `features/expenses`
- [ ] `useSinglePeriodSummary` — imported from `features/incomes-outputs`
- [ ] `usePeriods` — imported from `features/consorcios`
- [ ] `ConsorcioContext` — imported from layout (provides `consorcio_id`)
- [ ] No new MSW handlers needed
- [ ] No new orval generation needed

### Cross-Feature Import Compliance

All imports from sibling features go through `src/api/generated/` (orval
hooks) and `src/components/shared/` (UI primitives). Complies with ADR-002
and AP-5 prevention.

---

*End of SPEC — Dashboard.*
