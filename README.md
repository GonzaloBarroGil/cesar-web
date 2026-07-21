# CESAR Web — Consorcio Expense & Service Administration Runtime

React/Vite SPA for Argentine consorcio management.
Consumes the [CESAR REST API](../cesar) via type-safe TanStack Query hooks generated from OpenAPI.

## Quick Start

```bash
# Prerequisites: Node 20+, npm

npm install

# Sync OpenAPI spec from cesar repo
bash scripts/sync-oas.sh

# Generate API types + hooks
npm run gen:api

# Start dev server (MSW intercepts API calls)
npm run dev
# → http://localhost:5173
```

## Commands

| Command | What |
|---|---|
| `npm run dev` | Vite dev server with MSW |
| `npm run build` | TypeScript check + Vite production build |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E + a11y (requires vite dev server) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome lint |
| `npm run format` | Biome format |
| `npm run gen:api` | Orval codegen from `api/openapi.yaml` |
| `npm run license-check` | License audit CSV |

## Modules

| Feature | Route | Purpose |
|---|---|---|
| **auth** | `/login` | Role-based login (ADMIN, ACCOUNTANT), session, health indicator |
| **layout** | — | App shell, sidebar, breadcrumbs, consorcio selector |
| **consorcios** | `/consorcios` | Legal entities, UF, propietarios, fiscal periods |
| **expenses** | `/expenses` | Categories, concepts, providers, approval flow |
| **invoices** | `/invoices` | Factura A/B/C, Nota Crédito/Débito, Recibos |
| **debt** | `/debt` | Liquidaciones, certificados de deuda, financial summaries |
| **payments** | `/payments` | Payment registry, reversal, unit balance, history |
| **incomes-outputs** | `/incomes-outputs` | Cash-flow entries, period summaries |
| **dashboard** | `/` | Metric grid: debt, collection rate, pending, activity |

## Architecture

```
src/
├── api/           # OpenAPI spec (gitignored copy from cesar) + generated hooks
├── components/    # Shared UI primitives (ui/, shared/)
├── features/      # Feature modules (auth, consorcios, expenses, …)
│   └── __tests__/ # Vitest unit tests + Playwright E2E + a11y specs
├── mocks/         # MSW handlers + fixtures (API mocking in dev/test)
├── hooks/         # Shared hooks
├── lib/           # Utilities (cn, formatters)
└── router/        # Route config
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 6 |
| Language | TypeScript 5 |
| Routing | React Router 7 |
| Data fetching | TanStack Query 5 |
| Tables | TanStack Table 8 |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 + `cva` + `clsx` |
| UI primitives | Radix UI (dialog, select, dropdown, toast, tooltip) |
| Icons | Lucide React |
| API client | Axios (type-safe via Orval) |
| API spec | Orval 7 from OpenAPI 3.1 |
| Mocking (dev/test) | MSW 2 |
| Unit tests | Vitest + Testing Library |
| E2E + a11y | Playwright + `@axe-core/playwright` |
| Lint + format | Biome |

## Testing

- **Vitest**: 88 test files, 584 tests — run `npm run test`
- **Playwright**: 121 E2E scenarios across 11 spec files — run `npm run test:e2e`
- **A11y**: WCAG 2.1 AA audits per route via `@axe-core/playwright`

## License

AGPL-3.0. See [LICENSE](./LICENSE).

## Ecosystem

This project is part of the [CESAR Ecosystem](../cesar-orchestration). See the
[ecosystem CONSTITUTION](../cesar-orchestration/CONSTITUTION.md) for
cross-project governance, sequencing rules, and quality gates.
