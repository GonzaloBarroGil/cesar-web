# PLAN — CESAR Web Phase 1

> **Status:** Approved (2026-06-25). Updated 2026-07-13.
> **Date:** 2026-06-25
> **Phase:** TASKS — Wave 2 complete, Wave 3 pending.
> **Progress:** 20/70 tasks complete. Waves 1-2 done, Waves 3-7 pending.
> **Depends on:** All 9 SPECs approved (auth, layout, consorcios, expenses,
>   invoices, debt, payments, incomes-outputs, dashboard)

---

## 1. Task Decomposition

### T0 — Foundation (11 tasks, Wave 1)

Foundation absorbs auth + layout + shared components. No parallel execution.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T0.1 | Scaffold Vite + React + shadcn/ui + Tailwind + Biome + TanStack Query provider | feature-developer | — |
| T0.2 | Shared components: MoneyDisplay, StatusBadge, CUITInput, PeriodPicker, IvaConditionSelect, ConfirmationDialog, ToastProvider, SkeletonCard | feature-developer | T0.1 |
| T0.2b | Vitest unit tests for all 5 shared components: MoneyDisplay, StatusBadge, CUITInput (checksum), PeriodPicker, IvaConditionSelect | quality-engineer | T0.2 |
| T0.4 | API plumbing: axios client (JWT + idempotency interceptor), Zod schemas | feature-developer | T0.1 | ✓ Pre-completed (CONTRACT SETUP phase) |
| T0.5 | Auth: LoginPage, LoginForm, AuthProvider, AuthGuard, RoleGuard, HealthIndicator | feature-developer | T0.2, T0.4 |
| T0.6 | Layout: AppShell, Sidebar, SidebarLink, Header, ConsorcioSelector, UserMenu, Breadcrumbs, responsive sidebar (hamburger/mobile), HealthIndicator footer | feature-developer | T0.5 |
| T0.7 | Auth BDD step defs (12 scenarios) + Vitest component tests | quality-engineer | T0.5 |
| T0.8 | Layout BDD step defs (12 scenarios) + Vitest component tests | quality-engineer | T0.6 |
| T0.9 | Auth + Layout E2E Playwright tests + axe-core a11y audit on login + app shell routes | quality-engineer | T0.7, T0.8 |
| T0.10 | Fix a11y findings (keyboard nav on sidebar, ARIA labels on HealthIndicator, focus trap on mobile sidebar) | feature-developer | T0.9 |
| T0.11 | Re-audit → Foundation a11y clean | quality-engineer | T0.10 |
| T0.12 | Contract verify: all auth + health MSW handlers aligned with generated types, tsc clean | contract-guardian | T0.7, T0.8 |

### T1 — Consorcios (8 tasks, Wave 2)

Depends on T0. Serial execution.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T1.1 | Implement components: ConsorcioList, ConsorcioForm, ConsorcioDetail, UfTable, UfRow, PropietarioList, PropietarioForm, PeriodTimeline, PeriodActions | feature-developer | T0.6 |
| T1.2 | Implement hooks + state: useConsorcio, useConsorcios, usePropietarios, usePeriods, all 7 mutation hooks, TanStack Query key map with invalidation | feature-developer | T1.1 |
| T1.3 | Implement pages + routing: all consorcio routes, tab navigation (General/UFs/Propietarios/Períodos), modal wiring, consorcio selector integration | feature-developer | T1.2 |
| T1.4 | Write BDD step defs for all 25 scenarios (4 feature files) | quality-engineer | T0.11 |
| T1.5 | Write Vitest component tests: form validation (CUIT checksum, percentage sum, required fields), period state button visibility | quality-engineer | T1.3 |
| T1.6 | Run E2E Playwright tests + axe-core a11y audit on all consorcio routes | quality-engineer | T1.4, T1.5 |
| T1.7 | Fix a11y findings | feature-developer | T1.6 |
| T1.8 | Contract verify: all 10 consorcio endpoints consumed, MSW aligned, tsc clean | contract-guardian | T1.5, T1.7 |

### T2 — Expenses (8 tasks, Wave 3 ∥ T3)

