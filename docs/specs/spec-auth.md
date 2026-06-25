# SPEC — Auth

> **Feature:** Authentication and session management
> **Phase:** SPEC
> **Status:** Approved (2026-06-25)
> **Next:** BDD scenarios → API coverage → PLAN

---

## 1. Feature Overview

### Purpose

Provide secure login, session management, and role-based access control for all
users of the CESAR web application. Auth is a **foundation feature** — all other
features depend on it for identity and authorization.

### API Surface

| Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|
| `/api/v1/auth/login` | POST | No | Exchange username/password for JWT |
| `/api/v1/auth/me` | GET | Yes | Validate token and return current user |
| `/api/v1/health` | GET | No | Health check (PG + Redis + NATS) |

### Auth Model

- **Scheme**: JWT Bearer (HS256), 24-hour TTL
- **Payload**: `sub` (UUID), `username`, `role` (ADMIN | ACCOUNTANT), `consorcio_id` (optional), `exp`, `iat`, `jti`
- **Token storage**: `sessionStorage` (cleared on tab close)
- **Validation**: On every page load, `AuthProvider` calls `/me`. On 401, redirects to `/login`.
- **Interceptor**: Axios request interceptor injects `Authorization: Bearer <token>` and `Idempotency-Key: <uuidv7>`. Response interceptor catches 401 → clears token → redirects to `/login`.

### User Roles

| Role | Access |
|---|---|
| **ADMIN** | Full access to all features |
| **ACCOUNTANT** | Access to invoices only; all other routes forbidden |

---

## 2. Pages

| Page | Route | Auth | Description |
|---|---|---|---|
| `LoginPage` | `/login` | None | Username/password form. Redirects to `/` if already authenticated. |
| `HealthIndicator` | Rendered in layout shell (`<footer>`) | None | Minimal dot indicator. Data fetched from `GET /health` by `AuthProvider` on mount. |

---

## 3. User Flows

### 3.1 Login — Happy Path

1. User navigates to `/login`.
2. `AuthProvider` checks `sessionStorage` for token. If none, stays on `/login`.
3. User enters username and password.
4. User submits form.
5. Form enters **submitting** state (button disabled, spinner).
6. `POST /api/v1/auth/login` succeeds (200).
7. Token stored in `sessionStorage`.
8. `AuthContext` updates: `isAuthenticated: true`, `user`, `token`.
9. User redirected to original URL (default `/`).

### 3.2 Login — Invalid Credentials

1. User submits form with wrong username/password.
2. `POST /api/v1/auth/login` returns 401.
3. Form exits submitting state.
4. Inline error message displayed below form: _"Credenciales inválidas. Verifique usuario y contraseña."_
5. Form remains filled (username preserved, password cleared).

### 3.3 Login — Network Error

1. User submits form.
2. Network request fails (no response).
3. Toast notification: _"Error de conexión. Intente nuevamente."_ with retry button.
4. Form exits submitting state.

### 3.4 Session Restore (Page Refresh)

1. User refreshes page or opens new tab.
2. `AuthProvider` mounts, reads token from `sessionStorage`.
3. `AuthProvider` enters **initializing** state.
4. `GET /api/v1/auth/me` is called with stored token.
5. If 200: `AuthContext` populated. `isAuthenticated: true`. **initializing → authenticated**.
6. If 401: Token expired or invalid. Token cleared from `sessionStorage`. `isAuthenticated: false`. **initializing → unauthenticated**. Redirect to `/login`.
7. If network error: Retry once. If still fails, show toast: _"No se pudo verificar la sesión."_ with manual login link.

### 3.5 Logout

1. User clicks logout button (in layout header).
2. Token removed from `sessionStorage`.
3. `AuthContext` reset: `isAuthenticated: false`, `user: null`, `token: null`.
4. All TanStack Query caches cleared.
5. Redirect to `/login`.

### 3.6 Expired Token Mid-Session

1. User is authenticated and active.
2. Any API call returns 401 (token expired while tab open).
3. Axios response interceptor catches 401.
4. Token cleared from `sessionStorage`.
5. `AuthContext` reset.
6. TanStack Query caches cleared.
7. Redirect to `/login`.

### 3.7 Role Extraction

