interface Period {
  id: string;
  code: string;
  status: string;
}

interface PeriodPickerProps {
  periods: Period[];
  value: string;
  onChange: (periodCode: string) => void;
  className?: string;
}

function PeriodPicker({ periods, value, onChange, className }: PeriodPickerProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${className ?? ""}`}
    >
      {periods.length === 0 && (
        <option value="">Sin períodos</option>
      )}
      {periods.map((p) => (
        <option key={p.id} value={p.code}>
          {p.code} {p.status === "OPEN" ? "(Activo)" : p.status === "CLOSED" ? "(Cerrado)" : ""}
        </option>
      ))}
    </select>
  );
}

export { PeriodPicker };
export type { Period };