Depends on T1 (periods, providers, concepts, categories data). Parallel with T3.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T2.1 | Implement components: ExpenseList, ExpenseFilters, ExpenseForm, ExpenseDetail, ExpenseActions, VersionHistory, ProviderList, ProviderForm, ConceptList, CategoryList | feature-developer | T1.3 |
| T2.2 | Implement hooks + state: useExpenses, useExpenseVersions, useConcepts, useCategories, useProviders, all 9 mutation hooks, optimistic updates (DEC-001) for approve/reject | feature-developer | T2.1 |
| T2.3 | Implement pages + routing: all expense routes, provider routes, concept/category as sub-views, confirmation dialogs (DEC-002) for tombstone/reject | feature-developer | T2.2 |
| T2.4 | Write BDD step defs for all 30 scenarios (5 feature files) | quality-engineer | T0.11 |
| T2.5 | Write Vitest component tests: form validation, type toggle logic, multi-term visibility, optimistic rollback, filter interactions | quality-engineer | T2.3 |
| T2.6 | Run E2E Playwright tests + axe-core a11y audit on all expenses routes | quality-engineer | T2.4, T2.5 |
| T2.7 | Fix a11y findings | feature-developer | T2.6 |
| T2.8 | Contract verify: all 15 expenses endpoints consumed, MSW aligned, tsc clean | contract-guardian | T2.5, T2.7 |

### T3 — Invoices (8 tasks, Wave 3 ∥ T2)

Depends on T1 (consorcio IVA condition). Parallel with T2.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T3.1 | Implement components: InvoiceList, FacturaAForm, FacturaBForm, FacturaCForm, InvoiceDetail, InvoiceItems, InvoiceTotals, CaeQrDisplay, NotaForm, ReciboForm, ReciboDetail, AnnulButton | feature-developer | T1.3 |
| T3.2 | Implement hooks + state: useCreateFacturaA/B/C, useAnularInvoice, useCreateNotaCredito, useCreateNotaDebito, useAnularNotaCredito, useAnularNotaDebito, useCreateRecibo, useAnularRecibo. DEC-001 on 4 annul mutations. IVA breakdown client-side computation. Factura B CUIT conditional ($5k threshold). NC remaining amount validation. | feature-developer | T3.1 |
| T3.3 | Implement pages + routing: all invoice routes, NC/ND linked forms, recibo forms. DEC-002 confirmation dialogs on all 4 annul actions. ACCOUNTANT role guard (annul hidden). | feature-developer | T3.2 |
| T3.4 | Write BDD step defs for all 28 scenarios (6 feature files) | quality-engineer | T0.11 |
| T3.5 | Write Vitest component tests: A/B/C form differences, IVA rate breakdown, CUIT conditional, NC remaining validation, optimistic annul rollback, ACCOUNTANT role guard on annul buttons | quality-engineer | T3.3 |
| T3.6 | Run E2E Playwright tests + axe-core a11y audit on all invoices routes | quality-engineer | T3.4, T3.5 |
| T3.7 | Fix a11y findings | feature-developer | T3.6 |
| T3.8 | Contract verify: all 12 invoices endpoints consumed, MSW aligned, tsc clean. Verify ACCOUNTANT role enforcement in MSW for annul endpoints. | contract-guardian | T3.5, T3.7 |

### T4 — Debt (8 tasks, Wave 4)

