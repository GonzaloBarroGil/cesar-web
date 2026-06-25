# SPEC — Expenses

> **Feature:** Expense CRUD, approval workflow, providers, concepts, and categories
> **Phase:** SPEC
> **Depends on:** Auth (role guard), Layout (app shell), Consorcios (periods, providers data)
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Manage the expense lifecycle: record ordinary and extraordinary expenses, track
approval workflow, manage supporting catalogs (providers, concepts, categories),
and enforce the append-only audit model (hash chain, version history, soft-delete).

### API Surface

15 endpoints (all ADMIN-only):

| Endpoint | Method | Purpose |
|---|---|---|
| `/expenses` | POST | Create expense |
| `/expenses` | GET | List expenses (filters: consorcio, period, type, status) |
| `/expenses/{id}/versions` | GET | Version history (hash chain audit) |
| `/expenses/{id}/tombstone` | PUT | Soft-delete expense |
| `/expenses/{id}/approve` | PUT | Approve extraordinary expense |
| `/expenses/{id}/reject` | PUT | Reject extraordinary expense |
| `/expenses/concepts` | POST | Create concept |
| `/expenses/concepts` | GET | List concepts |
| `/expenses/concepts/{group}` | GET | List concepts by group (A/B/C) |
| `/expenses/categories` | POST | Create category |
| `/expenses/categories` | GET | List categories |
| `/expenses/providers` | POST | Register provider |
| `/expenses/providers` | GET | List providers |
| `/expenses/providers/{id}` | PUT | Update provider |
| `/expenses/providers/{id}/tombstone` | PUT | Soft-delete provider |

### Domain Concepts

- **Expense type**: `ORDINARIA` (auto-approved) vs `EXTRAORDINARIA` (requires approval).
- **Approval status**: `PENDING` → `APPROVED` or `REJECTED`. ORDINARIA is `APPROVED` on creation.
- **Expense groups**: A (common areas), B (shared services), C (reserve fund).
- **Multi-term**: An expense can span multiple periods (terms_total, term_current).
- **Soft-delete**: Tombstone flag — no hard DELETE. Version history preserved.
- **Hash chain**: Each expense version has a SHA-256 hash chained to the previous version.
- **Provider**: Supplier with CUIT, iva_condition, contact info. Can be soft-deleted (tombstone).
- **Concept**: Named expense concept within a group (A/B/C). Used in prorrateo.
- **Category**: Named category within a group. Organizational label.

---

## 2. Pages

| Page | Route | Auth | Description |
|---|---|---|---|
| `ExpenseListPage` | `/expenses` | ADMIN | Table with filters (consorcio, period_code, type, status). Pagination (limit/offset). |
| `ExpenseCreatePage` | `/expenses/new` | ADMIN | Form: type toggle (ORDINARIA/EXTRAORDINARIA), concept selector, category selector, provider selector, group, description, total cost, multi-term config. |
| `ExpenseDetailPage` | `/expenses/:id` | ADMIN | Detail view: cost, group, type badge, status badge, provider info, concept, category, dates. Approval buttons (approve/reject) for PENDING EXTRAORDINARIA. Version history tab (append-only audit log). |
| `ConceptListPage` | `/expenses/concepts` | ADMIN | Table grouped by group (A/B/C). Create modal. |
| `CategoryListPage` | `/expenses/categories` | ADMIN | Table grouped by group. Create modal. |
| `ProviderListPage` | `/expenses/providers` | ADMIN | Table: CUIT, name, IVA condition, contact, active/tombstoned toggle. Edit button. |
| `ProviderCreatePage` | `/expenses/providers/new` | ADMIN | Form: CUIT, name, IVA condition, email, phone. |
| `ProviderEditPage` | `/expenses/providers/:id/edit` | ADMIN | Pre-filled form from provider detail. |

### Sub-routing

Concepts and categories are reachable from the expenses section header (tabs or
a manage nav), not from the main sidebar. The sidebar shows only "Expensas".
Providers have their own list page reachable from a "Proveedores" tab or
sub-navigation within expenses.

---

## 3. User Flows

### 3.1 Expense — Create ORDINARIA

