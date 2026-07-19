const directionMap: Record<string, { label: string; className: string }> = {
  INCOME: { label: "Ingreso", className: "bg-green-100 text-green-800 border-green-200" },
  OUTPUT: { label: "Egreso", className: "bg-red-100 text-red-800 border-red-200" },
};

interface DirectionBadgeProps {
  direction: string;
}

function DirectionBadge({ direction }: DirectionBadgeProps) {
  const config = directionMap[direction] ?? {
    label: direction,
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export { DirectionBadge };
