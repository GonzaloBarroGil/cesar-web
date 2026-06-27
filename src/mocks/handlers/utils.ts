import { http, HttpResponse, delay } from "msw";

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

const idempotencyStore = new Map<string, { status: number; body: unknown; expiresAt: number }>();

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function getIdempotencyKey(request: Request): string | null {
  return request.headers.get("Idempotency-Key");
}

function checkIdempotency(key: string | null): { status: number; body: unknown } | null {
  if (!key) return null;
  const stored = idempotencyStore.get(key);
  if (!stored) return null;
  if (Date.now() > stored.expiresAt) {
    idempotencyStore.delete(key);
    return null;
  }
  return { status: stored.status, body: stored.body };
}

function storeIdempotency(key: string | null, status: number, body: unknown): void {
  if (!key) return;
  idempotencyStore.set(key, {
    status,
    body,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
  });
}

function extractToken(request: Request): { username: string; role: string } | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const tokenParts = auth.split(".");
    if (!tokenParts[1]) return null;
    const payload = JSON.parse(atob(tokenParts[1]));
    return { username: payload.username || "admin", role: payload.role || "ADMIN" };
  } catch {
    return null;
  }
}

function requireAuth(request: Request): { username: string; role: string } {
  const token = extractToken(request);
  if (!token) throw authError();
  return token;
}

function requireRole(request: Request, role: string): { username: string; role: string } {
  const token = requireAuth(request);
  if (token.role !== role) throw forbiddenError();
  return token;
}

function authError(): Response {
  return new HttpResponse(
    JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Missing or invalid JWT" } }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}

function forbiddenError(): Response {
  return new HttpResponse(
    JSON.stringify({ error: { code: "FORBIDDEN", message: "Insufficient role" } }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );
}

function notFoundError(resource: string): Response {
  return new HttpResponse(
    JSON.stringify({ error: { code: "NOT_FOUND", message: `${resource} does not exist` } }),
    { status: 404, headers: { "Content-Type": "application/json" } },
  );
}

function validationError(message: string, details?: string[]): Response {
  return new HttpResponse(
    JSON.stringify({ error: { code: "VALIDATION_ERROR", message, details } }),
    { status: 422, headers: { "Content-Type": "application/json" } },
  );
}

function conflictError(message: string): Response {
  return new HttpResponse(JSON.stringify({ error: { code: "CONFLICT", message } }), {
    status: 409,
    headers: { "Content-Type": "application/json" },
  });
}

function badRequest(message: string): Response {
  return new HttpResponse(JSON.stringify({ error: { code: "BAD_REQUEST", message } }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

function notImplemented(): Response {
  return new HttpResponse(
    JSON.stringify({ error: { code: "NOT_IMPLEMENTED", message: "Endpoint not yet implemented" } }),
    { status: 501, headers: { "Content-Type": "application/json" } },
  );
}

function wrapMutation(request: Request, fn: (body: unknown) => unknown): Response {
  const idempotency = checkIdempotency(getIdempotencyKey(request));
  if (idempotency) {
    return HttpResponse.json(idempotency.body as Record<string, unknown>, {
      status: idempotency.status,
    });
  }
  try {
    let body: unknown = null;
    if (request.headers.get("Content-Type")?.includes("application/json")) {
      body = request.body ? JSON.parse(request.body as unknown as string) : null;
    }
    const result = fn(body);
    const status = result ? 201 : 200;
    storeIdempotency(getIdempotencyKey(request), status, result);
    return HttpResponse.json(result as Record<string, unknown>, { status });
  } catch (e) {
    if (e instanceof Response) return e;
    return validationError(String(e));
  }
}

export {
  http,
  HttpResponse,
  delay,
  type ErrorBody,
  extractToken,
  requireAuth,
  requireRole,
  authError,
  forbiddenError,
  notFoundError,
  validationError,
  conflictError,
  badRequest,
  notImplemented,
  wrapMutation,
};
