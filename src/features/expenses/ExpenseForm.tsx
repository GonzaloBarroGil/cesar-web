import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";

interface ExpenseFormData {
  item: string;
  cost: string;
  expense_type: "ORDINARIA" | "EXTRAORDINARIA";
  provider_id: string;
  concept_id: string;
  category_id: string;
  period_code: string;
  consorcio_id: string;
  total_terms: number;
}

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function ExpenseForm({ initialData, onSubmit, isSubmitting, error }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>({
    item: initialData?.item ?? "",
    cost: initialData?.cost ?? "",
    expense_type: initialData?.expense_type ?? "ORDINARIA",
    provider_id: initialData?.provider_id ?? "",
    concept_id: initialData?.concept_id ?? "",
    category_id: initialData?.category_id ?? "",
    period_code: initialData?.period_code ?? "",
    consorcio_id: initialData?.consorcio_id ?? "",
    total_terms: initialData?.total_terms ?? 1,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>(
    {},
  );

  const handleChange = (field: keyof ExpenseFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!form.item.trim()) {
      errors.item = "La descripcion es requerida.";
    }
    if (!form.cost || Number.parseFloat(form.cost) <= 0) {
      errors.cost = "El costo debe ser mayor a 0.";
    }
    if (!form.period_code.trim()) {
      errors.period_code = "El periodo es requerido.";
    }
    if (!form.consorcio_id.trim()) {
      errors.consorcio_id = "El consorcio es requerido.";
    }
    if (form.total_terms < 1) {
      errors.total_terms = "Debe ser al menos 1.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const isEdit = !!initialData?.item;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold mb-6">{isEdit ? "Editar Gasto" : "Nuevo Gasto"}</h1>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-1.5">
        <Label htmlFor="expense-type">Tipo de Gasto</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange("expense_type", "ORDINARIA")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              form.expense_type === "ORDINARIA"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Ordinaria
          </button>
          <button
            type="button"
            onClick={() => handleChange("expense_type", "EXTRAORDINARIA")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              form.expense_type === "EXTRAORDINARIA"
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Extraordinaria
          </button>
        </div>
        {form.expense_type === "EXTRAORDINARIA" && (
          <p className="text-xs text-amber-600">Requiere aprobacion.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="item">Descripcion</Label>
        <Input
          id="item"
          value={form.item}
          onChange={(e) => handleChange("item", e.target.value)}
          placeholder="Ej: Mantenimiento de ascensores"
        />
        {fieldErrors.item && <p className="text-xs text-red-600">{fieldErrors.item}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cost">Costo (ARS)</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          min="0"
          value={form.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
          placeholder="0.00"
        />
        {fieldErrors.cost && <p className="text-xs text-red-600">{fieldErrors.cost}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="period_code">Periodo (YYYYMM)</Label>
        <Input
          id="period_code"
          value={form.period_code}
          onChange={(e) => handleChange("period_code", e.target.value)}
          placeholder="202606"
          maxLength={6}
        />
        {fieldErrors.period_code && (
          <p className="text-xs text-red-600">{fieldErrors.period_code}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="consorcio_id">ID Consorcio</Label>
        <Input
          id="consorcio_id"
          value={form.consorcio_id}
          onChange={(e) => handleChange("consorcio_id", e.target.value)}
          placeholder="UUID del consorcio"
        />
        {fieldErrors.consorcio_id && (
          <p className="text-xs text-red-600">{fieldErrors.consorcio_id}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="concept_id">ID Concepto</Label>
        <Input
          id="concept_id"
          value={form.concept_id}
          onChange={(e) => handleChange("concept_id", e.target.value)}
          placeholder="UUID del concepto"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category_id">ID Categoria</Label>
        <Input
          id="category_id"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
          placeholder="UUID de la categoria"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="provider_id">ID Proveedor</Label>
        <Input
          id="provider_id"
          value={form.provider_id}
          onChange={(e) => handleChange("provider_id", e.target.value)}
          placeholder="UUID del proveedor"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="total_terms">Terminos (cuotas)</Label>
        <Input
          id="total_terms"
          type="number"
          min={1}
          max={120}
          value={form.total_terms}
          onChange={(e) => handleChange("total_terms", Number(e.target.value))}
        />
        {fieldErrors.total_terms && (
          <p className="text-xs text-red-600">{fieldErrors.total_terms}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Gasto"}
      </Button>
    </form>
  );
}

export { ExpenseForm };
export type { ExpenseFormData };
