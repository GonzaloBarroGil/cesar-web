import { useDownloadLiquidacionPdf } from "@/api/generated/debt/debt";
import type { LiquidacionStatus } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";

interface PdfButtonProps {
  liquidacionId: string;
  status: LiquidacionStatus;
}

function PdfButton({ liquidacionId, status }: PdfButtonProps) {
  const [pdfUnavailable, setPdfUnavailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { refetch } = useDownloadLiquidacionPdf(liquidacionId, {
    query: { enabled: false, retry: false },
  });

  const isDraft = status === "DRAFT";
  const disabled = isDraft || pdfUnavailable || isDownloading;

  const tooltip = isDraft
    ? "Emita la liquidacion primero"
    : pdfUnavailable
      ? "Descarga de PDF no disponible proximamente"
      : "Descargar PDF";

  const handleClick = async () => {
    setIsDownloading(true);
    try {
      const result = await refetch();
      if (result.error) {
        setPdfUnavailable(true);
      }
    } catch {
      setPdfUnavailable(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <span title={tooltip}>
      <Button variant="outline" size="sm" disabled={disabled} onClick={handleClick}>
        <FileDown className="h-4 w-4 mr-1" />
        {isDownloading ? "Descargando..." : "Descargar PDF"}
      </Button>
    </span>
  );
}

export { PdfButton };
