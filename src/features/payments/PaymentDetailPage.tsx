import { useGetPayment } from "@/api/generated/payments/payments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PaymentDetail } from "./PaymentDetail";
import { ReverseButton } from "./ReverseButton";

function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: payment,
    isLoading,
    isError,
  } = useGetPayment(id ?? "", {
    query: { enabled: !!id },
  });

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-500 mb-4">Pago no encontrado</p>
        <Link to="/payments">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pagos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/payments"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Pagos
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <ReverseButton paymentId={payment.id} status={payment.status} />
      </div>

      <PaymentDetail payment={payment} />
    </div>
  );
}

export { PaymentDetailPage };