1. ADMIN navigates to `/expenses/new`.
2. Form: type toggle set to ORDINARIA (default).
3. ADMIN selects consorcio, period_code, group (A/B/C), concept, category.
4. ADMIN optionally selects provider (if linked to a supplier).
5. ADMIN enters description and total cost (ARS).
6. If multi-term (> 1): number of terms selector appears. Current term auto-set to 1.
7. ADMIN submits → `POST /expenses`.
8. On 201: redirected to `/expenses/:id`. Status shows `APPROVED` (auto for ORDINARIA).
9. No approval buttons visible (ORDINARIA doesn't need approval).

### 3.2 Expense — Create EXTRAORDINARIA

1. Same form, type toggle set to EXTRAORDINARIA.
2. On submit → `POST /expenses`.
3. On 201: redirected to `/expenses/:id`. Status shows `PENDING`.
4. Approval buttons visible: "Aprobar" (green) and "Rechazar" (red).

### 3.3 Expense — Approve EXTRAORDINARIA

1. ADMIN views EXTRAORDINARIA expense in PENDING status.
2. Clicks "Aprobar".
3. **Optimistic update**: Status changes to `APPROVED` immediately. Buttons hidden.
4. `PUT /expenses/{id}/approve` fires in background.
5. On success: no action (already displayed).
6. On failure (422 from backend): status rolls back to `PENDING`, buttons reappear. Toast: _"No se pudo aprobar el gasto."_

### 3.4 Expense — Reject EXTRAORDINARIA

1. ADMIN clicks "Rechazar".
2. Confirmation dialog: _"¿Rechazar este gasto extraordinario?"_.
3. On confirm: optimistic update → status `REJECTED`. Buttons hidden.
4. `PUT /expenses/{id}/reject` fires.
5. On failure: rollback as with approve.

### 3.5 Expense — List with Filters

1. ADMIN navigates to `/expenses`.
2. `GET /expenses` with default filters (current consorcio, current period).
3. Table: description, group badge, type badge, status badge, total cost (formatted ARS), provider name, date.
4. Filters bar: consorcio dropdown, period_code dropdown, type (TODOS/ORDINARIA/EXTRAORDINARIA), status (TODOS/PENDING/APPROVED/REJECTED).
5. Pagination: limit/offset controls at bottom.
6. Click row → navigate to `/expenses/:id`.
7. Empty state: _"No hay gastos registrados para este período."_ with CTA to create.

### 3.6 Expense — Version History

1. On ExpenseDetailPage, click "Historial" tab.
2. `GET /expenses/{id}/versions` fetches version list.
3. Table: version number, timestamp, author UUID, hash (truncated with copy button), tombstone flag.
4. Current version highlighted.
5. Hash chain visualization: each hash references previous (visual chain or tooltip).
6. Tombstoned versions marked with strikethrough.

### 3.7 Expense — Soft Delete (Tombstone)

1. On ExpenseDetailPage, click "Eliminar" (delete icon).
2. Confirmation dialog: _"¿Eliminar este gasto? No se borrará permanentemente — quedará marcado como anulado. (Opcional) Motivo:"_
3. Optional reason text area.
4. On confirm → `PUT /expenses/{id}/tombstone`.
5. On success: status changes to tombstoned. Expense remains visible but greyed out in lists.
6. On failure: toast with error.

### 3.8 Providers — CRUD

1. Register: `/expenses/providers/new` → Form (CUIT, name, IVA condition, email, phone) → `POST /expenses/providers`.
2. List: `/expenses/providers` → `GET /expenses/providers` → Table with active non-tombstoned providers.
3. Edit: click row → `/expenses/providers/:id/edit` → pre-filled form → `PUT /expenses/providers/{id}`.
4. Soft-delete: delete action on provider → confirmation dialog → `PUT /expenses/providers/{id}/tombstone`.
5. Toggle: show/hide tombstoned providers in list.

### 3.9 Concepts & Categories

1. **Concepts**: `/expenses/concepts` → list grouped by A/B/C. Create via modal: name, description, group selector → `POST /expenses/concepts`. Group filter tabs: A | B | C → `GET /expenses/concepts/{group}`.
2. **Categories**: `/expenses/categories` → same pattern as concepts. Create via modal: name, group selector → `POST /expenses/categories`. Group filter tabs.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **ExpenseList** | Table | none | `loading` — skeleton rows. `ready` — rows with badges. `empty` — CTA. `error` — retry. |
| **ExpenseFilters** | Filter bar | `onFilterChange` | `idle` — default filters. `filtered` — active filters with count badge. |
| **ExpenseForm** | Form | `initialData?` | `idle` — empty/pre-filled. `submitting` — button disabled. `error` — field/form errors. Type toggle: ORDINARIA → hide approval info; EXTRAORDINARIA → show approval notice. Multi-term: fields >= 2 → show terms_total/term_current inputs. |
| **ExpenseDetail** | Display | `expenseId` | `loading` — skeleton. `ready` — detail + tabs. `error` — not found. |
| **ExpenseActions** | Action group | `expense` | `approved` — no action buttons. `pending` — Aprobar/Rechazar buttons. `rejected` — no action buttons. `tombstoned` — greyed out, no actions. `optimistic-loading` — button shows spinner during API call. |
| **VersionHistory** | Table | `expenseId` | `loading` — skeleton. `ready` — version rows. `empty` — single version (no history). |
| **ProviderList** | Table | none | `loading`, `ready`, `empty`, `error`. Toggle: show/hide tombstoned. |
| **ProviderForm** | Form | `initialData?` | Standard form states. CUIT validation. |
| **ConceptList** | List | none | `loading`, `ready` (grouped), `empty`. Group filter tabs. |
| **CategoryList** | List | none | Same as ConceptList. |

---

## 5. State Management

### TanStack Query Keys

| Query | Key | Endpoint |
|---|---|---|
| Expense list | `["expenses", { consorcio_id, period_code, type, status }]` | `GET /expenses` |
| Expense detail | `["expenses", id]` | (no direct GET single endpoint? detail derived from list item or versions) |
| Expense versions | `["expenses", id, "versions"]` | `GET /expenses/{id}/versions` |
| Concepts | `["concepts"]` | `GET /expenses/concepts` |
| Concepts by group | `["concepts", group]` | `GET /expenses/concepts/{group}` |
| Categories | `["categories"]` | `GET /expenses/categories` |
| Providers | `["providers"]` | `GET /expenses/providers` |

### Mutations

| Mutation | Key | Endpoint | Invalidation |
|---|---|---|---|
| `useCreateExpense` | `expenses.create` | `POST /expenses` | `["expenses"]` |
| `useTombstoneExpense` | `expenses.tombstone` | `PUT /expenses/{id}/tombstone` | `["expenses", id]`, `["expenses"]` |
| `useApproveExpense` | `expenses.approve` | `PUT /expenses/{id}/approve` | `["expenses", id]`, `["expenses"]` |
| `useRejectExpense` | `expenses.reject` | `PUT /expenses/{id}/reject` | `["expenses", id]`, `["expenses"]` |
| `useCreateConcept` | `concepts.create` | `POST /expenses/concepts` | `["concepts"]`, `["concepts", group]` |
| `useCreateCategory` | `categories.create` | `POST /expenses/categories` | `["categories"]` |
| `useCreateProvider` | `providers.create` | `POST /expenses/providers` | `["providers"]` |
| `useUpdateProvider` | `providers.update` | `PUT /expenses/providers/{id}` | `["providers"]` |
| `useTombstoneProvider` | `providers.tombstone` | `PUT /expenses/providers/{id}/tombstone` | `["providers"]` |

### Optimistic Updates

`useApproveExpense` and `useRejectExpense` use TanStack Query's
`onMutate` for optimistic status change, with `onError` rolling back:

```
onMutate: → set status to APPROVED/REJECTED, cancel queries
onError: → rollback to previous status, show toast
onSettled: → invalidate ["expenses", id] and ["expenses"]
```

### Note on `GET /expenses/{id}`

The OpenAPI spec does not define a single-expense GET endpoint. Expense detail
is derived from the list query result (filtering by ID client-side) or from the
version history endpoint. The `useExpense` hook wraps `useQuery` with
`select: (data) => data.find(e => e.id === id)`.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Validation error (create) | 422 from POST /expenses | Field-level errors: cost must be positive, period_code required, concept required | ExpenseForm |
| Approval fails (optimistic rollback) | 422 from PUT /approve or /reject | Toast: _"No se pudo aprobar/rechazar el gasto."_ Status rolls back to PENDING. Buttons reappear. | ExpenseActions |
| Expense not found | ID not in list | _"Gasto no encontrado."_ with back link | ExpenseDetail |
| Provider duplicate CUIT | 409 from POST /providers | Inline error: _"El CUIT ya está registrado como proveedor."_ | ProviderForm |
| Tombstone fails | Network error on tombstone | Toast with retry. Expense remains visible. | ExpenseDetail |
| Version history empty | Expense has only 1 version | Message: _"Sin historial de versiones."_ (single version = no changes yet) | VersionHistory |
| Empty concept list | No concepts created | CTA: _"Cree su primer concepto."_ | ConceptList |
| Empty provider list | No providers registered | CTA: _"Registre su primer proveedor."_ | ProviderList |

---

## 7. BDD Scenario Coverage

Estimated **30 scenarios** across 5 feature files:

| # | File | Scenarios | Focus |
|---|---|---|---|
| 1 | `features/expenses/expense-crud.feature` | 7 | Create ORDINARIA, create EXTRAORDINARIA, list with filters, view detail, tombstone with confirmation, version history display, multi-term create |
| 2 | `features/expenses/expense-approval.feature` | 6 | Approve EXTRAORDINARIA (optimistic), reject EXTRAORDINARIA (with confirmation), approve rollback on failure, reject rollback on failure, ORDINARIA shows no approval buttons, rejected expense shows no approve button |
| 3 | `features/expenses/concept-category.feature` | 6 | Create concept, list concepts grouped, filter by group, create category, list categories grouped, empty states |
| 4 | `features/expenses/provider.feature` | 6 | Register provider, list providers, edit provider, soft-delete with confirmation, toggle show/hide tombstoned, duplicate CUIT error |
| 5 | `features/expenses/expense-form.feature` | 5 | Required field validation, cost must be positive, type toggle shows/hides approval notice, multi-term fields appear when terms > 1, form reset on successful submission |

---

## 8. API Coverage Checklist

All 15 expenses endpoints defined in the OpenAPI spec:

- [ ] `POST /expenses` — consumed by `useCreateExpense()` in ExpenseForm
- [ ] `GET /expenses` — consumed by `useExpenses()` in ExpenseList + ExpenseDetail (select by ID)
- [ ] `GET /expenses/{id}/versions` — consumed by `useExpenseVersions()` in VersionHistory
- [ ] `PUT /expenses/{id}/tombstone` — consumed by `useTombstoneExpense()` in ExpenseDetail
- [ ] `PUT /expenses/{id}/approve` — consumed by `useApproveExpense()` in ExpenseActions
- [ ] `PUT /expenses/{id}/reject` — consumed by `useRejectExpense()` in ExpenseActions
- [ ] `POST /expenses/concepts` — consumed by `useCreateConcept()` in ConceptList modal
- [ ] `GET /expenses/concepts` — consumed by `useConcepts()` in ConceptList
- [ ] `GET /expenses/concepts/{group}` — consumed by group filter tabs in ConceptList
- [ ] `POST /expenses/categories` — consumed by `useCreateCategory()` in CategoryList modal
- [ ] `GET /expenses/categories` — consumed by `useCategories()` in CategoryList
- [ ] `POST /expenses/providers` — consumed by `useCreateProvider()` in ProviderForm
- [ ] `GET /expenses/providers` — consumed by `useProviders()` in ProviderList
- [ ] `PUT /expenses/providers/{id}` — consumed by `useUpdateProvider()` in ProviderForm (edit)
- [ ] `PUT /expenses/providers/{id}/tombstone` — consumed by `useTombstoneProvider()` in ProviderList
- [ ] All endpoints have orval-generated hooks in `src/api/generated/expenses/expenses.ts` (verified during contract setup)
- [ ] All endpoints have MSW handlers in `src/mocks/handlers/expenses.ts` (verified during contract setup)

### No new gaps.

---

*End of SPEC — Expenses.*
