interface CaeQrDisplayProps {
  cae: string;
  caeVencimiento?: string;
  qrCode?: string;
}

function CaeQrDisplay({ cae, caeVencimiento, qrCode }: CaeQrDisplayProps) {
  const expired = caeVencimiento ? new Date(caeVencimiento).getTime() < Date.now() : false;

  return (
    <div className="rounded-lg border p-4 flex items-center justify-between gap-4 mb-6">
      <div>
        <span className="text-xs text-neutral-500">CAE</span>
        <p className="text-sm font-medium tabular-nums">{cae}</p>
        {caeVencimiento && (
          <p className={`text-xs mt-1 ${expired ? "text-yellow-700" : "text-neutral-500"}`}>
            Vencimiento: {new Date(caeVencimiento).toLocaleDateString("es-AR")}
            {expired && " — CAE vencido"}
          </p>
        )}
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium mt-2 ${
            expired
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-green-100 text-green-800 border-green-200"
          }`}
        >
          {expired ? "CAE vencido" : "CAE valido"}
        </span>
      </div>
      <div
        aria-label="Codigo QR ARCA"
        className="h-24 w-24 shrink-0 rounded-md border bg-neutral-50 flex items-center justify-center text-center"
        title={qrCode}
      >
        <span className="text-[10px] text-neutral-500 px-2">QR ARCA (RG 4892/2020)</span>
      </div>
    </div>
  );
}

export { CaeQrDisplay };
