import { http, HttpResponse } from "msw";
import { TORRE_NORTE_ID, expenses, concepts, categories, providers } from "../fixtures/data";
import type { ExpenseData, ConceptData, CategoryData, ProviderData } from "../fixtures/data";

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const expensesHandlers = [
  // Create expense
  http.post("http://localhost:3000/api/v1/expenses", async ({ request }) => {
    const body = (await request.json()) as Partial<ExpenseData>;
    const newExpense: ExpenseData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      period_code: body.period_code || "202606",
      group: body.group || "A",
      type: body.type || "ORDINARIA",
      status: body.type === "EXTRAORDINARIA" ? "PENDING" : "APPROVED",
      concept_id: body.concept_id || "",
      category_id: body.category_id || "",
      provider_id: body.provider_id || null,
      total_cost: body.total_cost || { amount: "0.00", currency: "ARS" },
      invoice_id: body.invoice_id || null,
      description: body.description || "",
      terms_total: body.terms_total || 1,
      term_current: body.term_current || 1,
      version: 1,
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      tombstone: false,
      created_at: new Date().toISOString(),
      approved_at: body.type === "EXTRAORDINARIA" ? null : new Date().toISOString(),
      rejected_at: null,
    };
    expenses.push(newExpense);
    return HttpResponse.json(newExpense, { status: 201 });
  }),

  // List expenses
  http.get("http://localhost:3000/api/v1/expenses", ({ request }) => {
    const url = new URL(request.url);
    const consorcio_id = url.searchParams.get("consorcio_id");
    const period = url.searchParams.get("period_code");
    let result = [...expenses];
    if (consorcio_id) result = result.filter((e) => e.consorcio_id === consorcio_id);
    if (period) result = result.filter((e) => e.period_code === period);
    return HttpResponse.json(result, { status: 200 });
  }),

  // Version history
  http.get("http://localhost:3000/api/v1/expenses/:id/versions", ({ params }) => {
    const expense = expenses.find((e) => e.id === params.id);
    if (!expense) return error(404, "NOT_FOUND", "Expense not found");
    return HttpResponse.json([expense], { status: 200 });
  }),

  // Tombstone
  http.put("http://localhost:3000/api/v1/expenses/:id/tombstone", ({ params }) => {
    const idx = expenses.findIndex((e) => e.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Expense not found");
    expenses[idx]!.tombstone = true;
    return HttpResponse.json(expenses[idx], { status: 200 });
  }),

  // Approve
  http.put("http://localhost:3000/api/v1/expenses/:id/approve", ({ params }) => {
    const idx = expenses.findIndex((e) => e.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Expense not found");
    if (expenses[idx]!.type !== "EXTRAORDINARIA") {
      return error(422, "VALIDATION_ERROR", "Only EXTRAORDINARIA expenses require approval");
    }
    expenses[idx]!.status = "APPROVED";
    expenses[idx]!.approved_at = new Date().toISOString();
    return HttpResponse.json(expenses[idx], { status: 200 });
  }),

  // Reject
  http.put("http://localhost:3000/api/v1/expenses/:id/reject", ({ params }) => {
    const idx = expenses.findIndex((e) => e.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Expense not found");
    expenses[idx]!.status = "REJECTED";
    expenses[idx]!.rejected_at = new Date().toISOString();
    return HttpResponse.json(expenses[idx], { status: 200 });
  }),

  // Create concept
  http.post("http://localhost:3000/api/v1/expenses/concepts", async ({ request }) => {
    const body = (await request.json()) as Partial<ConceptData>;
    const c: ConceptData = {
      id: crypto.randomUUID(),
      group: body.group || "A",
      name: body.name || "",
      description: body.description || "",
    };
    concepts.push(c);
    return HttpResponse.json(c, { status: 201 });
  }),

  // List concepts
  http.get("http://localhost:3000/api/v1/expenses/concepts", () => {
    return HttpResponse.json(concepts, { status: 200 });
  }),

  // List concepts by group
  http.get("http://localhost:3000/api/v1/expenses/concepts/:group", ({ params }) => {
    return HttpResponse.json(concepts.filter((c) => c.group === params.group), { status: 200 });
  }),

  // Create category
  http.post("http://localhost:3000/api/v1/expenses/categories", async ({ request }) => {
    const body = (await request.json()) as Partial<CategoryData>;
    const c: CategoryData = {
      id: crypto.randomUUID(),
      group: body.group || "A",
      name: body.name || "",
    };
    categories.push(c);
    return HttpResponse.json(c, { status: 201 });
  }),

  // List categories
  http.get("http://localhost:3000/api/v1/expenses/categories", () => {
    return HttpResponse.json(categories, { status: 200 });
  }),

  // Register provider
  http.post("http://localhost:3000/api/v1/expenses/providers", async ({ request }) => {
    const body = (await request.json()) as Partial<ProviderData>;
    const p: ProviderData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      cuit: body.cuit || "",
      nombre: body.nombre || "",
      iva_condition: body.iva_condition || "RI",
      email: body.email || "",
      phone: body.phone || "",
      tombstone: false,
    };
    providers.push(p);
    return HttpResponse.json(p, { status: 201 });
  }),

  // List providers
  http.get("http://localhost:3000/api/v1/expenses/providers", () => {
    return HttpResponse.json(providers.filter((p) => !p.tombstone), { status: 200 });
  }),

  // Update provider
  http.put("http://localhost:3000/api/v1/expenses/providers/:id", async ({ params, request }) => {
    const idx = providers.findIndex((p) => p.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Provider not found");
    const body = (await request.json()) as Partial<ProviderData>;
    providers[idx] = { ...providers[idx]!, ...body, id: providers[idx]!.id };
    return HttpResponse.json(providers[idx], { status: 200 });
  }),

  // Tombstone provider
  http.put("http://localhost:3000/api/v1/expenses/providers/:id/tombstone", ({ params }) => {
    const idx = providers.findIndex((p) => p.id === params.id);
    if (idx === -1) return error(404, "NOT_FOUND", "Provider not found");
    providers[idx]!.tombstone = true;
    return HttpResponse.json(providers[idx], { status: 200 });
  }),
];
