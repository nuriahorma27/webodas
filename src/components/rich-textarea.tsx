"use client";

import { useEffect, useRef, useState } from "react";
import { FieldLabel } from "@measured/puck";
import { paletteColors, rememberColor } from "@/lib/colors";

// Textarea con barra de formato: selecciona texto y pulsa B / I / U / S o un color
// para aplicarlo solo a esa parte. Si no hay nada seleccionado, se aplica a todo.
// Guarda una cadena con marcadores: **negrita** //cursiva// __subr__ ~~tach~~ {{#color|texto}}
export function RichTextarea({
  value,
  onChange,
  label,
  singleLine,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  singleLine?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [swatches, setSwatches] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSwatches(paletteColors());
    sync();
    window.addEventListener("webodas:colors", sync);
    return () => window.removeEventListener("webodas:colors", sync);
  }, []);

  const apply = (start: string, end: string) => {
    const el = ref.current;
    const text = value ?? "";
    let s = el?.selectionStart ?? 0;
    let e = el?.selectionEnd ?? 0;
    if (s === e) {
      s = 0;
      e = text.length;
    }
    const sel = text.slice(s, e);
    if (!sel) return;
    const next = text.slice(0, s) + start + sel + end + text.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(s + start.length, s + start.length + sel.length);
    });
  };

  const btn = (content: React.ReactNode, onClick: () => void, title: string) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded border border-neutral-300 text-xs hover:bg-neutral-100"
    >
      {content}
    </button>
  );

  const applyColor = (c: string) => {
    apply(`{{${c}|`, "}}");
    rememberColor(c);
  };

  return (
    <FieldLabel label={label ?? "Texto"}>
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        {btn(<b>B</b>, () => apply("**", "**"), "Negrita")}
        {btn(<i>I</i>, () => apply("//", "//"), "Cursiva")}
        {btn(<u>U</u>, () => apply("__", "__"), "Subrayado")}
        {btn(<s>S</s>, () => apply("~~", "~~"), "Tachado")}
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <label
          className="grid h-7 w-7 cursor-pointer place-items-center rounded border border-neutral-300"
          title="Color personalizado"
          style={{ position: "relative" }}
        >
          <span style={{ fontSize: 13 }}>+</span>
          <input
            type="color"
            onChange={(e) => applyColor(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            title={`Color ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyColor(c)}
            style={{ background: c }}
            className="h-7 w-7 rounded border border-neutral-300"
          />
        ))}
      </div>
      <textarea
        ref={ref}
        value={value ?? ""}
        rows={singleLine ? 1 : 4}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </FieldLabel>
  );
}
