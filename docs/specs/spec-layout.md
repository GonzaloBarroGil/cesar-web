# SPEC — Layout

> **Feature:** Application shell, navigation, and context switching
> **Phase:** SPEC
> **Depends on:** Auth (role-based rendering, logout)
> **Status:** Draft — awaiting HITL validation
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Provide the persistent application shell that wraps all protected content:
sidebar navigation, header with consorcio selector and user menu, breadcrumbs,
and responsive layout. Layout is a **foundation feature** — every other
protected feature renders inside it.

### API Surface

Layout does not own API endpoints directly. It consumes:

| Endpoint | Feature | Used For |
|---|---|---|
| `GET /api/v1/consorcios` (missing — see backend concerns) | Consorcios | ConsorcioSelector dropdown |
| `GET /api/v1/auth/me` | Auth | User name/role display in UserMenu |
| `GET /api/v1/health` | Auth | HealthIndicator in footer |

The `GET /consorcios` gap means the `ConsorcioSelector` initially uses
`localStorage` to persist the last-selected consorcio ID until the backend
implements the list endpoint.

### User Roles

| Role | Visible Modules |
|---|---|
| **ADMIN** | Dashboard, Consorcios, Expenses, Invoices, Debt, Payments, Incomes/Outputs |
| **ACCOUNTANT** | Invoices only |

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| ≥ 768px (tablet/desktop) | Persistent sidebar, full header |
| < 768px (mobile) | Collapsed sidebar (hamburger toggle), compact header |

---

## 2. Pages

Layout provides no standalone pages — it wraps the route tree as a shell.

| Element | Location | Description |
|---|---|---|
| `AppShell` | Root of protected routes | Flex container: Sidebar + (Header + Content area) |
| `Sidebar` | Left edge | Module navigation links, role-filtered |
| `Header` | Top of content area | ConsorcioSelector + UserMenu |
| `Breadcrumbs` | Below header, above content | Current route path |

### Route Shell Structure

