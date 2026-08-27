"use client";

import { FieldLabel } from "@measured/puck";

export type TextFormat = { bold?: boolean; italic?: boolean; underline?: boolean };

export function FormatToggle({
  value,
  onChange,
  label,
}: {
  value?: TextFormat;
  onChange: (value: TextFormat) => void;
  label?: string;
}) {
  const v = value ?? {};
  const toggle = (k: keyof TextFormat) => onChange({ ...v, [k]: !v[k] });

  const btn = (k: keyof TextFormat, content: React.ReactNode, style: React.CSSProperties) => (
    <button
      type="button"
      onClick={() => toggle(k)}
      style={style}
      className={`h-8 w-9 rounded border text-sm ${
        v[k] ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"
      }`}
    >
      {content}
    </button>
  );

  return (
    <FieldLabel label={label ?? "Formato"}>
      <div className="flex gap-1.5">
        {btn("bold", "B", { fontWeight: 700 })}
        {btn("italic", "I", { fontStyle: "italic" })}
        {btn("underline", "U", { textDecoration: "underline" })}
      </div>
    </FieldLabel>
  );
}

export function formatStyle(f?: TextFormat): React.CSSProperties {
  const v = f ?? {};
  const s: React.CSSProperties = {};
  if (v.bold) s.fontWeight = 700;
  if (v.italic) s.fontStyle = "italic";
  if (v.underline) s.textDecoration = "underline";
  return s;
}
