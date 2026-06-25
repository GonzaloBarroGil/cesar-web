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
| Invoices | `useAnularInvoice`, `useAnularNotaCredito`, `useAnularNotaDebito`, `useAnularRecibo` | SPEC authored |
| Debt | `useIssueLiquidacion`, `useSignCertificado` | SPEC authored |
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

## DEC-002: Confirmation Dialog on Irreversible Actions

**Origin:** `spec-expenses.md` §3.7 (tombstone expense), §3.4 (reject expense)
**Applies to:** Any mutation that is irreversible or has compliance implications

### Decision

All irreversible or destructive user actions must be gated behind a
confirmation dialog (`shadcn/ui AlertDialog`):

1. User clicks the action button (annul, delete, reject, reverse, close, archive).
2. A confirmation dialog appears with: title, descriptive message explaining
   the consequence, optional reason/comment field for traceability, "Confirmar"
   and "Cancelar" buttons.
3. On "Confirmar": the mutation fires. On "Cancelar" or backdrop click or
   Escape: dialog closes, no side effects.
4. The confirmation button uses a destructive variant (red) for irreversible
   actions, and a primary variant for reversible or reversible-in-effect actions.

### Rationale

- Follows constitution AP-2 (Semantic Drift prevention): the user must
  understand the consequence before it happens.
- Argentine condominium administration has legal implications — accidental
  annulment of an ARCA invoice or reversal of a payment creates audit gaps.
- Consistency: all features use the same dialog component, same interaction
  pattern, same keyboard behavior (Escape to cancel, focus trap).

### Features Affected (known)

| Feature | Actions Requiring Confirmation | Status |
|---|---|---|
| Expenses | Tombstone, reject EXTRAORDINARIA | SPEC authored |
| Consorcios | Cerrar período, Archivar período | SPEC authored |
| Invoices | Anular Factura, NC, ND, Recibo | SPEC authored |
| Debt | Issue liquidacion, Sign certificado | SPEC authored |
| Payments | Reverse payment | Not yet SPEC'd |
| Incomes/Outputs | Cancel entry | Not yet SPEC'd |

### Enforcement

- `feature-developer` agent must use `<AlertDialog>` for all irreversible actions.
- `quality-engineer` agent must write BDD scenarios asserting: dialog appears,
  cancel dismisses cleanly, confirm fires mutation, Escape closes dialog.
- Tag: `@confirmation`.

### When Not to Use

- Actions where the cost of an error is low and easily reversible (e.g.,
  toggling a filter, changing a sort order, switching a tab).
- Actions where the user intent is unambiguous from context and the
  consequence is clearly visible inline (e.g., editing a field in a table
  row that auto-saves).

---

*End of SPEC Design Decisions.*
