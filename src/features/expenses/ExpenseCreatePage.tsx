import { useCreateExpense } from "@/api/generated/expenses/expenses";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExpenseForm, type ExpenseFormData } from "./ExpenseForm";

function ExpenseCreatePage() {
  const navigate = useNavigate();
  const createExpense = useCreateExpense();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (formData: ExpenseFormData) => {
    setServerError(null);

    createExpense.mutate(
      {
        data: {
          consorcio_id: formData.consorcio_id,
          period_code: formData.period_code,
          category_id: formData.category_id,
          concept_id: formData.concept_id,
          item: formData.item,
          total_terms: formData.total_terms,
          provider_id: formData.provider_id,
          cost: { amount: formData.cost, currency: "ARS" },
          expense_type: formData.expense_type,
        } as never,
      },
      {
        onSuccess: (result) => {
          const expenses = result as { id: string }[];
          const firstId = expenses[0]?.id;
          if (firstId) navigate(`/expenses/${firstId}`);
        },
        onError: () => setServerError("Error al crear el gasto."),
      },
    );
  };

  return (
    <div>
      <Link
        to="/expenses"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Expensas
      </Link>
      <ExpenseForm
        onSubmit={handleSubmit}
        isSubmitting={createExpense.isPending}
        error={serverError}
      />
    </div>
  );
}

export { ExpenseCreatePage };