```
<AuthProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          {/* AppShell renders Sidebar + Header + <Outlet /> + Footer */}
          <Route index element={<Dashboard />} />
          <Route element={<RoleGuard role="ADMIN" />}>
            <Route path="/consorcios/*" element={<ConsorciosRoutes />} />
            <Route path="/expenses/*" element={<ExpensesRoutes />} />
            <Route path="/debt/*" element={<DebtRoutes />} />
            <Route path="/payments/*" element={<PaymentsRoutes />} />
            <Route path="/incomes/*" element={<IncomesRoutes />} />
          </Route>
          <Route element={<RoleGuard role={["ADMIN", "ACCOUNTANT"]} />}>
            <Route path="/invoices/*" element={<InvoicesRoutes />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

---

## 3. User Flows

### 3.1 App Shell Load

1. User is authenticated (auth guard passed).
2. `ConsorcioSelector` reads last-selected consorcio from `localStorage`.
3. If consorcio found: consorcio name displayed in selector.
4. If no consorcio found: _"Seleccionar consorcio"_ placeholder shown.
5. `HealthIndicator` fetches `/health` and renders dot.
6. `UserMenu` displays username and role from AuthContext.

### 3.2 Module Navigation

1. User clicks a sidebar link (e.g., "Expensas").
2. Route changes to `/expenses`.
3. Sidebar highlights active link.
4. Breadcrumb updates: `Inicio > Expensas`.
5. Content area renders the feature's route.
6. Link disabled if user lacks permission (ACCOUNTANT sees only "Facturación").

### 3.3 Consorcio Switching

1. User clicks `ConsorcioSelector` dropdown.
2. (Future) Dropdown shows list of consorcios from `GET /consorcios`.
3. (Current) Dropdown shows hardcoded list from MSW or localStorage.
4. User selects a consorcio.
5. Id stored in `localStorage` key `cesar_consorcio_id`.
6. All TanStack Query caches for consorcio-dependent data are invalidated.
7. Dashboard and list views refresh with new consorcio data.

### 3.4 User Menu

1. User clicks avatar/name in header.
2. Dropdown opens: _"Mi Perfil"_, _"Cerrar Sesión"_.
3. _"Cerrar Sesión"_ triggers logout flow (see `spec-auth` §3.5).
4. Menu closes on click outside or Escape key.

### 3.5 Responsive Sidebar

1. On mobile viewport (< 768px):
   - Sidebar is collapsed off-screen.
   - Hamburger icon visible in header.
2. User taps hamburger.
   - Sidebar slides in from left as overlay.
   - Backdrop behind sidebar; tapping backdrop closes.
3. User taps a nav link.
   - Sidebar closes, route changes.

### 3.6 Breadcrumb Navigation

1. `AppShell` reads current route from React Router.
2. Generates breadcrumb segments automatically from path.
3. Example: `/expenses/123` → `Inicio > Expensas > Detalle`.
4. Each segment is a link except the last (current page).
5. Deep dynamic segments (IDs) resolve to labels via context or derived from page title.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **AppShell** | Layout | `children` (via `<Outlet />`) | `ready` — full shell rendered. |
| **Sidebar** | Navigation | none | `desktop` — persistent, full width. `mobile-open` — overlay with backdrop. `mobile-closed` — hidden. |
| **SidebarLink** | Navigation item | `to`, `icon`, `label`, `roles?` | `active` — highlighted. `inactive` — normal. `disabled` — role mismatch, greyed out. |
| **Header** | Container | none | `desktop` — full header. `mobile` — compact with hamburger. |
| **ConsorcioSelector** | Dropdown | none | `idle` — shows current consorcio. `open` — dropdown expanded. `empty` — no consorcio selected (placeholder). `loading` — fetching list. |
| **UserMenu** | Dropdown | none | `idle` — shows avatar + name. `open` — menu expanded with options. |
| **Breadcrumbs** | Display | none (auto-generated from route) | `ready` — segments rendered. Single segment hidden (root path shows no breadcrumb). |
| **HealthIndicator** | Display | none | `online` — green dot. `degraded` — yellow dot. `offline` — red dot. `loading` — grey pulsing dot. (Defined in `spec-auth`, rendered here in footer.) |

### Component Tree

```
<AppShell>
  <Sidebar>
    <SidebarLink to="/" icon={Home} label="Inicio" roles={["ADMIN"]} />
    <SidebarLink to="/consorcios" icon={Building} label="Consorcios" roles={["ADMIN"]} />
    <SidebarLink to="/expenses" icon={Receipt} label="Expensas" roles={["ADMIN"]} />
    <SidebarLink to="/invoices" icon={FileText} label="Facturación" roles={["ADMIN", "ACCOUNTANT"]} />
    <SidebarLink to="/debt" icon={Scale} label="Deuda" roles={["ADMIN"]} />
    <SidebarLink to="/payments" icon={DollarSign} label="Pagos" roles={["ADMIN"]} />
    <SidebarLink to="/incomes" icon={TrendingUp} label="Ingresos/Egresos" roles={["ADMIN"]} />
  </Sidebar>
  <main>
    <Header>
      <HamburgerButton />  {/* mobile only */}
      <ConsorcioSelector />
      <UserMenu />
    </Header>
    <Breadcrumbs />
    <Outlet />             {/* feature content */}
    <footer>
      <HealthIndicator />
    </footer>
  </main>
