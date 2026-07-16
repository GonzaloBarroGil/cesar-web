import type { CreateFacturaBRequest, IvaCondition } from "@/api/generated/models";
import { CUITInput, cuitChecksum } from "@/components/shared/CUITInput";
import { IvaConditionSelect } from "@/components/shared/IvaConditionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useState } from "react";
import type { InvoiceItemDraft } from "./InvoiceItems";
import { InvoiceItems, emptyItem, toLineRequests } from "./InvoiceItems";
import { InvoiceTotals, computeTotal } from "./InvoiceTotals";

const CUIT_THRESHOLD = 5000;

interface FacturaBFormProps {
  onSubmit: (data: CreateFacturaBRequest) => void;
  isSubmitting: boolean;
  error?: string | null;
}

function FacturaBForm({ onSubmit, isSubmitting, error }: FacturaBFormProps) {
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
  const [receptorCondicionIva, setReceptorCondicionIva] = useState<string>("CF");
  const [items, setItems] = useState<InvoiceItemDraft[]>([emptyItem()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const total = computeTotal(items, "B");
  const cuitRequired = total >= CUIT_THRESHOLD;

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
    if (cuitRequired && !receptorCuit) {
      errors.receptor_cuit = "CUIT requerido para montos ≥ $5.000.";
    } else if (receptorCuit && !cuitChecksum(receptorCuit)) {
      errors.receptor_cuit = "CUIT invalido. Debe tener 11 digitos.";
    }
    if (receptorCondicionIva === "RI") {
      errors.receptor_condicion_iva = "Para Factura B el receptor no puede ser RI.";
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
      receptor_cuit: receptorCuit || null,
      receptor_razon_social: receptorRazonSocial || null,
      receptor_condicion_iva: receptorCondicionIva as IvaCondition,
      items: toLineRequests(items),
      otros_impuestos: [],
      adicionales_rg: {},
      qr_code: `https://qr.afip.gob.ar?cae=${cae}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Nueva Factura B</h1>
      <p className="text-sm text-neutral-500">
        RI → CF/Exento/Monotributista. IVA no discriminado — incluido en el precio.
      </p>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold mb-2">Comprobante</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fb-consorcio">ID Consorcio</Label>
            <Input
              id="fb-consorcio"
              value={consorcioId}
              onChange={(e) => setConsorcioId(e.target.value)}
              placeholder="UUID del consorcio"
            />
            {fieldErrors.consorcio_id && (
              <p className="text-xs text-red-600">{fieldErrors.consorcio_id}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-punto-venta">Punto de Venta</Label>
            <Input
              id="fb-punto-venta"
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
            <Label htmlFor="fb-fecha-emision">Fecha de Emision</Label>
            <Input
              id="fb-fecha-emision"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
            />
            {fieldErrors.fecha_emision && (
              <p className="text-xs text-red-600">{fieldErrors.fecha_emision}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-cae">CAE</Label>
            <Input
              id="fb-cae"
              value={cae}
              onChange={(e) => setCae(e.target.value)}
              placeholder="14 digitos"
              maxLength={14}
            />
            {fieldErrors.cae && <p className="text-xs text-red-600">{fieldErrors.cae}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-cae-vencimiento">Vencimiento CAE</Label>
            <Input
              id="fb-cae-vencimiento"
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
            <Label htmlFor="fb-emisor-cuit">CUIT Emisor</Label>
            <CUITInput id="fb-emisor-cuit" value={emisorCuit} onChange={setEmisorCuit} />
            {fieldErrors.emisor_cuit && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_cuit}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-emisor-razon">Razon Social Emisor</Label>
            <Input
              id="fb-emisor-razon"
              value={emisorRazonSocial}
              onChange={(e) => setEmisorRazonSocial(e.target.value)}
            />
            {fieldErrors.emisor_razon_social && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_razon_social}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-emisor-domicilio">Domicilio Emisor</Label>
            <Input
              id="fb-emisor-domicilio"
              value={emisorDomicilio}
              onChange={(e) => setEmisorDomicilio(e.target.value)}
            />
            {fieldErrors.emisor_domicilio && (
              <p className="text-xs text-red-600">{fieldErrors.emisor_domicilio}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-emisor-inicio">Inicio de Actividades</Label>
            <Input
              id="fb-emisor-inicio"
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
        <legend className="text-sm font-semibold mb-2">Receptor</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fb-receptor-cuit">
              CUIT Receptor {cuitRequired ? "(requerido)" : "(opcional)"}
            </Label>
            <CUITInput id="fb-receptor-cuit" value={receptorCuit} onChange={setReceptorCuit} />
            {cuitRequired && (
              <p className="text-xs text-neutral-500">
                El CUIT es obligatorio para montos ≥ $5.000 o receptor mayorista.
              </p>
            )}
            {fieldErrors.receptor_cuit && (
              <p className="text-xs text-red-600">{fieldErrors.receptor_cuit}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-receptor-razon">Razon Social Receptor (opcional)</Label>
            <Input
              id="fb-receptor-razon"
              value={receptorRazonSocial}
              onChange={(e) => setReceptorRazonSocial(e.target.value)}
              placeholder="Consumidor Final"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-receptor-iva">Condicion IVA Receptor</Label>
            <IvaConditionSelect
              id="fb-receptor-iva"
              value={receptorCondicionIva}
              onChange={setReceptorCondicionIva}
              className="w-full"
            />
            {fieldErrors.receptor_condicion_iva && (
              <p className="text-xs text-red-600">{fieldErrors.receptor_condicion_iva}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold mb-2">Items (precio con IVA incluido)</legend>
        <InvoiceItems items={items} onChange={setItems} showIva={false} />
        {fieldErrors.items && <p className="text-xs text-red-600">{fieldErrors.items}</p>}
        <InvoiceTotals items={items} variant="B" />
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Emitiendo..." : "Emitir Factura B"}
      </Button>
    </form>
  );
}

export { FacturaBForm };