Depends on T1 (UFs, periods) + T2 (expense data for allocation display). Serial.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T4.1 | Implement components: LiquidacionList, GenerateModal, LiquidacionDetail, ExpenseAllocationTable, FinancialSummary, IssueButton, PdfButton, CertificadoList, CertificadoDetail, SignButton | feature-developer | T1.3, T2.3 |
| T4.2 | Implement hooks + state: useLiquidaciones, useLiquidacionDetail, useGenerateLiquidacion, useBatchGenerate, useIssueLiquidacion, useCertificados, useCertificadoDetail, useGenerateCertificado, useSignCertificado. DEC-001 on issue/sign. DEC-002 on issue/sign. No domain math — display-only. | feature-developer | T4.1 |
| T4.3 | Implement pages + routing: all debt routes, batch confirmation dialog, PDF placeholder (disabled + tooltip "No disponible próximamente"), financial summary formatting (Intl.NumberFormat es-AR) | feature-developer | T4.2 |
| T4.4 | Write BDD step defs for all 22 scenarios (3 feature files) | quality-engineer | T0.11 |
| T4.5 | Write Vitest component tests: allocation table rendering, financial summary formatting, status-dependent button visibility, PDF button states, optimistic rollback for issue/sign | quality-engineer | T4.3 |
| T4.6 | Run E2E Playwright tests + axe-core a11y audit on all debt routes | quality-engineer | T4.4, T4.5 |
| T4.7 | Fix a11y findings | feature-developer | T4.6 |
| T4.8 | Contract verify: all 9 debt endpoints consumed, MSW aligned, PDF 501 handler matches backend, tsc clean | contract-guardian | T4.5, T4.7 |

### T5 — Payments (8 tasks, Wave 5 ∥ T6)

Depends on T4 (liquidaciones for reference). Parallel with T6.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T5.1 | Implement components: PaymentList, PaymentFilters, PaymentCreateModal, PaymentDetail, ReverseButton, UnitBalanceCard, UnitHistoryTable, PaymentMethodBadge, NoVoucherWarning | feature-developer | T4.3 |
| T5.2 | Implement hooks + state: usePayments, usePaymentDetail, useCreatePayment, useReversePayment, useUnitBalance, useUnitHistory. DEC-001 on reverse. DEC-002 on reverse. Voucher conditional (CASH only). | feature-developer | T5.1 |
| T5.3 | Implement pages + routing: payments list + balances tab, creation modal, detail page. Tab navigation (Pagos / Balances). | feature-developer | T5.2 |
| T5.4 | Write BDD step defs for all 18 scenarios (3 feature files) | quality-engineer | T0.11 |
| T5.5 | Write Vitest component tests: amount > 0 validation, voucher field conditional, CASH no-voucher warning badge, optimistic reversal rollback, balance computation | quality-engineer | T5.3 |
| T5.6 | Run E2E Playwright tests + axe-core a11y audit on all payments routes | quality-engineer | T5.4, T5.5 |
| T5.7 | Fix a11y findings | feature-developer | T5.6 |
| T5.8 | Contract verify: all 6 payments endpoints consumed, MSW aligned, tsc clean | contract-guardian | T5.5, T5.7 |

### T6 — Incomes/Outputs (8 tasks, Wave 5 ∥ T5)

Depends on T1 (periods) + T3 (invoice linking). Parallel with T5.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T6.1 | Implement components: EntryList, DirectionFilter, DateRangeFilter, EntryCreateModal, EntryDetail, VersionHistory, EntryUpdateForm, CancelButton, DirectionBadge, SubTypeSelector, SinglePeriodSummary, CrossPeriodSummary | feature-developer | T1.3, T3.3 |
| T6.2 | Implement hooks + state: useEntries, useEntryDetail, useCreateEntry, useUpdateEntry, useCancelEntry, useSinglePeriodSummary, useCrossPeriodSummary. DEC-001 on cancel. DEC-002 on cancel. Sub-type conditional logic (invoice_id for INCOME_RENT, migration tags for OUTPUT_TEMP). | feature-developer | T6.1 |
| T6.3 | Implement pages + routing: entries list with filters, creation modal, detail with update form, summary with tabs (Por Período / Acumulado). Net flow coloring (green/red). | feature-developer | T6.2 |
| T6.4 | Write BDD step defs for all 18 scenarios (3 feature files) | quality-engineer | T0.11 |
| T6.5 | Write Vitest component tests: direction toggle switches sub-types, invoice_id conditional visibility, date-in-period-range validation, optimistic cancel rollback, net flow sign coloring | quality-engineer | T6.3 |
| T6.6 | Run E2E Playwright tests + axe-core a11y audit on all incomes-outputs routes | quality-engineer | T6.4, T6.5 |
| T6.7 | Fix a11y findings | feature-developer | T6.6 |
| T6.8 | Contract verify: all 7 incomes-outputs paths consumed, MSW aligned, tsc clean | contract-guardian | T6.5, T6.7 |

