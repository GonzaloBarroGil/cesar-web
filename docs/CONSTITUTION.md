# CONSTITUTION — CESAR Web

> **CESAR Web**: React/TypeScript SPA for Argentine condominium administration
>
> Governance document. All downstream artifacts (SPEC, PLAN, TASKS, code) must conform.
>
> **Status: APPROVED (2026-06-25)**
> **Phase: CONSTITUTION. Next → SPEC.**

---

## 1. Project Identity

| | |
|---|---|
| **Codename** | CESAR Web (cesar-web) |
| **Domain** | Web UI for Argentine Horizontal Property administration (CCC Arts. 2037-2072 + CABA regulations) |
| **Backend** | CESAR Rust/Axum REST API (consumed via OpenAPI 3.1 contract) |
| **Target Users** | Consorcio administrators (ADMIN), accountants (ACCOUNTANT), owners/tenants (propietarios, read-only) |
| **Deployment** | Static SPA served behind Nginx/CDN, connecting to CESAR backend |
| **License** | AGPL-3.0-or-later (application) + MIT (shared libraries) |
| **Methodology** | Contract-First Frontend Development (CFFD) — SDD variant for externally-owned API contracts |
| **Ecosystem** | `../cesar-orchestration/CONSTITUTION.md` — ecosystem-level governance |

---

## 2. Core Principles

CESAR's backend principles (P1-P8) are adapted for the frontend. Principles marked
with ▸ are frontend-specific additions.

### P1 — Contract First ▸

The OpenAPI 3.1 specification is the single source of truth for all API types. No
frontend code before a corresponding endpoint exists in the spec. TypeScript types
are generated from the spec via orval — never hand-written. When the spec changes,
`orval` regenerates, and TypeScript compilation surfaces every affected call site.

### P2 — BDD/TDD Woven

Adopted verbatim from CESAR P2. Each user flow maps to BDD Gherkin scenarios. Each
scenario maps to Playwright E2E tests. Components have Vitest unit tests. Red-Green-Refactor
at all layers.

### P3 — Immutable Audit

Not applicable to frontend (audit is a backend concern). The frontend displays
audit data (hash chains, version history) but does not produce it.

### P4 — Idempotency Everywhere ▸

Adopted from CESAR P4. Every mutation request includes a UUID v7 `Idempotency-Key`
header, generated client-side by the axios interceptor. MSW handlers simulate
24-hour TTL deduplication.

### P5 — Strict Typing ▸

TypeScript strict mode with `noUncheckedIndexedAccess`. No `any` types. No `as`
casts without documented justification. All API response data validated by Zod
schemas before entering component state. Discriminated unions for all multi-state
entities (loading | ready | error). The type system is the first line of defense
against specification drift.

### P6 — Open Telemetry

Frontend observability via `@opentelemetry/web`: page load metrics, API call
latency, user interaction traces. Exported via OTLP to the same observability
stack as CESAR backend (Grafana Tempo + Prometheus + Loki).

### P7 — Open Source First ▸

Adopted from CESAR P7 for the npm ecosystem. Every dependency must have an
OSS-compatible license (MIT, Apache 2.0, BSD, ISC pre-approved). GPL/AGPL
copyleft dependencies require explicit review. Tooling: CI license-checker step.

### P8 — Subagent-Ready

Adopted from CESAR P8. Each bounded context is independently testable,
documentable, and assignable to a subagent. No implicit cross-module coupling.
Roster reduced to 4 agents (see §3.3 and §9) for 1-2 developer scale.

### P9 — Compile-Time Contract Boundary ▸

The OpenAPI contract is enforced at compile time, not runtime. The pipeline
`OpenAPI → orval → TypeScript types → MSW handlers` ensures that any backend
spec change that breaks the frontend is a build failure, not a production
surprise. See ADR-1.

### P10 — Single Source of Server State ▸

