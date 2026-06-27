import { CUITInput } from "@/components/shared/CUITInput";
import { IvaConditionSelect } from "@/components/shared/IvaConditionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UnidadFuncionalData } from "@/mocks/fixtures/data";
import { Save, UserPlus } from "lucide-react";
import { useState } from "react";

interface PropietarioFormProps {
  ufs: UnidadFuncionalData[];
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

interface FormData {
  tax_id_type: string;
  tax_id: string;
  nombre_completo: string;
  iva_condition: string;
  email: string;
  phone: string;
  unidad_funcional_id: string;
  is_owner: boolean;
}

function PropietarioForm({ ufs, onSubmit, isSubmitting }: PropietarioFormProps) {
  const [form, setForm] = useState<FormData>({
    tax_id_type: "CUIT",
    tax_id: "",
    nombre_completo: "",
    iva_condition: "RI",
    email: "",
    phone: "",
    unidad_funcional_id: ufs[0]?.id ?? "",
    is_owner: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (form.tax_id_type === "CUIT" && form.tax_id.length < 11) {
      errors.tax_id = "CUIT inválido. Debe tener 11 dígitos.";
    }
    if (!form.tax_id.trim()) {
      errors.tax_id = "El CUIT/CUIL/DNI es requerido.";
    }
    if (!form.nombre_completo.trim()) {
      errors.nombre_completo = "El nombre es requerido.";
    }
    if (!form.unidad_funcional_id) {
      errors.unidad_funcional_id = "Debe seleccionar una unidad.";
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

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold flex items-center gap-2 mb-6">
        <UserPlus className="h-5 w-5" />
        Registrar Propietario
      </h1>

      <div className="space-y-1.5">
        <Label htmlFor="tax_id_type">Tipo de Documento</Label>
        <select
          id="tax_id_type"
          value={form.tax_id_type}
          onChange={(e) => handleChange("tax_id_type", e.target.value)}
          className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm"
        >
          <option value="CUIT">CUIT</option>
          <option value="CUIL">CUIL</option>
          <option value="DNI">DNI</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tax_id">CUIT/CUIL/DNI</Label>
        {form.tax_id_type === "CUIT" ? (
          <CUITInput id="tax_id" value={form.tax_id} onChange={(v) => handleChange("tax_id", v)} />
        ) : (
          <Input
            id="tax_id"
            value={form.tax_id}
            onChange={(e) => handleChange("tax_id", e.target.value)}
          />
        )}
        {fieldErrors.tax_id && <p className="text-xs text-red-600">{fieldErrors.tax_id}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre_completo">Nombre Completo</Label>
        <Input
          id="nombre_completo"
          value={form.nombre_completo}
          onChange={(e) => handleChange("nombre_completo", e.target.value)}
          placeholder="Ej: Roberto Carlos Gómez"
        />
        {fieldErrors.nombre_completo && (
          <p className="text-xs text-red-600">{fieldErrors.nombre_completo}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="iva_condition">Condición IVA</Label>
        <IvaConditionSelect
          value={form.iva_condition}
          onChange={(v) => handleChange("iva_condition", v)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="email@ejemplo.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="11 5555 0201"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unidad_funcional_id">Unidad Funcional</Label>
        <select
          id="unidad_funcional_id"
          value={form.unidad_funcional_id}
          onChange={(e) => handleChange("unidad_funcional_id", e.target.value)}
          className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm"
        >
          {ufs.length === 0 && <option value="">Sin unidades</option>}
          {ufs.map((uf) => (
            <option key={uf.id} value={uf.id}>
              {uf.uf_code} (Piso {uf.floor} - {uf.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_owner"
          type="checkbox"
          checked={form.is_owner}
          onChange={(e) => handleChange("is_owner", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <Label htmlFor="is_owner">Es propietario</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Registrando..." : "Registrar Propietario"}
      </Button>
    </form>
  );
}

export { PropietarioForm };