### T7 — Dashboard (6 tasks, Wave 6)

Depends on T4 + T5 + T2 + T6 (reads all). Serial. Reduced to 5 implementation + 1 verification (no mutations, read-only).

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T7.1 | Implement components: DashboardPage, MetricCard (loading/ready/error/empty states), PeriodSelector, RecentActivityFeed, IncomeExpenseCard, DashboardGrid (2×3 desktop, stacked mobile) | feature-developer | T4.3, T5.3, T2.3, T6.3 |
| T7.2 | Implement hooks + state: useQueries([...]) composing 4 source queries. Metric derivation (debt sum, collection rate, pending count, active count). Period default to current OPEN. ConsorcioContext integration. | feature-developer | T7.1 |
| T7.3 | Implement page + routing: DashboardPage at "/". Period selector → all metrics refetch. Drill-down on card click → navigate to source module. Empty state for new consorcio. Error state with per-card retry. | feature-developer | T7.2 |
| T7.4 | Write BDD step defs for all 12 scenarios (1 feature file) | quality-engineer | T0.11 |
| T7.5 | Write Vitest component tests + E2E Playwright tests + axe-core a11y audit: metric derivation correctness, period switch refetch, per-card error isolation, drill-down navigation, 2×3 grid layout, collection rate coloring | quality-engineer | T7.3 |
| T7.6 | Contract verify: all cross-feature query imports resolved. No new MSW handlers needed. No new orval generation. tsc clean. | contract-guardian | T7.5 |

### T8 — Final Validation (4 tasks, Wave 7)

Depends on all features (T1–T7). Serial.

| ID | Task | Agent | Depends On |
|---|---|---|---|
| T8.1 | Full E2E regression: run all ~177 BDD scenarios across 27 feature files. Report pass/fail per scenario. All must pass. | quality-engineer | T7.6 |
| T8.2 | Accessibility audit: full WCAG 2.1 AA audit across all routes. Generate per-route accessibility report. All routes must pass. | quality-engineer | T8.1 |
| T8.3 | Contract fidelity: verify all 61 endpoints consumed by generated hooks. Verify all MSW handlers aligned with OpenAPI spec. Regenerate orval. `tsc --noEmit` clean. No hand-written fetch calls. | contract-guardian | T7.6 |
| T8.4 | License compliance: run `license-report` on full dependency tree. Verify zero proprietary or non-approved copyleft licenses. Validate project license (AGPL-3.0 + MIT). | constitution-architect | T8.1 |

---

## 2. Dependency Graph

```
T0 (Foundation, 11 tasks)
  │  Absorbs: auth, layout, shared components, API plumbing
  │
  ├─→ T1 (Consorcios, 8 tasks)
  │     │
  │     ├─→ T2 (Expenses, 8 tasks) ──────────┐
  │     │  Reads: periods, providers, concepts │
  │     │                                      │
  │     ├─→ T3 (Invoices, 8 tasks) ──┐         │
  │     │  Reads: IVA condition       │         │
  │     │                              │         │
  │     │  W3: T2 ∥ T3                │         │
  │     │                              │         │
  │     │                              │         ├─→ T4 (Debt, 8 tasks)
  │     │                              │         │  Reads: UFs, periods, expense data
  │     │                              │         │      │
  │     │                              │         │      ├─→ T5 (Payments, 8 tasks) ──┐
  │     │                              │         │      │  Reads: liquidaciones        │
  │     │                              │         │      │                              │
  │     │                              │         │      ├─→ T6 (Incomes, 8 tasks) ───┤
  │     │                              │         │      │  Reads: periods, invoices     │
  │     │                              │         │      │                              │
  │     │                              │         │  W5: T5 ∥ T6                       │
  │     │                              │         │                                     │
  │     │                              │         └──────────┬──────────────────────────┤
  │     │                              │                     │                          │
  │     │                              └──── (invoice link)→─┘                          │
  │     │                                                                               │
  │     │                                        T7 (Dashboard, 6 tasks) ←──────────────┘
  │     │                                         Reads: T4 + T5 + T2 + T6
  │     │                                              │
  │     └── (periods for T6 validation) ───────────────┘
  │
  └──────────────────────────────────────→ T8 (Final Validation, 4 tasks)

Dependency legend:
  →  Sequential (must wait for dependency to complete)
  ∥  Parallel (can execute simultaneously)
  ←  Reads data from
```