TanStack Query is the sole manager of all server-derived data. Components read
via `useQuery`, write via `useMutation`. No manual `useState`/`useEffect` for
API data fetching, caching, or synchronization. Cache invalidation is handled
by TanStack Query mutation hooks, not by component-level refetch logic.

### P11 — Spanish-First Accessibility ▸

All UI labels, messages, and error text are in Spanish (es-AR locale). All
interactive elements meet WCAG 2.1 AA. Accessibility is not optional — it is a
primary quality gate (G6) and a first-class deliverable of the quality-engineer
agent.

---

## 3. Domain Boundaries

The frontend mirrors CESAR's bounded contexts, one feature directory per module:

| Feature | Purpose | Key API Module |
|---|---|---|
| **auth** | Login, logout, JWT management, role extraction | CESAR Auth (3 endpoints) |
| **consorcios** | Consorcio CRUD, UF configuration, propietario management, fiscal periods | CESAR Consorcio (10 endpoints) |
| **expenses** | Expense CRUD, approval workflow, providers, concepts, categories | CESAR Expenses (15 endpoints) |
| **invoices** | Factura A/B/C, Notas de Crédito/Débito, Recibos, annul flows | CESAR Invoices (12 endpoints) |
| **debt** | Liquidacion generation, certificados de deuda, signing | CESAR Debt (9 endpoints) |
| **payments** | Payment registration, reversal, unit balance, history | CESAR Payments (6 endpoints) |
| **incomes-outputs** | Cash-flow entries, period and cross-period summaries | CESAR Incomes/Outputs (6 endpoints) |
| **dashboard** | Key metrics per consorcio (debt, collection rate, pending approvals) | Client-side aggregation from multiple queries |
| **layout** | AppShell, Sidebar, Header, ConsorcioSelector, role-based navigation | N/A (UI-only) |

---

## 4. Architecture Decision Log

### ADR-001: OpenAPI as Compile-Time Contract Boundary

- **Decision**: All API types are generated from CESAR's `api/openapi.yaml` via `orval`. TypeScript compilation enforces contract compliance. No hand-written API fetch calls.
- **Rationale**: Backend owns the spec. Runtime contract divergence is avoided entirely by making it a compile-time error. When CESAR changes the spec, `orval` regenerates, and `tsc` enumerates every affected file.
- **Owner**: contract-guardian maintains the pipeline.

### ADR-002: Feature-Based Directory Structure with Import Restrictions

- **Decision**: `src/features/<module>/` per bounded context. Cross-feature imports only allowed through `src/components/shared/` (UI primitives) and `src/lib/` (pure logic). No direct sibling-feature imports.
- **Rationale**: Prevents sinkhole components and accidental coupling. Mirrors CESAR's schema-level separation (ADR-002 in backend). Enforced by ESLint import/no-restricted-paths (to be configured in Phase 0 configuration step).
- **Owner**: feature-developer must comply; quality-engineer tests verify import boundaries.

### ADR-003: JWT in Memory + HttpOnly Cookie Fallback

- **Decision**: JWT token held in React context during the session. On page refresh, `/api/v1/auth/me` validates the persisted token. If BFF layer is introduced later (post-Phase 2), migrate to HttpOnly session cookie managed by the BFF.
- **Rationale**: Matches CESAR's JWT Bearer auth model (24-hour TTL, HS256). Memory storage avoids localStorage XSS exposure. The BFF migration path is kept open (see cesar-orchestration/cesar-web-feasibility.md §9.3).
- **Owner**: feature-developer implements auth context; contract-guardian configures the axios JWT interceptor.

### ADR-004: Idempotency Keys Generated Client-Side

- **Decision**: Every mutation request carries a UUID v7 `Idempotency-Key` header. Generated by the axios interceptor, not by individual form components.
- **Rationale**: CESAR requires idempotency keys on all mutation endpoints. Client-side generation avoids round-trips and is compatible with MSW simulation. UUID v7 is time-sortable for debugging.
- **Owner**: contract-guardian configures the interceptor.

