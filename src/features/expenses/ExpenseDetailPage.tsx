import {
  useApproveExpense,
  useGetExpenseVersions,
  useListExpenses,
  useRejectExpense,
  useTombstoneExpense,
} from "@/api/generated/expenses/expenses";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ExpenseActions } from "./ExpenseActions";
import { ExpenseDetail } from "./ExpenseDetail";
import { VersionHistory } from "./VersionHistory";

type Tab = "general" | "versions";

function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(
    urlTab && ["general", "versions"].includes(urlTab) ? urlTab : "general",
  );

  const { data: expenses = [], isLoading, isError } = useListExpenses(undefined);
  const { data: versions = [], isLoading: versionsLoading } = useGetExpenseVersions(id ?? "", {
    query: { enabled: !!id },
  });

  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const tombstoneExpense = useTombstoneExpense();

  if (!id) return null;

  const expense = expenses.find((e) => e.id === id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Gasto no encontrado</p>
        <Link to="/expenses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Expensas
          </Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "versions" as const, label: "Historial" },
  ];

  return (
    <div>
      <Link
        to="/expenses"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Expensas
      </Link>

      <ExpenseActions
        expense={expense}
        onApprove={() => approveExpense.mutate({ id: expense.id })}
        onReject={() => rejectExpense.mutate({ id: expense.id })}
        onTombstone={() => tombstoneExpense.mutate({ id: expense.id })}
        isApproving={approveExpense.isPending}
        isRejecting={rejectExpense.isPending}
        isTombstoning={tombstoneExpense.isPending}
      />

      <ExpenseDetail expense={expense}>
        <div className="border-b mb-6">
          <nav className="flex gap-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  const next = new URLSearchParams(searchParams);
                  if (t.key === "general") {
                    next.delete("tab");
                  } else {
                    next.set("tab", t.key);
                  }
                  setSearchParams(next, { replace: true });
                }}
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

        {tab === "general" && null}
        {tab === "versions" && <VersionHistory versions={versions} isLoading={versionsLoading} />}
      </ExpenseDetail>
    </div>
  );
}

export { ExpenseDetailPage };