### Execution Waves Summary

| Wave | Features | Tasks | Parallel? | Gate Count |
|---|---|---|---|---|
| W1 | T0 Foundation | 12 | Serial | 12 ◉ |
| W2 | T1 Consorcios | 8 | Serial | 8 ◉ |
| W3 | T2 Expenses ∥ T3 Invoices | 16 (8+8) | Yes | 16 ◉ |
| W4 | T4 Debt | 8 | Serial | 8 ◉ |
| W5 | T5 Payments ∥ T6 Incomes/Outputs | 16 (8+8) | Yes | 16 ◉ |
| W6 | T7 Dashboard | 6 | Serial | 6 ◉ |
| W7 | T8 Final Validation | 4 | Serial | 4 ◉ |
| **Total** | | **70** | | **70 ◉** |

---

## 3. Agent Assignments Summary

| Agent | Tasks | % | Task IDs |
|---|---|---|---|
| **quality-engineer** | 29 | 41% | T0.2b, T0.7–T0.9, T0.11, T1.4–T1.6, T2.4–T2.6, T3.4–T3.6, T4.4–T4.6, T5.4–T5.6, T6.4–T6.6, T7.4–T7.5, T8.1–T8.2 |
| **feature-developer** | 29 | 41% | T0.1–T0.2, T0.4–T0.6, T0.10, T1.1–T1.3, T1.7, T2.1–T2.3, T2.7, T3.1–T3.3, T3.7, T4.1–T4.3, T4.7, T5.1–T5.3, T5.7, T6.1–T6.3, T6.7, T7.1–T7.3 |
| **contract-guardian** | 10 | 14% | T0.12, T1.8, T2.8, T3.8, T4.8, T5.8, T6.8, T7.6, T8.3 |
| **constitution-architect** | 2 | 3% | T8.4 |
| **Total** | **69** | | |

### Task Distribution Visualization

```
quality-engineer:  ████████████████████████████ 28 tasks (41%)
feature-developer: █████████████████████████████ 29 tasks (42%)
contract-guardian: ██████████ 10 tasks (14%)
constitution-arch: ██ 2 tasks (3%)
```

### Per-Feature Agent Task Count

| Feature | feature-developer | quality-engineer | contract-guardian |
|---|---|---|---|
| T0 Foundation | 6 | 5 | 1 |
| T1 Consorcios | 4 | 3 | 1 |
| T2 Expenses | 4 | 3 | 1 |
| T3 Invoices | 4 | 3 | 1 |
| T4 Debt | 4 | 3 | 1 |
| T5 Payments | 4 | 3 | 1 |
| T6 Incomes/Outputs | 4 | 3 | 1 |
| T7 Dashboard | 3 | 2 | 1 |
| T8 Final Validation | — | 2 | 1 (+1 const-arch) |

---

## 4. Execution Strategy

1. **Wave 1 — Foundation**: Serial. All features depend on shared components,
   auth, and layout. Quality-engineer writes auth + layout BDD step defs while
   feature-developer builds them. Contract-guardian verifies at gate T0.12.

2. **Wave 2 — Consorcios**: Serial. Foundation for all domain features.
   Unlocks expenses, invoices, and debt.

3. **Wave 3 — Expenses ∥ Invoices**: First parallel wave. Two agents can
   work simultaneously on independent feature code. Both only read from
   consorcios. Contract-guardian verifies both at their respective gates.

4. **Wave 4 — Debt**: Serial. Critical path — most complex display logic
   (financial summaries, allocation tables, PDF placeholder, certificado
   signing). Depends on both expenses and consorcios.

5. **Wave 5 — Payments ∥ Incomes/Outputs**: Second parallel wave. Payments
   depends on debt (liquidaciones). Incomes depends on consorcios (periods) +
   invoices (invoice linking). Independent code paths.

6. **Wave 6 — Dashboard**: Serial. Aggregates queries from four source modules.
   Reduced to 5 implementation tasks (read-only, no forms, no mutations).

