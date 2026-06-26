import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: { amount: string; currency: string };
  className?: string;
  showColor?: boolean;
}

function MoneyDisplay({ amount, className, showColor = false }: MoneyDisplayProps) {
  const value = parseFloat(amount.amount || "0");
  const formatted = Number.isNaN(value)
    ? "$ 0,00"
    : new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: amount.currency || "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

  return (
    <span
      className={cn(
        "tabular-nums",
        showColor && value > 0 && "text-green-600",
        showColor && value < 0 && "text-red-600",
        className,
      )}
    >
      {formatted}
    </span>
  );
}

export { MoneyDisplay };
