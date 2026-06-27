import type { HttpHandler } from "msw";
import { authHandlers } from "./auth";
import { consorcioHandlers } from "./consorcios";
import { debtHandlers } from "./debt";
import { expensesHandlers } from "./expenses";
import { incomesOutputsHandlers } from "./incomes-outputs";
import { invoicesHandlers } from "./invoices";
import { paymentsHandlers } from "./payments";

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...consorcioHandlers,
  ...expensesHandlers,
  ...invoicesHandlers,
  ...debtHandlers,
  ...paymentsHandlers,
  ...incomesOutputsHandlers,
];