7. **Wave 7 — Final Validation**: Serial. Full regression, accessibility,
   contract fidelity, and license compliance across all features.

### Critical Path

```
T0 → T1 → T2 → T4 → T5 → T7 → T8  (longest chain, 6 waves)
T0 → T1 → T3 → T6 → T7 → T8        (parallel branch, 5 waves)
```

The critical path runs through expenses → debt → payments → dashboard.
Invoices and incomes-outputs can execute in parallel without blocking the
critical path, provided the parallel agent is available.

### HITL Gate Rules

- **69 mandatory gates**, one per task. No batching, no fast-tracking.
- Each gate must be explicitly acknowledged before the assigned agent starts
  the next task.
- Between waves, the contract-guardian verification task must pass before
  the HITL approves the wave transition.
- Within a parallel wave (W3, W5), each feature has independent gates.
  Feature B can proceed through its gates while Feature A is still pending.
- The T0.12 gate is a wave gate — W2 cannot start until T0.12 passes.
  Same for T1.8 → W3, T2.8+T3.8 → W4, T4.8 → W5, T5.8+T6.8 → W6,
  T7.6 → W7.

---

## 5. Per-Task HITL Gate Specification

Every task ID maps to exactly one HITL gate. Each gate requires explicit
acknowledgment before the agent proceeds to the next task.

