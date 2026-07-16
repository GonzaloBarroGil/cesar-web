import type { IvaRate } from "@/api/generated/models";
import { IvaRate as IvaRateEnum } from "@/api/generated/models";
import type { InvoiceLineRequest } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceItemDraft {
  descripcion: string;
  cantidad: string;
  precio_unitario: string;
  alicuota_iva: IvaRate;
}

const IVA_RATE_VALUES: Record<IvaRate, number> = {
  Veintiuno: 0.21,
  DiezComaCinco: 0.105,
  Veintisiete: 0.27,
  Cero: 0,
  Exento: 0,
};

const IVA_RATE_LABELS: Record<IvaRate, string> = {
  Veintiuno: "21%",
  DiezComaCinco: "10,5%",
  Veintisiete: "27%",
  Cero: "0%",
  Exento: "Exento",
};

function ivaRateLabel(rate: IvaRate | number | string): string {
  const known = IVA_RATE_LABELS[rate as IvaRate];
  if (known) return known;
  return `${rate}%`;
}

function emptyItem(): InvoiceItemDraft {
  return {
    descripcion: "",
    cantidad: "1",
    precio_unitario: "",
    alicuota_iva: IvaRateEnum.Veintiuno,
  };
}

function lineSubtotal(item: InvoiceItemDraft): number {
  const qty = Number.parseFloat(item.cantidad);
  const price = Number.parseFloat(item.precio_unitario);
  if (Number.isNaN(qty) || Number.isNaN(price)) return 0;
  return qty * price;
}

function lineIva(item: InvoiceItemDraft): number {
  return lineSubtotal(item) * IVA_RATE_VALUES[item.alicuota_iva];
}

function toLineRequests(items: InvoiceItemDraft[]): InvoiceLineRequest[] {
  return items.map((item, idx) => ({
    orden: idx,
    descripcion: item.descripcion,
    cantidad: Number.parseFloat(item.cantidad) || 0,
    unidad_medida: "unidad",
    precio_unitario: {
      amount: (Number.parseFloat(item.precio_unitario) || 0).toFixed(2),
      currency: "ARS",
    },
    alicuota_iva: item.alicuota_iva,
  }));
}

interface InvoiceItemsProps {
  items: InvoiceItemDraft[];
  onChange: (items: InvoiceItemDraft[]) => void;
  showIva?: boolean;
}

function InvoiceItems({ items, onChange, showIva = true }: InvoiceItemsProps) {
  const handleItemChange = (index: number, field: keyof InvoiceItemDraft, value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleAdd = () => {
    onChange([...items, emptyItem()]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-neutral-50">
            <th className="text-left px-3 py-2 text-xs font-medium text-neutral-600">
              Descripcion
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-neutral-600 w-20">Cant.</th>
            <th className="text-left px-3 py-2 text-xs font-medium text-neutral-600 w-32">
              Precio Unit.
            </th>
            {showIva && (
              <th className="text-left px-3 py-2 text-xs font-medium text-neutral-600 w-28">IVA</th>
            )}
            <th className="text-right px-3 py-2 text-xs font-medium text-neutral-600 w-28">
              Subtotal
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id
            <tr key={index} className="border-b">
              <td className="px-3 py-2">
                <Input
                  aria-label={`Descripcion item ${index + 1}`}
                  value={item.descripcion}
                  onChange={(e) => handleItemChange(index, "descripcion", e.target.value)}
                  placeholder="Ej: Mantenimiento"
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  aria-label={`Cantidad item ${index + 1}`}
                  type="number"
                  min="0"
                  step="1"
                  value={item.cantidad}
                  onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  aria-label={`Precio unitario item ${index + 1}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.precio_unitario}
                  onChange={(e) => handleItemChange(index, "precio_unitario", e.target.value)}
                  placeholder="0.00"
                />
              </td>
              {showIva && (
                <td className="px-3 py-2">
                  <select
                    aria-label={`Alicuota IVA item ${index + 1}`}
                    value={item.alicuota_iva}
                    onChange={(e) => handleItemChange(index, "alicuota_iva", e.target.value)}
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  >
                    {(Object.keys(IVA_RATE_LABELS) as IvaRate[]).map((rate) => (
                      <option key={rate} value={rate}>
                        {IVA_RATE_LABELS[rate]}
                      </option>
                    ))}
                  </select>
                </td>
              )}
              <td className="px-3 py-2 text-right">
                <MoneyDisplay
                  amount={{ amount: lineSubtotal(item).toFixed(2), currency: "ARS" }}
                  className="text-sm"
                />
              </td>
              <td className="px-3 py-2">
                {items.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Quitar item ${index + 1}`}
                    onClick={() => handleRemove(index)}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3">
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Agregar item
        </Button>
      </div>
    </div>
  );
}

export { InvoiceItems, emptyItem, ivaRateLabel, lineSubtotal, lineIva, toLineRequests };
export { IVA_RATE_VALUES, IVA_RATE_LABELS };
export type { InvoiceItemDraft };
