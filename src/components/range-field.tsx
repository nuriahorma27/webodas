"use client";

import { FieldLabel } from "@measured/puck";

export function RangeField({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 5,
  suffix = "%",
}: {
  value?: number | string;
  onChange: (v: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const v = typeof value === "number" ? value : Number(value ?? 0);
  return (
    <FieldLabel label={label ?? "Valor"}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-neutral-900"
        />
        <span className="w-12 text-right text-xs text-neutral-500">
          {v}
          {suffix}
        </span>
      </div>
    </FieldLabel>
  );
}
