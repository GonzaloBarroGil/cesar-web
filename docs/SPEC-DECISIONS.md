# SPEC Design Decisions — CESAR Web

> **Purpose:** Track cross-cutting design decisions that emerge during SPEC
> authoring and affect multiple features. Promotable to constitutional ADRs if
> they reach governance-level significance.
> **Supersedes:** Nothing. Complements `docs/CONSTITUTION.md` §4 (ADR catalog).
> **Date:** 2026-06-25

---

## DEC-001: Optimistic UI with Rollback on Mutation Failure

**Origin:** `spec-expenses.md` §3.3 and §3.4 (approve/reject extraordinary expenses)
**Applies to:** Any mutation where immediate UI feedback improves perceived performance

### Decision

For non-critical mutations (approve, reject, annul, issue, reverse, cancel),
use TanStack Query's `onMutate` / `onError` pattern:

1. `onMutate`: Immediately apply the expected new state to the UI. Cancel
   in-flight queries that would overwrite the optimistic state.
2. `onError`: Roll back to the previous state. Show a toast notification.
3. `onSettled`: Invalidate affected query keys to ensure eventual consistency
   with the backend.

### Rationale

- Removes perceived latency for the user — the UI responds instantly.
- The backend is the final authority — rollback on error ensures correctness.
- TanStack Query provides this pattern natively; no custom implementation needed.
- Follows CFFD principle: the contract (OpenAPI) defines the mutation; the UI
  assumes success until proven otherwise.

### Features Affected (known)

| Feature | Mutations | Status |
|---|---|---|
| Expenses | `useApproveExpense`, `useRejectExpense` | SPEC authored |
| Invoices | `useAnularInvoice`, `useAnularNotaCredito`, `useAnularNotaDebito`, `useAnularRecibo` | Not yet SPEC'd |
| Debt | `useIssueLiquidacion`, `useSignCertificado` | Not yet SPEC'd |
| Payments | `useReversePayment` | Not yet SPEC'd |
| Incomes/Outputs | `useCancelEntry` | Not yet SPEC'd |

### Enforcement

- `feature-developer` agent must implement `onMutate`/`onError` for all
  applicable mutations.
- `quality-engineer` agent must write BDD scenarios that assert: immediate
  state change, rollback on error, toast on failure.
- Tag: `@optimistic`.

### When Not to Use

- Mutations with complex side effects (e.g., batch liquidacion generation
  that produces multiple entities).
- Mutations where immediate UI state change is misleading (e.g., archive —
  the resource disappears from the active view).

---

*End of SPEC Design Decisions.*