```
◉ T0.1  feature-developer   Scaffold project                              → HITL ✓
◉ T0.2  feature-developer   Shared components                              → HITL ✓
◉ T0.2b quality-engineer    Vitest tests for shared components              → HITL ✓
◉ T0.4  feature-developer   API plumbing (✓ pre-completed — CONTRACT SETUP)
◉ T0.5  feature-developer   Auth: Login + guards                           → HITL ✓
◉ T0.6  feature-developer   Layout: AppShell + sidebar                     → HITL ✓
◉ T0.7  quality-engineer    Auth BDD step defs + component tests           → HITL ✓
◉ T0.8  quality-engineer    Layout BDD step defs + component tests         → HITL ✓
◉ T0.9  quality-engineer    E2E + a11y audit on auth + layout routes       → HITL ✓
◉ T0.10 feature-developer   Fix a11y findings                              → HITL ✓
◉ T0.11 quality-engineer    Re-audit → Foundation a11y clean               → HITL ✓
◉ T0.12 contract-guardian   Contract verify auth + health endpoints        → HITL ✓
── ◉ WAVE 1 COMPLETE ──→ W2

◉ T1.1  feature-developer   Components: ConsorcioList, UfTable, etc.      → HITL ✓
◉ T1.2  feature-developer   Hooks: useConsorcio, all 7 mutations           → HITL ✓
◉ T1.3  feature-developer   Pages + routing: all consorcio routes          → HITL ✓
◉ T1.4  quality-engineer    BDD step defs: 25 scenarios                    → HITL ✓
◉ T1.5  quality-engineer    Vitest tests: form validation, state buttons   → HITL ✓
◉ T1.6  quality-engineer    E2E + a11y audit on consorcio routes           → HITL ✓
◉ T1.7  feature-developer   Fix a11y findings                              → HITL ✓
◉ T1.8  contract-guardian   Contract verify: all 10 consorcio endpoints    → HITL ✓
── ◉ WAVE 2 COMPLETE ──→ W3

◉ T2.1  feature-developer   Components: ExpenseList, ProviderList, etc.   → pending
◉ T2.2  feature-developer   Hooks: all 9 mutations, DEC-001 approve/reject → pending
◉ T2.3  feature-developer   Pages + routing: DEC-002 confirmation dialogs  → pending
◉ T2.4  quality-engineer    BDD step defs: 30 scenarios                    → pending
◉ T2.5  quality-engineer    Vitest tests: form, toggle, optimistic rollback → pending
◉ T2.6  quality-engineer    E2E + a11y audit on expenses routes            → pending
◉ T2.7  feature-developer   Fix a11y findings                              → pending
◉ T2.8  contract-guardian   Contract verify: all 15 expenses endpoints     → pending
── ∥ T2 and T3 gates are independent (features run in parallel)

◉ T3.1  feature-developer   Components: FacturaAForm, NotaForm, etc.      → pending
◉ T3.2  feature-developer   Hooks: 10 mutations, DEC-001 on 4 annuls       → pending
◉ T3.3  feature-developer   Pages + routing: DEC-002 on all annuls         → pending
◉ T3.4  quality-engineer    BDD step defs: 28 scenarios                    → pending
◉ T3.5  quality-engineer    Vitest tests: IVA, CUIT, NC, role guard        → pending
◉ T3.6  quality-engineer    E2E + a11y audit on invoices routes            → pending
◉ T3.7  feature-developer   Fix a11y findings                              → pending
◉ T3.8  contract-guardian   Contract verify: all 12 invoices endpoints     → pending
── ◉ WAVE 3 PENDING

◉ T4.1  feature-developer   Components: LiquidacionDetail, CertDetail      → pending
◉ T4.2  feature-developer   Hooks: 9 mutations, DEC-001 on issue/sign      → pending
◉ T4.3  feature-developer   Pages + routing: PDF placeholder, DEC-002       → pending
◉ T4.4  quality-engineer    BDD step defs: 22 scenarios                    → pending
◉ T4.5  quality-engineer    Vitest tests: allocation, status, PDF button    → pending
◉ T4.6  quality-engineer    E2E + a11y audit on debt routes                → pending
◉ T4.7  feature-developer   Fix a11y findings                              → pending
◉ T4.8  contract-guardian   Contract verify: all 9 debt endpoints          → pending
── ◉ WAVE 4 PENDING

◉ T5.1  feature-developer   Components: PaymentList, UnitBalanceCard       → pending
◉ T5.2  feature-developer   Hooks: 6 mutations, DEC-001 on reverse         → pending
◉ T5.3  feature-developer   Pages + routing: list + balances tab            → pending
◉ T5.4  quality-engineer    BDD step defs: 18 scenarios                    → pending
◉ T5.5  quality-engineer    Vitest tests: amount, voucher, reversal         → pending
◉ T5.6  quality-engineer    E2E + a11y audit on payments routes            → pending
◉ T5.7  feature-developer   Fix a11y findings                              → pending
◉ T5.8  contract-guardian   Contract verify: all 6 payments endpoints      → pending
── ∥ T5 and T6 gates are independent

◉ T6.1  feature-developer   Components: EntryList, SummaryCards            → pending
◉ T6.2  feature-developer   Hooks: 6 mutations, DEC-001 on cancel          → pending
◉ T6.3  feature-developer   Pages + routing: summary tabs, net coloring     → pending
◉ T6.4  quality-engineer    BDD step defs: 18 scenarios                    → pending
◉ T6.5  quality-engineer    Vitest tests: direction, invoice_id, date       → pending
◉ T6.6  quality-engineer    E2E + a11y audit on incomes routes             → pending
◉ T6.7  feature-developer   Fix a11y findings                              → pending
◉ T6.8  contract-guardian   Contract verify: all 7 IO paths                → pending
── ◉ WAVE 5 PENDING

◉ T7.1  feature-developer   Components: MetricCard, DashboardGrid          → pending
◉ T7.2  feature-developer   Hooks: useQueries composition, metric derivation→ pending
◉ T7.3  feature-developer   Page + routing: "/", drill-down, empty state   → pending
◉ T7.4  quality-engineer    BDD step defs: 12 scenarios                    → pending
◉ T7.5  quality-engineer    E2E + a11y audit on dashboard route            → pending
◉ T7.6  contract-guardian   Contract verify: cross-feature imports          → pending
── ◉ WAVE 6 PENDING

◉ T8.1  quality-engineer    Full E2E regression: all 177 BDD scenarios     → pending
◉ T8.2  quality-engineer    WCAG 2.1 AA audit across all routes            → pending
◉ T8.3  contract-guardian   Contract fidelity: all 61 endpoints, tsc clean → pending
◉ T8.4  constitution-arch   License compliance: AGPL-3.0 + MIT verified    → pending
── ◉ WAVE 7 PENDING
```

---

*End of PLAN.*
