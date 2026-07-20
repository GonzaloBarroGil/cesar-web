import type { PaymentResponse } from "@/api/generated/models";
import { MoneyDisplay } from "@/components/shared";
import { PaymentMethodBadge } from "@/features/payments";
import { useNavigate } from "react-router-dom";

const SKELETON_KEYS = ["skel-1", "skel-2", "skel-3"] as const;

interface RecentActivityFeedProps {
  payments: PaymentResponse[];
  loading: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RecentActivityFeed({ payments, loading }: RecentActivityFeedProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700 mb-3">Actividad Reciente</p>
        <div className="space-y-2">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="h-6 bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const recent = [...payments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700 mb-1">Actividad Reciente</p>
        <p className="text-sm text-neutral-400">Sin actividad reciente.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm font-medium text-neutral-700 mb-3">Actividad Reciente</p>
      <div className="space-y-2">
        {recent.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate(`/payments/${p.id}`)}
            className="w-full flex items-center justify-between text-left hover:bg-neutral-50 rounded px-1 py-0.5 -mx-1 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-neutral-400 whitespace-nowrap">
                {formatDate(p.payment_date)}
              </span>
              <span className="text-xs text-neutral-600 truncate">{p.unit_id}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <MoneyDisplay
                amount={{ amount: p.amount.amount, currency: p.amount.currency ?? "ARS" }}
                className="text-sm font-medium"
              />
              <PaymentMethodBadge method={p.method} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { RecentActivityFeed };
export type { RecentActivityFeedProps };
