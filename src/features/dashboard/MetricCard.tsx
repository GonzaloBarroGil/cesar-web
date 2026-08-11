import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value?: string;
  description?: string;
  color?: string;
  onClick?: () => void;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  errorMessage?: string;
}

function MetricCard({
  title,
  value,
  description,
  color,
  onClick,
  loading = false,
  error = false,
  empty = false,
  emptyMessage,
  onRetry,
  errorMessage,
}: MetricCardProps) {
  const isClickable = !!onClick;

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 bg-white p-4",
          isClickable && "cursor-pointer hover:shadow-md transition-shadow",
        )}
      >
        <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded mb-3" />
        <div className="h-8 w-32 bg-neutral-100 animate-pulse rounded mb-1" />
        <div className="h-3 w-20 bg-neutral-100 animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-neutral-700 mb-1">{title}</p>
        <p className="text-sm text-red-600">No se pudo cargar.</p>
        {errorMessage && (
          <p className="text-xs text-red-500 mt-1 truncate" title={errorMessage}>
            {errorMessage}
          </p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-800"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 bg-white p-4",
          isClickable && "cursor-pointer hover:shadow-md transition-shadow",
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onClick) onClick();
        }}
      >
        <p className="text-sm font-medium text-neutral-700 mb-1">{title}</p>
        <p className="text-sm text-neutral-400">{emptyMessage ?? "Sin datos."}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-4",
        isClickable && "cursor-pointer hover:shadow-md transition-shadow",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <p className="text-sm font-medium text-neutral-700 mb-1">{title}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", color)}>{value ?? "—"}</p>
      {description && <p className="text-xs text-neutral-400 mt-1">{description}</p>}
    </div>
  );
}

export { MetricCard };
export type { MetricCardProps };
