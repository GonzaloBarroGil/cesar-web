import { cn } from "@/lib/utils";

type StatusColor = "green" | "red" | "yellow" | "blue" | "purple" | "grey" | "orange";

const statusMap: Record<string, { label: string; color: StatusColor; strikethrough?: boolean }> = {
  ACTIVE: { label: "Activo", color: "green" },
  APPROVED: { label: "Aprobado", color: "green" },
  PENDING: { label: "Pendiente", color: "yellow" },
  REJECTED: { label: "Rechazado", color: "red" },
  DRAFT: { label: "Borrador", color: "blue" },
  ISSUED: { label: "Emitido", color: "purple" },
  CANCELLED: { label: "Cancelado", color: "grey" },
  REVERSED: { label: "Revertido", color: "orange" },
  ANULADA: { label: "Anulado", color: "grey", strikethrough: true },
  VIGENTE: { label: "Vigente", color: "green" },
  EJECUTADO: { label: "Ejecutado", color: "blue" },
  OPEN: { label: "Abierto", color: "blue" },
  CLOSED: { label: "Cerrado", color: "grey" },
  ARCHIVED: { label: "Archivado", color: "grey" },
  INCOME: { label: "Ingreso", color: "green" },
  OUTPUT: { label: "Egreso", color: "red" },
  ORDINARIA: { label: "Ordinaria", color: "blue" },
  EXTRAORDINARIA: { label: "Extraordinaria", color: "yellow" },
};

const colorClasses: Record<StatusColor, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  grey: "bg-neutral-100 text-neutral-600 border-neutral-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, color: "grey" as StatusColor };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        colorClasses[config.color],
        config.strikethrough && "line-through",
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export { StatusBadge };