### ADR-005: Spanish-First UI with i18n

- **Decision**: All labels, messages, placeholders, error text, and ARIA attributes are in Spanish (es-AR). i18n keys are organized by module. `react-i18next` provides the framework.
- **Rationale**: Argentine administrators and owners are the primary audience. Spanish is the national language of Argentina. i18n infrastructure is built from day one to support future locales (English, Portuguese) without refactoring.
- **Owner**: feature-developer writes Spanish labels; quality-engineer tests locale rendering.

### ADR-006: TanStack Query as Single Source of Server State

- **Decision**: All server-derived state flows through TanStack Query. Components read via `useQuery`, write via `useMutation`. No component-level `useState`/`useEffect` for API data.
- **Rationale**: Eliminates shadow state, stale UI, and double-fetching. TanStack Query's cache invalidation on mutation completion ensures data consistency without manual synchronization logic. Mirrors CESAR's single-source-of-truth approach at the persistence layer.
- **Owner**: feature-developer must comply; quality-engineer tests for shadow state violations.

### ADR-007: 4-Agent Roster (vs CESAR's 8)

- **Decision**: Frontend operates with 4 agents: constitution-architect, contract-guardian, feature-developer, quality-engineer. Four backend-only agents are eliminated (domain-modeler, api-contract-designer, spec-author, legal-compliance-checker). Two are merged (bdd-scenario-writer + test-engineer → quality-engineer; rust-developer → feature-developer). One is new (contract-guardian, frontend-specific).
- **Rationale**: Detailed in SDD methodology §3.2. The OpenAPI contract eliminates domain modeling and API contract authoring. Frontend specs are simpler (page flows, not legal invariants). Accessibility is elevated within quality-engineer rather than a separate auditor agent.
- **Owner**: constitution-architect defines agent scopes.

### ADR-008: Ecosystem Governance Integration

- **Decision**: Defer cross-project coordination to the ecosystem constitution (`../cesar-orchestration/CONSTITUTION.md`). This constitution governs all project-internal matters (ADR-001 through ADR-007, unchanged).
- **Rationale**: The ecosystem layer provides a neutral authority for cross-project sequencing and contract coordination. Previously §11 deferred cross-project disputes to cesar's constitution; the ecosystem constitution is a more appropriate and explicit authority. All internal architectural decisions (openapi pipeline, feature directories, auth model, idempotency, i18n, TanStack Query, agent roster) remain valid and unaffected.
- **Date**: 2026-07-13

---

## 5. Technology Stack

### Frontend

