import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";
import { useCallback, useEffect, useState } from "react";

function cuitChecksum(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit)) return false;
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = cuit.slice(0, 10).split("").map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (multipliers[i] ?? 0), 0);
  const mod = 11 - (sum % 11);
  const checkDigit = mod === 11 ? 0 : mod === 10 ? 9 : mod;
  return checkDigit === Number(cuit[10]);
}

function getValidationError(value: string): string | null {
  if (value.length === 0) return null;
  if (value.length < 11) {
    return `CUIT debe tener 11 dígitos (${value.length}/11).`;
  }
  if (value.length === 11 && !cuitChecksum(value)) {
    return "CUIT inválido. Verifique los dígitos.";
  }
  return null;
}

interface CUITInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

function CUITInput({ value, onChange, className, ...props }: CUITInputProps) {
  const [error, setError] = useState<string | null>(() => getValidationError(value));

  useEffect(() => {
    setError(getValidationError(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
      onChange(raw);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        className={cn(error && "border-red-300 focus-visible:ring-red-400", className)}
        placeholder="XX-XXXXXXXX-X"
        maxLength={13}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export { CUITInput, cuitChecksum };
