import {
  useGetCrossPeriodSummary,
  useGetFinancialSummary,
} from "@/api/generated/incomes-outputs/incomes-outputs";
import type { FinancialSummary, Money } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { PeriodPicker } from "@/components/shared/PeriodPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConsorcio } from "@/features/layout/ConsorcioContext";
import { periode202605, periode202606 } from "@/mocks/fixtures/data";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type Tab = "period" | "accumulated";

const FIXTURE_PERIODS = [periode202606, periode202605];

function toNumber(money?: Money): number {
  return money ? Number.parseFloat(money.amount || "0") : 0;
}

function toDisplay(value: number): { amount: string; currency: string } {
  return { amount: value.toFixed(2), currency: "ARS" };
}

function SummaryPage() {
  const [tab, setTab] = useState<Tab>("period");
  const [periodCode, setPeriodCode] = useState(periode202606.code);
  const [startPeriod, setStartPeriod] = useState(periode202605.code);
  const [endPeriod, setEndPeriod] = useState(periode202606.code);
  const { selectedId, consorcios } = useConsorcio();

  const consorcioId = selectedId ?? consorcios[0]?.id ?? "";

  const singleQuery = useGetFinancialSummary(
    { code: periodCode },
    { consorcio_id: consorcioId },
    { query: { enabled: tab === "period" && !!periodCode && !!consorcioId } },
  );

  const crossQuery = useGetCrossPeriodSummary(
    {
      consorcio_id: consorcioId,
      start_period: { code: startPeriod },
      end_period: { code: endPeriod },
    },
    { query: { enabled: tab === "accumulated" && !!consorcioId } },
  );

  const crossData = crossQuery.data;
  let periodEntries: Array<[string, FinancialSummary]> = [];
  if (crossData) {
    periodEntries =
      "total_income" in crossData
        ? [["", crossData as unknown as FinancialSummary]]
        : Object.entries(crossData).sort(([a], [b]) => a.localeCompare(b));
  }

  const totalIncome = periodEntries.reduce((sum, [, s]) => sum + toNumber(s.total_income), 0);
  const totalOutput = periodEntries.reduce((sum, [, s]) => sum + toNumber(s.total_output), 0);
  const netFlow = totalIncome - totalOutput;
  const firstEntry = periodEntries[0];
  const lastEntry = periodEntries[periodEntries.length - 1];
  const openingBalance = firstEntry ? toNumber(firstEntry[1].opening_balance) : 0;
  const closingBalance = lastEntry?.[1].closing_balance
    ? toNumber(lastEntry[1].closing_balance)
    : openingBalance + netFlow;
  const hasPeriodBreakdown = periodEntries.length > 0 && firstEntry?.[0] !== "";

  const tabs = [
    { key: "period" as const, label: "Por Período" },
    { key: "accumulated" as const, label: "Acumulado" },
  ];

  return (
    <div>
      <Link
        to="/incomes-outputs"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Movimientos
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Resumen Financiero</h1>
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "period" && (
        <div>
          <div className="space-y-1.5 mb-6">
            <span className="text-xs text-neutral-500 block">Período</span>
            <PeriodPicker periods={FIXTURE_PERIODS} value={periodCode} onChange={setPeriodCode} />
          </div>

          {singleQuery.isLoading && (
            <div className="h-32 bg-neutral-100 animate-pulse rounded-lg" />
          )}

          {singleQuery.error != null && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error al cargar el resumen</p>
              <Button variant="outline" onClick={() => singleQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {singleQuery.data && (
            <Card>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-neutral-500">Ingresos</span>
                  <p>
                    <MoneyDisplay
                      amount={singleQuery.data.total_income as { amount: string; currency: string }}
                      className="text-lg font-semibold text-green-700"
                    />
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Egresos</span>
                  <p>
                    <MoneyDisplay
                      amount={singleQuery.data.total_output as { amount: string; currency: string }}
                      className="text-lg font-semibold text-red-600"
                    />
                  </p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Resultado neto</span>
                  <p>
                    <MoneyDisplay
                      amount={singleQuery.data.net_flow as { amount: string; currency: string }}
                      showColor
                      className="text-lg font-semibold"
                    />
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "accumulated" && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Input
              aria-label="Periodo desde"
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value)}
              placeholder="Desde (YYYYMM)"
              maxLength={6}
              className="w-40"
            />
            <Input
              aria-label="Periodo hasta"
              value={endPeriod}
              onChange={(e) => setEndPeriod(e.target.value)}
              placeholder="Hasta (YYYYMM)"
              maxLength={6}
              className="w-40"
            />
          </div>

          {crossQuery.isLoading && <div className="h-48 bg-neutral-100 animate-pulse rounded-lg" />}

          {crossQuery.error != null && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error al cargar el resumen</p>
              <Button variant="outline" onClick={() => crossQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {crossData && periodEntries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">Sin datos acumulados.</p>
            </div>
          )}

          {crossData && periodEntries.length > 0 && (
            <>
              <Card className="mb-6">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Saldo inicial</span>
                    <MoneyDisplay amount={toDisplay(openingBalance)} className="text-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">+ Ingresos</span>
                    <MoneyDisplay
                      amount={toDisplay(totalIncome)}
                      className="text-sm text-green-700"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">− Egresos</span>
                    <MoneyDisplay
                      amount={toDisplay(totalOutput)}
                      className="text-sm text-red-600"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-medium">Flujo neto</span>
                    <MoneyDisplay
                      amount={toDisplay(netFlow)}
                      showColor
                      className="text-sm font-medium"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Saldo final</span>
                    <MoneyDisplay
                      amount={toDisplay(closingBalance)}
                      showColor
                      className="text-sm font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

              {hasPeriodBreakdown && (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-neutral-50">
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                          Período
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                          Ingresos
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                          Egresos
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                          Neto
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 hidden sm:table-cell">
                          Saldo final
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodEntries.map(([code, summary]) => (
                        <tr key={code} className="border-b">
                          <td className="px-4 py-3 text-sm text-neutral-600">{code}</td>
                          <td className="px-4 py-3">
                            <MoneyDisplay
                              amount={summary.total_income as { amount: string; currency: string }}
                              className="text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <MoneyDisplay
                              amount={summary.total_output as { amount: string; currency: string }}
                              className="text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <MoneyDisplay
                              amount={summary.net_flow as { amount: string; currency: string }}
                              showColor
                              className="text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {summary.closing_balance ? (
                              <MoneyDisplay
                                amount={
                                  summary.closing_balance as { amount: string; currency: string }
                                }
                                className="text-sm"
                              />
                            ) : (
                              <span className="text-sm text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { SummaryPage };
