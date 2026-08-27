"use client";

import { useEffect, useState } from "react";
import { FieldLabel } from "@measured/puck";
import { paletteColors, rememberColor } from "@/lib/colors";

const CHECKER =
  "linear-gradient(45deg,#d4d4d4 25%,transparent 25%,transparent 75%,#d4d4d4 75%,#d4d4d4)," +
  "linear-gradient(45deg,#d4d4d4 25%,#fff 25%,#fff 75%,#d4d4d4 75%,#d4d4d4)";

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

  const vacio = !value;

  return (
    <FieldLabel label={label ?? "Color"}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label
            className="relative block h-9 w-12 shrink-0 cursor-pointer overflow-hidden rounded border border-neutral-300"
            title={vacio ? "Automático — pulsa para elegir un color" : value}
            style={
              vacio
                ? { background: CHECKER, backgroundSize: "10px 10px", backgroundPosition: "0 0,5px 5px" }
                : { background: value }
            }
          >
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => pick(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => pick(e.target.value)}
            onBlur={(e) => value && commit(e.target.value)}
            placeholder="Automático"
            className="w-36 rounded border border-neutral-300 px-2 py-1.5 text-xs"
          />
          {!vacio && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-neutral-500 underline"
            >
              automático
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
