import type { HttpHandler } from "msw";
import { authHandlers } from "./auth";
import { consorcioHandlers } from "./consorcios";
import { expensesHandlers } from "./expenses";
import { invoicesHandlers } from "./invoices";
import { debtHandlers } from "./debt";
import { paymentsHandlers } from "./payments";
import { incomesOutputsHandlers } from "./incomes-outputs";

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...consorcioHandlers,
  ...expensesHandlers,
  ...invoicesHandlers,
  ...debtHandlers,
  ...paymentsHandlers,
  ...incomesOutputsHandlers,
];
