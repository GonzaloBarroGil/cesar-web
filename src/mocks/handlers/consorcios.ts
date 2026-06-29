import { http, HttpResponse } from "msw";
import { consorcioTorreNorte, periode202605, periode202606, propietarios } from "../fixtures/data";
import type {
  ConsorcioData,
  PeriodData,
  PropietarioData,
  UnidadFuncionalData,
} from "../fixtures/data";
import {
  toConsorcioResponse,
  toPeriodResponse,
  toPropietarioListResponse,
  toPropietarioResponse,
} from "./consorcioTransform";

const consorcios: ConsorcioData[] = [consorcioTorreNorte];
const periodes: PeriodData[] = [periode202606, periode202605];

function requireAdmin(request: Request) {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const tokenParts = auth.split(".");
    if (!tokenParts[1]) return false;
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const consorcioHandlers = [
  // List all consorcios
  http.get("http://localhost:3000/api/v1/consorcios", ({ request }) => {
    if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
    return HttpResponse.json(consorcios.map(toConsorcioResponse), { status: 200 });
  }),

  // Create consorcio
  http.post("http://localhost:3000/api/v1/consorcios", async ({ request }) => {
    if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
    const body = (await request.json()) as Partial<ConsorcioData>;
    if (!body?.cuit || !body?.razon_social) {
      return error(422, "VALIDATION_ERROR", "CUIT and razón social are required");
    }
    if (consorcios.find((c) => c.cuit === body.cuit)) {
      return error(409, "CONFLICT", `CUIT ${body.cuit} already registered`);
    }
    const newC: ConsorcioData = {
      id: crypto.randomUUID(),
      cuit: body.cuit,
      razon_social: body.razon_social || "",
      nombre_fantasia: body.nombre_fantasia || body.razon_social,
      matricula_caba: body.matricula_caba || "",
      domicilio: body.domicilio || "",
      iva_condition: body.iva_condition || "RI",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    consorcios.push(newC);
    return HttpResponse.json(toConsorcioResponse(newC), { status: 201 });
  }),

  // Get consorcio by ID
  http.get("http://localhost:3000/api/v1/consorcios/:id", ({ params }) => {
    const consorcio = consorcios.find((c) => c.id === params.id);
    if (!consorcio) return error(404, "NOT_FOUND", "Consorcio not found");
    return HttpResponse.json(toConsorcioResponse(consorcio), { status: 200 });
  }),

  // Update consorcio
  http.put("http://localhost:3000/api/v1/consorcios/:id", async ({ params, request }) => {
    if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
    const existing = consorcios.find((c) => c.id === params.id);
    if (!existing) return error(404, "NOT_FOUND", "Consorcio not found");
    const body = (await request.json()) as Partial<ConsorcioData>;
    const updated = { ...existing, ...body, updated_at: new Date().toISOString(), id: existing.id };
    const index = consorcios.indexOf(existing);
    consorcios[index] = updated;
    return HttpResponse.json(toConsorcioResponse(updated), { status: 200 });
  }),

  // Configure UFs
  http.put("http://localhost:3000/api/v1/consorcios/:id/ufs", async ({ request }) => {
    if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
    const body = (await request.json()) as { unidades_funcionales: UnidadFuncionalData[] };
    const totalA =
      body.unidades_funcionales?.reduce(
        (s, uf) => s + Number.parseFloat(uf.percentage_a || "0"),
        0,
      ) || 0;
    const totalB =
      body.unidades_funcionales?.reduce(
        (s, uf) => s + Number.parseFloat(uf.percentage_b || "0"),
        0,
      ) || 0;
    const totalC =
      body.unidades_funcionales?.reduce(
        (s, uf) => s + Number.parseFloat(uf.percentage_c || "0"),
        0,
      ) || 0;
    if (totalA > 100.01 || totalB > 100.01 || totalC > 100.01) {
      return error(422, "VALIDATION_ERROR", "Suma de porcentajes no puede superar 100%");
    }
    return HttpResponse.json({ status: "ok" }, { status: 200 });
  }),

  // Register propietario
  http.post(
    "http://localhost:3000/api/v1/consorcios/:id/propietarios",
    async ({ params, request }) => {
      if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
      const body = (await request.json()) as Partial<PropietarioData>;
      const newP: PropietarioData = {
        id: crypto.randomUUID(),
        consorcio_id: params.id as string,
        unidad_funcional_id: body.unidad_funcional_id || "",
        tax_id: body.tax_id || "",
        tax_id_type: body.tax_id_type || "CUIT",
        nombre_completo: body.nombre_completo || "",
        iva_condition: body.iva_condition || "CF",
        email: body.email || "",
        phone: body.phone || "",
        is_owner: body.is_owner ?? true,
      };
      propietarios.push(newP);
      return HttpResponse.json(toPropietarioResponse(newP), { status: 201 });
    },
  ),

  // List propietarios
  http.get("http://localhost:3000/api/v1/consorcios/:id/propietarios", ({ params }) => {
    const list = propietarios.filter((p) => p.consorcio_id === params.id);
    return HttpResponse.json(toPropietarioListResponse(list), { status: 200 });
  }),

  // Find propietario by tax ID
  http.get("http://localhost:3000/api/v1/consorcios/:id/propietarios/:taxId", ({ params }) => {
    const p = propietarios.find((p) => p.consorcio_id === params.id && p.tax_id === params.taxId);
    if (!p) return error(404, "NOT_FOUND", "Propietario not found");
    return HttpResponse.json(toPropietarioResponse(p), { status: 200 });
  }),

  // Open period
  http.post("http://localhost:3000/api/v1/consorcios/:id/periodos", async ({ params, request }) => {
    if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
    const body = (await request.json()) as { code: string; start_date: string; end_date: string };
    if (periodes.find((p) => p.code === body.code && p.consorcio_id === params.id)) {
      return error(409, "CONFLICT", "Period already exists");
    }
    const newPeriod: PeriodData = {
      id: crypto.randomUUID(),
      consorcio_id: params.id as string,
      code: body.code,
      start_date: body.start_date,
      end_date: body.end_date,
      status: "OPEN",
      created_at: new Date().toISOString(),
      closed_at: null,
      archived_at: null,
    };
    periodes.push(newPeriod);
    return HttpResponse.json(toPeriodResponse(newPeriod), { status: 201 });
  }),

  // Close period
  http.put(
    "http://localhost:3000/api/v1/consorcios/:id/periodos/:pid/close",
    ({ params, request }) => {
      if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
      const p = periodes.find((p) => p.id === params.pid);
      if (!p) return error(404, "NOT_FOUND", "Period not found");
      p.status = "CLOSED";
      p.closed_at = new Date().toISOString();
      return HttpResponse.json(toPeriodResponse(p), { status: 200 });
    },
  ),

  // Archive period
  http.put(
    "http://localhost:3000/api/v1/consorcios/:id/periodos/:pid/archive",
    ({ params, request }) => {
      if (!requireAdmin(request)) return error(401, "UNAUTHORIZED", "Authentication required");
      const p = periodes.find((p) => p.id === params.pid);
      if (!p) return error(404, "NOT_FOUND", "Period not found");
      p.status = "ARCHIVED";
      p.archived_at = new Date().toISOString();
      return HttpResponse.json(toPeriodResponse(p), { status: 200 });
    },
  ),
];
