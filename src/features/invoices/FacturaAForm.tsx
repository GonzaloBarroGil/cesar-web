import type { CreateFacturaARequest } from "@/api/generated/models";
import { CUITInput, cuitChecksum } from "@/components/shared/CUITInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";
import type { InvoiceItemDraft } from "./InvoiceItems";
import { InvoiceItems, emptyItem, toLineRequests } from "./InvoiceItems";
import { InvoiceTotals } from "./InvoiceTotals";

interface FacturaAFormProps {
  onSubmit: (data: CreateFacturaARequest) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function FacturaAForm({ onSubmit, isSubmitting, error }: FacturaAFormProps) {
  const [consorcioId, setConsorcioId] = useState("");
  const [puntoVenta, setPuntoVenta] = useState("1");
  const [fechaEmision, setFechaEmision] = useState(() => new Date().toISOString().slice(0, 10));
  const [cae, setCae] = useState("");
  const [caeVencimiento, setCaeVencimiento] = useState("");
  const [emisorCuit, setEmisorCuit] = useState("");
  const [emisorRazonSocial, setEmisorRazonSocial] = useState("");
  const [emisorDomicilio, setEmisorDomicilio] = useState("");
  const [emisorInicioActividades, setEmisorInicioActividades] = useState("");
  const [receptorCuit, setReceptorCuit] = useState("");
  const [receptorRazonSocial, setReceptorRazonSocial] = useState("");
  const [receptorDomicilio, setReceptorDomicilio] = useState("");
  const [campo17, setCampo17] = useState("");
  const [campo181, setCampo181] = useState("");
  const [campo182, setCampo182] = useState("");
  const [items, setItems] = useState<InvoiceItemDraft[]>([emptyItem()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!consorcioId.trim()) errors.consorcio_id = "El consorcio es requerido.";
    if (!puntoVenta || Number.parseInt(puntoVenta, 10) < 1) {
      errors.punto_venta = "El punto de venta debe ser mayor a 0.";
    }
    if (!fechaEmision) errors.fecha_emision = "La fecha de emision es requerida.";
    if (!/^[A-Za-z0-9]{10,}$/.test(cae)) {
      errors.cae = "El CAE debe ser alfanumerico de al menos 10 caracteres.";
    }
    if (!caeVencimiento) errors.cae_vencimiento = "El vencimiento del CAE es requerido.";
    if (!cuitChecksum(emisorCuit)) errors.emisor_cuit = "CUIT del emisor invalido.";
    if (!emisorRazonSocial.trim()) errors.emisor_razon_social = "La razon social es requerida.";
    if (!emisorDomicilio.trim()) errors.emisor_domicilio = "El domicilio es requerido.";
    if (!emisorInicioActividades) {
      errors.emisor_inicio_actividades = "El inicio de actividades es requerido.";
    }
    if (!receptorCuit) {
      errors.receptor_cuit = "CUIT del receptor es requerido para Factura A.";
    } else if (!cuitChecksum(receptorCuit)) {
      errors.receptor_cuit = "CUIT invalido. Debe tener 11 digitos.";
    }
    if (!receptorRazonSocial.trim()) {
      errors.receptor_razon_social = "La razon social del receptor es requerida.";
    }
    if (!receptorDomicilio.trim()) {
      errors.receptor_domicilio = "El domicilio del receptor es requerido.";
    }
    if (
      items.length === 0 ||
      items.some((i) => !i.descripcion.trim() || Number.parseFloat(i.precio_unitario) <= 0)
    ) {
      errors.items = "Cada item debe tener descripcion y precio mayor a 0.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const adicionalesRg: Record<string, string> = {};
    if (campo17.trim()) adicionalesRg.campo_17 = campo17.trim();
    if (campo181.trim()) adicionalesRg.campo_18_1 = campo181.trim();
    if (campo182.trim()) adicionalesRg.campo_18_2 = campo182.trim();

    onSubmit({
      consorcio_id: consorcioId,
      punto_venta: Number.parseInt(puntoVenta, 10),
      cae,
      cae_vencimiento: caeVencimiento,
      fecha_emision: fechaEmision,
      emisor_cuit: emisorCuit,
      emisor_razon_social: emisorRazonSocial,
      emisor_domicilio: emisorDomicilio,
      emisor_inicio_actividades: emisorInicioActividades,
      receptor_cuit: receptorCuit,
      receptor_razon_social: receptorRazonSocial,
      receptor_domicilio: receptorDomicilio,
      items: toLineRequests(items),
      otros_impuestos: [],
      adicionales_rg: adicionalesRg,
      qr_code: `https://qr.afip.gob.ar?cae=${cae}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Nueva Factura A</h1>
      <p className="text-sm text-neutral-500">
        RI → RI. IVA discriminado por alicuota. CUIT del receptor obligatorio.
      </p>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold mb-2">Comprobante</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fa-consorcio">ID Consorcio</Label>
            <Input
              id="fa-consorcio"
              value={consorcioId}
              onChange={(e) => setConsorcioId(e.target.value)}
              placeholder="UUID del consorcio"
            />
            {fieldErrors.consorcio_id && (
              <p className="text-xs text-red-600">{fieldErrors.consorcio_id}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-punto-venta">Punto de Venta</Label>
            <Input
              id="fa-punto-venta"
              type="number"
              min={1}
              max={65535}
              value={puntoVenta}
              onChange={(e) => setPuntoVenta(e.target.value)}
            />
            {fieldErrors.punto_venta && (
              <p className="text-xs text-red-600">{fieldErrors.punto_venta}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-fecha-emision">Fecha de Emision</Label>
            <Input
              id="fa-fecha-emision"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
            />
            {fieldErrors.fecha_emision && (
              <p className="text-xs text-red-600">{fieldErrors.fecha_emision}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-cae">CAE</Label>
            <Input
              id="fa-cae"
              value={cae}
              onChange={(e) => setCae(e.target.value)}
              placeholder="14 digitos"
              maxLength={14}
            />
            {fieldErrors.cae && <p className="text-xs text-red-600">{fieldErrors.cae}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-cae-vencimiento">Vencimiento CAE</Label>
            <Input
              id="fa-cae-vencimiento"
              type="date"
              value={caeVencimiento}
              onChange={(e) => setCaeVencimiento(e.target.value)}
            />
            {fieldErrors.cae_vencimiento && (
              <p className="text-xs text-red-600">{fieldErrors.cae_vencimiento}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold mb-2">Emisor</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fa-emisor-cuit">CUIT Emisor</Label>
            <CUITInput id="fa-emisor-cuit" value={emisorCuit} onChange={setEmisorCuit} />
            {fieldErrors.emisor_cuit && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_cuit}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-emisor-razon">Razon Social Emisor</Label>
            <Input
              id="fa-emisor-razon"
              value={emisorRazonSocial}
              onChange={(e) => setEmisorRazonSocial(e.target.value)}
            />
            {fieldErrors.emisor_razon_social && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_razon_social}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-emisor-domicilio">Domicilio Emisor</Label>
            <Input
              id="fa-emisor-domicilio"
              value={emisorDomicilio}
              onChange={(e) => setEmisorDomicilio(e.target.value)}
            />
            {fieldErrors.emisor_domicilio && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_domicilio}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-emisor-inicio">Inicio de Actividades</Label>
            <Input
              id="fa-emisor-inicio"
              type="date"
              value={emisorInicioActividades}
              onChange={(e) => setEmisorInicioActividades(e.target.value)}
            />
            {fieldErrors.emisor_inicio_actividades && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_inicio_actividades}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold mb-2">Receptor (RI)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fa-receptor-cuit">CUIT Receptor</Label>
            <CUITInput id="fa-receptor-cuit" value={receptorCuit} onChange={setReceptorCuit} />
            {fieldErrors.receptor_cuit && (
              <p className="text-xs text-red-600">{fieldErrors.receptor_cuit}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-receptor-razon">Razon Social Receptor</Label>
            <Input
              id="fa-receptor-razon"
              value={receptorRazonSocial}
              onChange={(e) => setReceptorRazonSocial(e.target.value)}
            />
            {fieldErrors.receptor_razon_social && (
              <p className="text-xs text-red-600">{fieldErrors.receptor_razon_social}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-receptor-domicilio">Domicilio Receptor</Label>
            <Input
              id="fa-receptor-domicilio"
              value={receptorDomicilio}
              onChange={(e) => setReceptorDomicilio(e.target.value)}
            />
            {fieldErrors.receptor_domicilio && (
              <p className="text-xs text-red-600">{fieldErrors.receptor_domicilio}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-receptor-iva">Condicion IVA</Label>
            <Input id="fa-receptor-iva" value="RI — Responsable Inscripto" disabled />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-2">Items</legend>
        <InvoiceItems items={items} onChange={setItems} showIva />
        {fieldErrors.items && <p className="text-xs text-red-600">{fieldErrors.items}</p>}
        <InvoiceTotals items={items} variant="A" />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold mb-2">Adicionales RG (opcional)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fa-campo-17">Campo 17 (tipo)</Label>
            <Input
              id="fa-campo-17"
              value={campo17}
              onChange={(e) => setCampo17(e.target.value)}
              placeholder="IVA"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-campo-18-1">Campo 18.1 (alicuota)</Label>
            <Input
              id="fa-campo-18-1"
              value={campo181}
              onChange={(e) => setCampo181(e.target.value)}
              placeholder="21%"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fa-campo-18-2">Campo 18.2 (monto IVA)</Label>
            <Input
              id="fa-campo-18-2"
              value={campo182}
              onChange={(e) => setCampo182(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Emitiendo..." : "Emitir Factura A"}
      </Button>
    </form>
  );
}

export { FacturaAForm };
