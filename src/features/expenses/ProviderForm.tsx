import { CUITInput } from "@/components/shared/CUITInput";
import { IvaConditionSelect } from "@/components/shared/IvaConditionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";

interface ProviderFormData {
  cuit: string;
  name: string;
  iva_condition: string;
  provider_type: string;
  contact_email: string;
  contact_phone: string;
}

interface ProviderFormProps {
  initialData?: Partial<ProviderFormData>;
  onSubmit: (data: ProviderFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function ProviderForm({ initialData, onSubmit, isSubmitting, error }: ProviderFormProps) {
  const [form, setForm] = useState<ProviderFormData>({
    cuit: initialData?.cuit ?? "",
    name: initialData?.name ?? "",
    iva_condition: initialData?.iva_condition ?? "RI",
    provider_type: initialData?.provider_type ?? "COMPANY",
    contact_email: initialData?.contact_email ?? "",
    contact_phone: initialData?.contact_phone ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProviderFormData, string>>>(
    {},
  );

  const handleChange = (field: keyof ProviderFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof ProviderFormData, string>> = {};

    if (!form.cuit || form.cuit.length < 11) {
      errors.cuit = "CUIT invalido. Debe tener 11 digitos.";
    }
    if (!form.name.trim()) {
      errors.name = "El nombre es requerido.";
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

  const isEdit = !!initialData?.name;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold mb-6">
        {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h1>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-1.5">
        <Label htmlFor="cuit">CUIT</Label>
        <CUITInput id="cuit" value={form.cuit} onChange={(v) => handleChange("cuit", v)} />
        {fieldErrors.cuit && <p className="text-xs text-red-600">{fieldErrors.cuit}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: ELEVADORES SRL"
        />
        {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="provider_type">Tipo</Label>
        <select
          id="provider_type"
          value={form.provider_type}
          onChange={(e) => handleChange("provider_type", e.target.value)}
          className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
        >
          <option value="COMPANY">Empresa</option>
          <option value="INDIVIDUAL">Persona Fisica</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="iva_condition">Condicion IVA</Label>
        <IvaConditionSelect
          id="iva_condition"
          value={form.iva_condition}
          onChange={(v) => handleChange("iva_condition", v)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_email">Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={form.contact_email}
          onChange={(e) => handleChange("contact_email", e.target.value)}
          placeholder="proveedor@email.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_phone">Telefono</Label>
        <Input
          id="contact_phone"
          value={form.contact_phone}
          onChange={(e) => handleChange("contact_phone", e.target.value)}
          placeholder="11 5555-0101"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Proveedor"}
      </Button>
    </form>
  );
}

export { ProviderForm };
export type { ProviderFormData };