1. On login or `/me` success, JWT payload is decoded.
2. `role` field extracted: `ADMIN` or `ACCOUNTANT`.
3. Stored in `AuthContext.user.role`.
4. Used by `RoleGuard` and sidebar navigation to enforce access.

### 3.8 Unauthorized Redirect with URL Restoration

1. Unauthenticated user navigates to `/expenses`.
2. `AuthGuard` detects no token → redirects to `/login?redirect=/expenses`.
3. After successful login, user is redirected to `/expenses`.
4. If no `redirect` param, default to `/`.

### 3.9 Role-Guarded Route

1. ACCOUNTANT user navigates to `/consorcios`.
2. `RoleGuard` checks `user.role !== "ADMIN"`.
3. Redirects to `/invoices` (accountant's permitted area).
4. No redirect param — accountant's home is `/invoices`.

---

## 4. Component Catalog

| Component | Type | Props | States |
|---|---|---|---|
| **LoginForm** | Form | none | `idle` — form displayed, empty. `submitting` — button disabled, spinner. `error` — inline error message below form. |
| **AuthProvider** | Context | `children` | `initializing` — loading spinner or skeleton. `authenticated` — children rendered. `unauthenticated` — redirect to login. |
| **AuthGuard** | Route wrapper | `children` | `loading` — while `/me` resolves. `redirecting` — unauthenticated → navigate to `/login`. `authorized` — children rendered. |
| **RoleGuard** | Route wrapper | `children`, `role: string | string[]` | `loading` — while user loads. `authorized` — role matches → children rendered. `forbidden` — role mismatch → redirect. |
| **HealthIndicator** | Display | `consorcio_id?` | `online` — green dot. `degraded` — yellow dot. `offline` — red dot. `loading` — grey pulsing dot. |

### Component Hierarchy

```
<AuthProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          {/* AppShell renders <HealthIndicator /> in footer */}
          <Route element={<RoleGuard role="ADMIN" />}>
            {/* ADMIN-only routes */}
          </Route>
          <Route element={<RoleGuard role={["ADMIN", "ACCOUNTANT"]} />}>
            {/* Shared routes */}
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

`AuthGuard` wraps all protected routes. `RoleGuard` wraps role-specific route
groups. `AppShell` is defined in `spec-layout.md` but referenced here for
`HealthIndicator` placement. The layout spec will import `<HealthIndicator />`
from the auth feature.

---

## 5. State Management

### AuthContext Shape

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    username: string;
    role: "ADMIN" | "ACCOUNTANT";
    consorcio_id: string | null;
    nombre_completo: string;
  } | null;
  token: string | null;
}
```

### Data Flow

```
sessionStorage("cesar_token")
        │
        ▼
AuthProvider mount → GET /me
        │
    ┌───┼───┐
   200  401  NETWORK
    │    │      │
    ▼    ▼      ▼
  auth  unauth  retry → toast
        │
        ▼
  Token stored → axios interceptor request
        │
        ├── Authorization: Bearer <token>
        ├── Idempotency-Key: <uuidv7>  (on POST/PUT/PATCH/DELETE)
        │
        ▼
  Any API call
        │
        ▼
  axios interceptor response
        │
    ┌───┼───┐
   2xx  401  OTHER
    │    │      │
    ▼    ▼      ▼
  return  clear  reject
  data   token  (caller
         redir  handles)
         /login
```

### Axios Interceptor Behavior

**Request interceptor:**
1. Read token from `sessionStorage("cesar_token")`.
2. If token exists, set `Authorization: Bearer <token>` header.
3. If method is POST/PUT/PATCH/DELETE, generate UUID v7 and set `Idempotency-Key` header.

**Response interceptor:**
1. If response is 2xx, return response.
2. If response is 401:
   - Remove token from `sessionStorage`.
   - Clear all TanStack Query caches via `queryClient.clear()`.
   - Redirect to `/login`.
3. All other errors: reject with error (caller handles display).

### TanStack Query Hooks

| Hook | Endpoint | Key |
|---|---|---|
| `useLogin()` | `POST /api/v1/auth/login` | Mutation: `auth.login` |
| `useMe()` | `GET /api/v1/auth/me` | Query: `["auth", "me"]`, `enabled: !!token`, `retry: 1` |
| `useHealth()` | `GET /api/v1/health` | Query: `["health"]`, `refetchInterval: 30000` (30s polling) |

`useMe()` is called by `AuthProvider` on mount. `useHealth()` is called by
`HealthIndicator` with 30-second polling for the status dot. `useLogin()` is
called by `LoginForm` on submit.

---

## 6. Error States

| Error | Trigger | UI Response | Component |
|---|---|---|---|
| Invalid credentials | 401 from `/login` | Inline error: _"Credenciales inválidas. Verifique usuario y contraseña."_ Password field cleared, username preserved. | `LoginForm` |
| Network failure (login) | Fetch timeout or no response | Toast: _"Error de conexión. Intente nuevamente."_ with retry button. | `LoginForm` |
| Session validation failed | 401 from `/me` on mount | Token cleared, redirect to `/login`. No message (silent, token expired). | `AuthProvider` |
| Session validation network error | Fetch failure on `/me` | Retry once. If still fails, toast: _"No se pudo verificar la sesión. Inicie sesión nuevamente."_ with manual login link. | `AuthProvider` |
| Token expired mid-session | 401 from any API call | Token cleared, cache cleared, redirect to `/login`. Toast: _"Su sesión ha expirado. Inicie sesión nuevamente."_ | Axios interceptor |
| Forbidden route | ACCOUNTANT accessing ADMIN route | Redirect to `/invoices`. No toast (prevents confusion — user sees their allowed area). | `RoleGuard` |
| Unauthenticated access | No token, accessing protected route | Redirect to `/login?redirect=<original>`. After login → restore URL. | `AuthGuard` |
| Health check failed | `/health` returns degraded or error | Dot indicator changes color. Tooltip on hover: _"Servicio degradado"_ or _"Servicio no disponible"_ . | `HealthIndicator` |

---

## 7. BDD Scenario Coverage

Estimated **10 scenarios** across one feature file (`features/auth/auth.feature`):

| # | Scenario | Tags |
|---|---|---|
| 1 | Login with valid ADMIN credentials redirects to dashboard | `@happy-path` |
| 2 | Login with valid ACCOUNTANT credentials redirects to invoices | `@happy-path` `@role-guard` |
| 3 | Login with invalid credentials shows inline error | `@validation` |
| 4 | Login with network failure shows toast and retry | `@error-state` `@offline` |
| 5 | Session restore on page refresh with valid token | `@happy-path` |
| 6 | Session restore on page refresh with expired token redirects to login | `@error-state` |
| 7 | Logout clears token and redirects to login | `@happy-path` |
| 8 | Expired token mid-session redirects to login with toast | `@error-state` |
| 9 | ACCOUNTANT accessing admin route redirects to invoices | `@role-guard` |
| 10 | Unauthenticated user accessing protected route redirects to login | `@role-guard` |
| 11 | Post-login URL restoration after unauthorized redirect | `@happy-path` |
| 12 | Health indicator shows online when all services are up | `@display` |

---

## 8. API Coverage Checklist

- [ ] `POST /api/v1/auth/login` — consumed by `useLogin()` in `LoginForm`
- [ ] `GET /api/v1/auth/me` — consumed by `useMe()` in `AuthProvider`
- [ ] `GET /api/v1/health` — consumed by `useHealth()` in `HealthIndicator`
- [ ] MSW handler: `auth.ts` — login, /me, health (already implemented in contract setup)
- [ ] Orval generation: NOT generated — auth endpoints are missing from the OpenAPI spec

### Gap: Auth Endpoints Not in OpenAPI Spec

The CESAR OpenAPI spec (`../cesar/api/openapi.yaml`) does **not** define:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/health`

These endpoints are documented in the feasibility analysis (61 endpoints) and
are required for the frontend, but are absent from the 5,779-line YAML. The
tags section also has no `Auth` tag.

**Impact on cesar-web:**
- orval cannot generate typed hooks for these endpoints.
- MSW handlers (`src/mocks/handlers/auth.ts`) are manually written without
  generated type support.
- When CESAR implements these endpoints, if they are not added to the spec,
  the contract boundary is broken — TypeScript cannot verify the request/response
  types.

**Recommended fix:** Add auth endpoints to CESAR's `api/openapi.yaml` with a new
`Auth` tag, `operationId` values, and full request/response schemas. Documented
as issue #4 in `../feasibility/cesar-openapi-spec-issues.md`.

---

*End of SPEC — Auth.*
