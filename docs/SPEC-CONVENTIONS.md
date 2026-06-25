# SPEC Conventions — CESAR Web

> **Purpose:** Execution conventions for the SPEC phase of the CFFD workflow.
> **Supersedes:** Nothing. Complements `docs/CONSTITUTION.md` §6.
> **Status:** Draft — awaiting HITL validation
> **Date:** 2026-06-25

---

## 1. Feature Ordering

Features follow the dependency chain. Each feature must have its SPEC
approved before the next feature's SPEC begins.

| # | Feature | Depends On |
|---|---|---|
| 1 | auth | None (foundation) |
| 2 | layout | auth (role-based rendering) |
| 3 | consorcios | auth + layout (consorcio selector) |
| 4 | expenses | consorcios (period, provider, concept data) |
| 5 | invoices | consorcios (IVA condition) + expenses (providers) |
| 6 | debt | consorcios (UFs, periods) + expenses (cost data) |
| 7 | payments | debt (liquidaciones) |
| 8 | incomes-outputs | consorcios (periods) + invoices (invoice linking) |
| 9 | dashboard | all modules (cross-cutting metrics) |

---

## 2. Per-Feature Workflow

Each feature follows this loop. Every gate requires explicit HITL
acknowledgment before proceeding.

```
SPEC doc
    │
    ▼
◉ HITL GATE — SPEC approved
    │
    ▼
BDD scenarios (.feature files)
    │
    ▼
◉ HITL GATE — BDD scenarios approved
    │
    ▼
API coverage verification (contract-guardian checklist)
    │
    ▼
◉ HITL GATE — Feature ready for PLAN
    │
    ▼
Next feature (repeat loop)
```

No two features may have active SPEC documents simultaneously.

---

## 3. SPEC Document Format

Every `docs/specs/spec-<module>.md` follows this 8-section structure:

| § | Content | Owner |
|---|---|---|
| 1 | **Feature Overview** — Purpose, API surface (which endpoints), user roles involved | feature-developer |
| 2 | **Pages** — Table of page components with route, auth requirement, and brief description | feature-developer |
| 3 | **User Flows** — Numbered sequence of user actions → system responses. Covers happy paths and primary sad paths. | feature-developer |
| 4 | **Component Catalog** — Table of components with type (form, display, guard) and all states (idle, loading, error, empty) | feature-developer |
| 5 | **State Management** — Which context/hook owns which state. TanStack Query key structure. Data flow diagram (API → cache → component). | feature-developer |
| 6 | **Error States** — Table of error conditions, triggers, and UI responses per page | feature-developer |
| 7 | **BDD Scenario Coverage** — Estimated scenario count per flow (actual scenarios authored later by quality-engineer) | feature-developer (estimate) |
| 8 | **API Coverage Checklist** — Verbatim endpoint list with checkboxes. contract-guardian verifies each endpoint is consumed by the feature. | contract-guardian |

---

## 4. BDD Scenario Conventions

- **Location**: `features/<module>/<feature-name>.feature`
- **Gherkin dialect**: Spanish user actions (e.g., `Dado que`, `Cuando`, `Entonces`)
- **Tag categories**: `@happy-path`, `@validation`, `@error-state`, `@empty-state`, `@role-guard`, `@a11y`, `@optimistic`, `@offline`, `@display`
- **Background**: Shared setup (logged-in user, selected consorcio, MSW configured)
- **Examples tables**: For form validation parameterization
- **Money assertions**: Always assert the displayed format (`$ 1.500,00`), not the API wire format (`150000` cents)

---

## 5. HITL Gate Rules

| Gate | What HITL Validates | Exit Criteria |
|---|---|---|
| SPEC approval | Document completeness (all 8 sections filled). Flow correctness (does this match user expectations?). No missing page or error state. | SPEC doc committed. |
| BDD approval | Scenario coverage adequacy. Tag correctness. Gherkin format compliance. All SPEC §3 flows have at least one scenario. | All `.feature` files committed. |
| API coverage | Endpoint-to-feature mapping. No orphan endpoint (defined in OpenAPI but consumed by no feature). No phantom endpoint (consumed but not in OpenAPI). | Checklist checked off; issues documented if gaps found. |

---

## 6. Document Locations

| Artifact | Path |
|---|---|
| SPEC document | `docs/specs/spec-<module>.md` |
| BDD scenarios | `features/<module>/*.feature` |
| Constitution | `docs/CONSTITUTION.md` |
| Conventions | `docs/SPEC-CONVENTIONS.md` (this file) |
| Agent definitions | `.opencode/agents/*.md` |

---

*End of SPEC Conventions.*
