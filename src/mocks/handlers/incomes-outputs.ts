import { http, HttpResponse } from "msw";
import { TORRE_NORTE_ID, incomesOutputs } from "../fixtures/data";
import type { IncomeOutputData } from "../fixtures/data";

function error(status: number, code: string, message: string) {
  return HttpResponse.json({ error: { code, message } }, { status });
}

export const incomesOutputsHandlers = [
  // Create entry
  http.post("http://localhost:3000/api/v1/incomes-outputs", async ({ request }) => {
    const body = (await request.json()) as Partial<IncomeOutputData>;
    const io: IncomeOutputData = {
      id: crypto.randomUUID(),
      consorcio_id: body.consorcio_id || TORRE_NORTE_ID,
      period_code: body.period_code || "202606",
      direction: body.direction || "INCOME",
      sub_type: body.sub_type || "INCOME_RENT",
      description: body.description || "",
      amount: body.amount || { amount: "0.00", currency: "ARS" },
      date: body.date || new Date().toISOString().slice(0, 10),
      invoice_id: body.invoice_id || null,
      migration_tag: body.migration_tag || null,
      status: "ACTIVE",
      hash: crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64),
      version: 1,
      tombstone: false,
      created_at: new Date().toISOString(),
    };
    incomesOutputs.push(io);
    return HttpResponse.json(io, { status: 201 });
  }),

  // List entries
  http.get("http://localhost:3000/api/v1/incomes-outputs", ({ request }) => {
    const url = new URL(request.url);
    const direction = url.searchParams.get("direction");
    const from = url.searchParams.get("from_date");
    const to = url.searchParams.get("to_date");
    let result = incomesOutputs.filter((io) => !io.tombstone);
    if (direction) result = result.filter((io) => io.direction === direction);
    if (from) result = result.filter((io) => io.date >= from);
    if (to) result = result.filter((io) => io.date <= to);
    return HttpResponse.json(result, { status: 200 });
  }),

  // Get entry detail
  http.get("http://localhost:3000/api/v1/incomes-outputs/:id", ({ params }) => {
    const io = incomesOutputs.find((io) => io.id === params.id);
    if (!io) return error(404, "NOT_FOUND", "Entry not found");
    return HttpResponse.json(io, { status: 200 });
  }),

  // Update entry
  http.put("http://localhost:3000/api/v1/incomes-outputs/:id", async ({ params, request }) => {
    const existing = incomesOutputs.find((io) => io.id === params.id);
    if (!existing) return error(404, "NOT_FOUND", "Entry not found");
    const body = (await request.json()) as Partial<IncomeOutputData>;
    existing.version += 1;
    existing.hash = crypto.randomUUID().replace(/-/g, "").repeat(2).slice(0, 64);
    Object.assign(existing, body, {
      id: existing.id,
      version: existing.version,
      hash: existing.hash,
    });
    return HttpResponse.json(existing, { status: 200 });
  }),

  // Cancel entry
  http.put("http://localhost:3000/api/v1/incomes-outputs/:id/cancel", ({ params }) => {
    const entry = incomesOutputs.find((io) => io.id === params.id);
    if (!entry) return error(404, "NOT_FOUND", "Entry not found");
    entry.status = "CANCELLED";
    entry.tombstone = true;
    return HttpResponse.json(entry, { status: 200 });
  }),

  // Single-period summary
  http.get("http://localhost:3000/api/v1/incomes-outputs/summary/:period", ({ params }) => {
    const entries = incomesOutputs.filter(
      (io) => io.period_code === params.period && !io.tombstone,
    );
    const totalIncome = entries
      .filter((e) => e.direction === "INCOME")
      .reduce((s, e) => s + Number.parseFloat(e.amount.amount || "0"), 0);
    const totalOutput = entries
      .filter((e) => e.direction === "OUTPUT")
      .reduce((s, e) => s + Number.parseFloat(e.amount.amount || "0"), 0);
    return HttpResponse.json(
      {
        total_income: { amount: totalIncome.toFixed(2), currency: "ARS" },
        total_output: { amount: totalOutput.toFixed(2), currency: "ARS" },
        net_flow: { amount: (totalIncome - totalOutput).toFixed(2), currency: "ARS" },
      },
      { status: 200 },
    );
  }),

  // Cross-period summary
  http.get("http://localhost:3000/api/v1/incomes-outputs/summary", () => {
    const entries = incomesOutputs.filter((io) => !io.tombstone);
    const totalIncome = entries
      .filter((e) => e.direction === "INCOME")
      .reduce((s, e) => s + Number.parseFloat(e.amount.amount || "0"), 0);
    const totalOutput = entries
      .filter((e) => e.direction === "OUTPUT")
      .reduce((s, e) => s + Number.parseFloat(e.amount.amount || "0"), 0);
    return HttpResponse.json(
      {
        total_income: { amount: totalIncome.toFixed(2), currency: "ARS" },
        total_output: { amount: totalOutput.toFixed(2), currency: "ARS" },
        net_flow: { amount: (totalIncome - totalOutput).toFixed(2), currency: "ARS" },
        opening_balance: { amount: "0.00", currency: "ARS" },
        closing_balance: { amount: (totalIncome - totalOutput).toFixed(2), currency: "ARS" },
      },
      { status: 200 },
    );
  }),
];