| Component | Choice | Rationale |
|---|---|---|
| **Build tool** | Vite 6 | Fast HMR, standard for React SPAs |
| **Language** | TypeScript 5.5+ (strict mode) | Compile-time contract enforcement, matches CESAR's type safety philosophy |
| **UI framework** | React 19 | Chosen by project stakeholders |
| **API client gen** | orval | Generates typed TanStack Query hooks from OpenAPI 3.1 |
| **Server state** | TanStack Query 5 | Caching, refetch, optimistic updates, cache invalidation |
| **Routing** | React Router 7 | Layout routes, loaders, role-based guards |
| **UI components** | shadcn/ui + Tailwind CSS 4 | Accessible Radix primitives, themeable, copy-paste |
| **Forms** | React Hook Form + Zod | Typed validators matching CESAR's validation layer |
| **Mock server** | MSW 2 | Network-level interception, typed handlers |
| **Tables** | TanStack Table 8 | Sorting, filtering, pagination (matches CESAR's limit/offset) |
| **I18n** | react-i18next | Spanish primary, module-organized keys |
| **HTTP client** | axios | JWT interceptor, idempotency key injection |
| **Icons** | lucide-react | MIT-licensed, tree-shakeable |

### Testing

| Layer | Tool |
|---|---|
| **BDD** | Gherkin `.feature` files + Playwright + Cucumber.js |
| **Component** | Vitest + Testing Library |
| **E2E** | Playwright against MSW |
| **Accessibility** | axe-core + Playwright a11y assertions |
| **Contract** | TypeScript compilation (orval-generated types) |

### Tooling

| Component | Choice |
|---|---|
| **Linting** | Biome (replaces ESLint + Prettier) |
| **License check** | license-report (CI step) |
| **Package manager** | npm (project choice) |

---

## 6. Development Workflow (CFFD + HITL Gates)

```
◉ HITL GATE
    │
    ▼
METHODOLOGY (cesar-web-sdd-methodology.md)
    │
    ▼
◉ HITL GATE — Approved
    │
    ▼
CONSTITUTION (this doc)
    ├── constitution-architect → docs/CONSTITUTION.md
    ├── agent definitions → .opencode/agents/*.md
    └── project rules → .opencode/opencode.json
    │
    ▼
◉ HITL GATE — Approved
    │
    ▼
CONTRACT SETUP (subagent: contract-guardian)
    ├── orval config → orval.config.ts
    ├── Generate types → src/api/generated/
    ├── MSW handlers → src/mocks/handlers/
    ├── Zod schemas → src/api/generated/schemas/
    └── Fixture data → src/mocks/fixtures/
    │
    ▼
◉ HITL GATE — Contract boundary verified
    │
    ▼
SPEC per feature
    ├── feature-developer → page flows, component trees, form specs
    ├── quality-engineer → BDD .feature files per module
    └── contract-guardian → verify API coverage
    │
    ▼
◉ HITL GATE — Approved per feature
    │
    ▼
PLAN
    ├── Task decomposition
    ├── Dependency graph (parallel features where possible)
    └── Agent assignment
    │
    ▼
◉ HITL GATE — Approved
    │
    ▼
TASKS (per task, assigned agent executes)
    ├── 1. quality-engineer: Write failing BDD scenario
    ├── 2. quality-engineer: Write failing component test
    ├── 3. feature-developer: Implement → tests green
    ├── 4. feature-developer: Refactor
    ├── 5. quality-engineer: E2E test passes
    ├── 6. quality-engineer: axe-core a11y audit
    ├── 7. feature-developer: Fix a11y findings
    └── 8. quality-engineer: Re-audit → clean → feature complete
    │
    ▼
◉ HITL GATE — Approved per task group
    │
    ▼
VALIDATION
    ├── All BDD scenarios pass
    ├── All component tests pass
    ├── All E2E flows pass
    ├── All routes pass WCAG 2.1 AA audit
    ├── TypeScript compilation clean
    ├── License check clean
    └── Contract fidelity verified (all endpoints covered)
```

**Rule**: Every HITL gate is mandatory. No skipping, no fast-tracking. The gate
must be explicitly acknowledged before proceeding.

---

## 7. Quality Gates

| Gate | Criteria | Owner |
|---|---|---|
| **G1 — Type Safety** | `tsc --noEmit` passes with `strict: true`. Zero `any` types in production code. Zero `as` casts without documented justification. | contract-guardian + feature-developer |
| **G2 — Contract Compliance** | All MSW handlers match OpenAPI schemas. All API hooks are orval-generated (no hand-written fetch). Every endpoint has a Zod schema. | contract-guardian |
| **G3 — BDD Coverage** | Every feature module has `.feature` files covering: CRUD happy path, validation sad paths, empty/loading/error states, optimistic updates, confirmation dialogs, role-based access. | quality-engineer |
| **G4 — Component Tests** | Every shared component (`src/components/shared/`) has a Vitest test. Every form component has validation tests (empty submit, invalid field, valid submit). | quality-engineer |
| **G5 — E2E Coverage** | Critical cross-module workflow passes: login → consorcio → expense → liquidacion → payment. Module happy paths pass. Role-based access enforced. | quality-engineer |
| **G6 — Accessibility** | Every route passes axe-core WCAG 2.1 AA checks. All forms have keyboard navigation. All dynamic content changes have `aria-live` announcements. All validation errors have `aria-describedby`. | quality-engineer |
| **G7 — Open Source** | `npm ls` dependency tree contains zero proprietary or non-approved copyleft licenses. CI check via `license-report`. | contract-guardian (automated CI) |
| **G8 — Anti-Pattern Free** | Code review confirms: no shadow state, no cross-feature imports, no hand-written API calls. ESLint/Biome rules enforce boundaries. | feature-developer + quality-engineer (code review) |

---

## 8. Git Rules

Three-tier model. All agents must comply. Enforcement is via `.opencode/opencode.json`
permission rules and agent `.md` instruction blocks.

### Tier 1 — AI-Allowed (informative, no side effects)

Agents may freely execute without HITL approval:

```
git status, git log, git diff, git show, git blame,
git stash list, git tag -l, git remote -v, git branch, git branch -a
```

### Tier 2 — Ask-Before (low-risk, reversible, requires explicit permission)

Agents must ask the HITL before executing. Once approved, may proceed:

```
git branch {name}, git branch -m {new}, git branch -d {name},
git stash, git stash pop, git stash drop, git checkout -- {file}
```

### Tier 3 — HITL-Only (history-modifying or remote-affecting)

Only a human may execute. Agents must never invoke:

```
git commit, git reset, git revert, git rebase, git merge, git cherry-pick,
git push, git fetch, git pull, git remote add/remove, git tag -a,
git checkout {branch}, git init, git clone
```

---

## 9. Agent Roster

Four agents defined in `.opencode/agents/`. Each owns a specific responsibility
in the CFFD pipeline:

| Agent | Role | Input | Output |
|---|---|---|---|
| **constitution-architect** | Defines governance + ADRs | Methodology doc + CESAR CONSTITUTION + analysis documents | `docs/CONSTITUTION.md`, `.opencode/opencode.json` rules, agent scope definitions |
| **contract-guardian** | Manages OpenAPI → orval → MSW pipeline | `../cesar/api/openapi.yaml` | `src/api/generated/` (types + hooks), `src/mocks/handlers/` (MSW), `src/mocks/fixtures/`, Zod schemas |
| **feature-developer** | Implements pages, components, hooks, forms | orval-generated types + BDD scenarios + UI specs | `src/features/<module>/`, `src/components/`, `src/hooks/`, `src/router/` |
| **quality-engineer** | All test layers + BDD + accessibility | Feature code + OpenAPI contract + BDD scenarios | Vitest tests, Playwright E2E, `.feature` files, a11y audit reports |

### Agent Scope Boundaries

| Boundary | Rule |
|---|---|
| Contract fidelity | Only `contract-guardian` runs orval, writes MSW handlers, or modifies `src/api/generated/` |
| API consumption | Only `feature-developer` and `quality-engineer` import from `src/api/generated/` |
| Test authoring | Only `quality-engineer` writes test files (`.test.tsx`, `.feature`, `.spec.ts`) |
| Code authoring | Only `feature-developer` writes implementation code (`src/features/`, `src/components/`, `src/hooks/`) |
| Governance | Only `constitution-architect` modifies `docs/CONSTITUTION.md`, `.opencode/agents/`, or `.opencode/opencode.json` |
| Git mutations | Tier 2: ask-before. Tier 3: HITL-only. | All agents |

---

## 10. Anti-Pattern Catalog

The five anti-patterns defined in the SDD methodology (§5.4) are enforced by
this constitution. Every agent must prevent them.

### AP-1: Specification Drift

**Definition**: Frontend code that diverges from the OpenAPI contract — using
fields or types not defined in the spec.

**Prevention**: Compile-time enforcement via orval pipeline. `contract-guardian`
regenerates types on spec changes. TypeScript compilation fails on any mismatch.

**Violation pattern**: Any import from a non-generated source that constructs
an API request or parses an API response outside of orval-generated hooks.

### AP-2: Semantic Drift

**Definition**: Fields used correctly by type but interpreted incorrectly in
the UI. Example: displaying `amount` in pesos when the spec specifies cents.

**Prevention**: BDD scenarios assert display values. Zod schemas use `.describe()`
to document semantics. MSW fixture data uses specific values that BDD scenarios
test against.

**Violation pattern**: Any unit conversion (cents → pesos, YYYYMM → display date)
that differs from the convention documented in the Zod schema.

### AP-3: Moving the Goalposts

**Definition**: Requirements change mid-implementation without the OpenAPI spec
being updated first.

**Prevention**: Process gate. No frontend task starts for a feature requiring
API changes unless the OpenAPI spec already reflects those changes.
`constitution-architect` enforces this in task decomposition.

**Violation pattern**: A task marked "in progress" that depends on an API field
or endpoint not present in the current `api/openapi.yaml`.

### AP-4: Shadow State

**Definition**: Duplicating server state in local `useState`/`useEffect` when
TanStack Query already manages it.

**Prevention**: Architectural rule. TanStack Query is the single source of
server state (P10). Code review and linting flag violations.

**Violation pattern**: `useState(data)` initialized from `useQuery().data` or
`useEffect(() => setState(response), [])` wrapping a fetch call.

### AP-5: Sinkhole Components

**Definition**: Components that import from sibling features, creating hidden
coupling that defeats the feature-based architecture.

**Prevention**: Import boundary enforcement via ESLint `import/no-restricted-paths`.
Cross-feature composition happens at the router level.

**Violation pattern**: `import { ... } from '../consorcios/...'` in an expenses
component. Valid cross-feature imports must go through `components/shared/` or `lib/`.

---

## 11. Constitution Governance

### Amendment Process

1. Proposed amendment is documented in an ADR (new or updated)
2. Amendment is reviewed by HITL
3. If approved, `constitution-architect` updates `docs/CONSTITUTION.md`
4. All agents are notified of the change
5. Affected artifacts are updated accordingly

### Supersession

This document supersedes:
- `../cesar-orchestration/cesar-web-sdd-methodology.md` — incorporated as governance rules (§10) and agent roster (§9)
- `../cesar-orchestration/cesar-web-feasibility.md` — incorporated as tech stack (§5) and ADRs (§4)

The analysis documents remain as historical analysis artifacts. This
constitution is the active governance document for project-internal implementation phases.

### Ecosystem Governance

This project is part of the CESAR ecosystem. `../cesar-orchestration/CONSTITUTION.md` is the ecosystem-level governance authority.

It supersedes this constitution on matters of:
- **Sequencing**: which features are worked on and in what order relative to cesar
- **Contract coordination**: how `api/openapi.yaml` is shared, validated, and kept compatible
- **Cross-project quality gates**: integration readiness, BDD traceability, contract compatibility

This constitution remains the authority for all project-internal matters (component structure, TypeScript configuration, test methodology, design patterns).

### Amendment Cascade

When the ecosystem constitution is amended, this constitution may require corresponding updates. Such amendments follow the normal amendment process via ADRs.

### Relationship to CESAR Backend CONSTITUTION

This constitution is a **derived** governance document. It inherits CESAR's
P1-P8 principles where applicable, adapts them for the frontend, and adds
frontend-specific principles (P9-P11). The CESAR `docs/CONSTITUTION.md`
remains the authority for backend decisions. Where a decision affects both
projects (e.g., OpenAPI spec ownership, auth model, licensing), the
ecosystem constitution (`../cesar-orchestration/CONSTITUTION.md`) is the authority.

---

*End of CONSTITUTION.*
