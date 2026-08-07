import { CUITInput } from "@/components/shared/CUITInput";
import { IvaConditionSelect } from "@/components/shared/IvaConditionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConsorcioData } from "@/mocks/fixtures/data";
import { Save } from "lucide-react";
import { useState } from "react";

interface ConsorcioFormProps {
  initialData?: ConsorcioData;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

interface FormData {
  cuit: string;
  razon_social: string;
  nombre_fantasia: string;
  matricula_caba: string;
  domicilio: string;
  iva_condition: string;
  fiscal_year_start: number;
  late_interest_rate: string;
  round_off_limit: string;
}

function ConsorcioForm({ initialData, onSubmit, isSubmitting, error }: ConsorcioFormProps) {
  const [form, setForm] = useState<FormData>({
    cuit: initialData?.cuit ?? "",
    razon_social: initialData?.razon_social ?? "",
    nombre_fantasia: initialData?.nombre_fantasia ?? "",
    matricula_caba: initialData?.matricula_caba ?? "",
    domicilio: initialData?.domicilio ?? "",
    iva_condition: initialData?.iva_condition ?? "RI",
    fiscal_year_start: initialData?.fiscal_year_start ?? 1,
    late_interest_rate: initialData?.late_interest_rate ?? "60.00",
    round_off_limit: initialData?.round_off_limit ?? "0.50",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!form.cuit || form.cuit.length < 11) {
      errors.cuit = "CUIT inválido. Debe tener 11 dígitos.";
    }
    if (!form.razon_social.trim()) {
      errors.razon_social = "La Razón Social es requerida.";
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

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold mb-6">
        {isEdit ? "Editar Consorcio" : "Nuevo Consorcio"}
      </h1>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-1.5">
        <Label htmlFor="cuit">CUIT</Label>
        <CUITInput id="cuit" value={form.cuit} onChange={(v) => handleChange("cuit", v)} />
        {fieldErrors.cuit && <p className="text-xs text-red-600">{fieldErrors.cuit}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="razon_social">Razón Social</Label>
        <Input
          id="razon_social"
          value={form.razon_social}
          onChange={(e) => handleChange("razon_social", e.target.value)}
          placeholder="Ej: Consorcio Torre Sur"
        />
        {fieldErrors.razon_social && (
          <p className="text-xs text-red-600">{fieldErrors.razon_social}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre_fantasia">Nombre Fantasía</Label>
        <Input
          id="nombre_fantasia"
          value={form.nombre_fantasia}
          onChange={(e) => handleChange("nombre_fantasia", e.target.value)}
          placeholder="Ej: Torre Sur"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="domicilio">Domicilio</Label>
        <Input
          id="domicilio"
          value={form.domicilio}
          onChange={(e) => handleChange("domicilio", e.target.value)}
          placeholder="Ej: Av. Rivadavia 8500, CABA"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="matricula_caba">Matrícula CABA</Label>
        <Input
          id="matricula_caba"
          value={form.matricula_caba}
          onChange={(e) => handleChange("matricula_caba", e.target.value)}
          placeholder="Ej: MAT-2024-001234"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="iva_condition">Condición IVA</Label>
        <IvaConditionSelect
          id="iva_condition"
          value={form.iva_condition}
          onChange={(v) => handleChange("iva_condition", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fiscal_year_start">Inicio Ejercicio Fiscal (mes)</Label>
          <Input
            id="fiscal_year_start"
            type="number"
            min={1}
            max={12}
            value={String(form.fiscal_year_start)}
            onChange={(e) => handleChange("fiscal_year_start", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="late_interest_rate">Interés Punitorio Anual (%)</Label>
          <Input
            id="late_interest_rate"
            value={form.late_interest_rate}
            onChange={(e) => handleChange("late_interest_rate", e.target.value)}
            placeholder="Ej: 60.00"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="round_off_limit">Límite de Redondeo ($)</Label>
        <Input
          id="round_off_limit"
          value={form.round_off_limit}
          onChange={(e) => handleChange("round_off_limit", e.target.value)}
          placeholder="Ej: 0.50"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Consorcio"}
      </Button>
    </form>
  );
}

export { ConsorcioForm };
export type { FormData as ConsorcioFormData };
