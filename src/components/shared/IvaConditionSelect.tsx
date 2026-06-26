interface IvaConditionSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ivaConditions = [
  { value: "RI", label: "RI — Responsable Inscripto" },
  { value: "EXENTO", label: "EXENTO — Exento" },
  { value: "MONOTRIBUTISTA", label: "MONOTRIBUTISTA — Monotributista" },
  { value: "CF", label: "CF — Consumidor Final" },
];

function IvaConditionSelect({ value, onChange, className }: IvaConditionSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 ${className ?? ""}`}
    >
      {ivaConditions.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

export { IvaConditionSelect };