</AppShell>
```

---

## 5. State Management

### ConsorcioContext

```typescript
interface ConsorcioState {
  selectedId: string | null;
  consorcios: ConsorcioListItem[];
  isLoading: boolean;
}
```

- `selectedId` persisted in `localStorage("cesar_consorcio_id")`.
- `consorcios` fetched via `useQuery(["consorcios"])` when `GET /consorcios` is available.
- Initially: hardcoded list from MSW fixture data.
- On consorcio switch: `queryClient.invalidateQueries()` for all consorcio-scoped queries.

### Sidebar State

```typescript
// Local state in AppShell
const [sidebarOpen, setSidebarOpen] = useState(false);
```

- Managed by `AppShell`. Not persisted.
- `true` → sidebar visible (always on desktop, toggle on mobile).
- Hamburger click → `setSidebarOpen(prev => !prev)`.
- Route change → `setSidebarOpen(false)` on mobile.

### Responsive Detection

```typescript
// Custom hook
function useMediaQuery(query: string): boolean;
```

- `useMediaQuery("(min-width: 768px)")` → determines desktop vs mobile.
- Used by `Sidebar` to choose overlay vs persistent mode.
- Used by `Header` to show/hide hamburger.

### Active Route

```typescript
// From React Router
const location = useLocation();
const isActive = (path: string) => location.pathname.startsWith(path);
```

- `SidebarLink` uses `isActive` to apply highlight style.
- `Breadcrumbs` uses `location.pathname` to generate segments.

### Breadcrumb Labels

```typescript
const breadcrumbLabels: Record<string, string> = {
  "": "Inicio",
  "consorcios": "Consorcios",
  "expenses": "Expensas",
  "invoices": "Facturación",
  "debt": "Deuda",
  "payments": "Pagos",
  "incomes": "Ingresos/Egresos",
};
```

- Static labels for top-level segments.
- Dynamic segments (UUIDs) resolve via page context (e.g., expense description
  or consorcio name from cache).

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Consorcio list fetch failed | `GET /consorcios` network error | Selector shows last known value with warning icon. Tooltip: _"No se pudo cargar la lista de consorcios."_ | ConsorcioSelector |
| Consorcio list empty | No consorcios for user | Selector shows _"Sin consorcios"_ disabled state. Dashboard shows empty state CTA: _"Cree su primer consorcio."_ | ConsorcioSelector + Dashboard |
| Health degraded | `/health` returns degraded | Yellow dot in footer. Tooltip: _"Algunos servicios están degradados."_ | HealthIndicator |
| Health offline | `/health` fails | Red dot in footer. Tooltip: _"Servicio no disponible."_ | HealthIndicator |
| Session expired (rendered in layout) | 401 from any API call | Toast from auth interceptor. Token cleared. Redirect to `/login`. | AppShell catches via AuthContext |

---

## 7. BDD Scenario Coverage

Estimated **12 scenarios** across one feature file (`features/layout/layout.feature`):

| # | Scenario | Tags |
|---|---|---|
| 1 | ADMIN sees all sidebar navigation links after login | `@happy-path` `@role-guard` |
| 2 | ACCOUNTANT sees only Facturación link in sidebar | `@happy-path` `@role-guard` |
| 3 | Clicking sidebar link navigates to correct module and highlights active link | `@happy-path` |
| 4 | Consorcio selector shows current consorcio after selection | `@happy-path` |
| 5 | Consorcio selector shows empty state when no consorcio selected | `@empty-state` |
| 6 | User menu displays username and role from session | `@display` |
| 7 | Logout from user menu clears session and redirects to login | `@happy-path` |
| 8 | Breadcrumbs show correct path for nested route | `@display` |
| 9 | Mobile sidebar toggles open and closed via hamburger | `@display` |
| 10 | Mobile sidebar closes after selecting a navigation link | `@display` |
| 11 | Health indicator shows green dot when all services are online | `@display` |
| 12 | Responsive layout switches between desktop sidebar and mobile overlay | `@display` |

---

## 8. API Coverage Checklist

Layout consumes no owned endpoints. It depends on:

- [ ] `GET /api/v1/consorcios` — consumed by `ConsorcioSelector` (missing from spec — see backend concerns §2)
- [ ] `GET /api/v1/auth/me` — consumed indirectly via `AuthContext.user` for UserMenu display
- [ ] `GET /api/v1/health` — consumed by `HealthIndicator` (imported from auth feature, rendered in footer)
- [ ] No new MSW handlers needed — layout uses auth's MSW handlers and consorcios' fixture data
- [ ] No new orval generation needed — layout imports generated hooks from auth and consorcios modules

### Cross-Feature Dependencies

| Dependency | Imported From | Used By |
|---|---|---|
| `AuthContext` | `features/auth` | `AppShell`, `UserMenu`, `SidebarLink` (role check) |
| `HealthIndicator` | `features/auth` | `AppShell` footer |
| `useConsorcios()` | `features/consorcios` | `ConsorcioSelector` (when endpoint exists) |

These cross-feature imports comply with ADR-002: auth components are in
`src/components/shared/` when imported by layout.

---

*End of SPEC — Layout.*
