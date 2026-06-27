import { apiClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";

interface HealthResponse {
  status: "ok" | "degraded";
  postgres?: string;
  redis?: string;
  nats?: string;
}

function HealthIndicator() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient<HealthResponse>({ url: "/health", method: "GET" }),
    refetchInterval: 30_000,
    retry: false,
  });

  const status = isError
    ? "offline"
    : isLoading
      ? "loading"
      : data?.status === "ok"
        ? "online"
        : "degraded";

  const colors = {
    online: "bg-green-500",
    degraded: "bg-yellow-500",
    offline: "bg-red-500",
    loading: "bg-neutral-300 animate-pulse",
  };

  const labels = {
    online: "Servicios operativos",
    degraded: "Algunos servicios están degradados",
    offline: "Servicio no disponible",
    loading: "Verificando servicios...",
  };

  return (
    <output
      className="inline-flex items-center gap-1.5 text-xs text-neutral-500"
      aria-live="polite"
      aria-label={labels[status]}
      title={labels[status]}
    >
      <span className={`h-2 w-2 rounded-full ${colors[status]}`} aria-hidden="true" />
      <span className="hidden sm:inline">{labels[status]}</span>
    </output>
  );
}

export { HealthIndicator };
