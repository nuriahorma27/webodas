"use client";

import { useEffect, useState } from "react";
import { FieldLabel } from "@measured/puck";
import { paletteColors, rememberColor } from "@/lib/colors";

export function ColorField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [swatches, setSwatches] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSwatches(paletteColors());
    sync();
    window.addEventListener("webodas:colors", sync);
    return () => window.removeEventListener("webodas:colors", sync);
  }, []);

  const pick = (c: string) => onChange(c);
  const commit = (c: string) => {
    onChange(c);
    rememberColor(c);
  };

  return (
    <FieldLabel label={label ?? "Color"}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => pick(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-neutral-300"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => pick(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            placeholder="vacío = automático"
            className="w-36 rounded border border-neutral-300 px-2 py-1.5 text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-neutral-500 underline"
            >
              quitar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {swatches.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                commit(c);
              }}
              title={c}
              style={{ background: c }}
              className={`h-8 w-8 rounded border ${
                value?.toLowerCase() === c.toLowerCase()
                  ? "border-neutral-900 ring-2 ring-neutral-900"
                  : "border-neutral-300"
              }`}
            />
          ))}
        </div>
      </div>
    </FieldLabel>
  );
}
