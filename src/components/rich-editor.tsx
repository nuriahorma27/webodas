"use client";

import { useEffect, useRef, useState } from "react";
import { FieldLabel } from "@measured/puck";
import { paletteColors, rememberColor } from "@/lib/colors";

// Editor visual. En vez de execCommand (poco fiable) envuelve la selección
// manualmente con Range.extractContents + insertNode.
export function RichEditor({
  value,
  onChange,
  label,
  singleLine,
  sinColor,
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  singleLine?: boolean;
  sinColor?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [swatches, setSwatches] = useState<string[]>([]);
  const savedRange = useRef<Range | null>(null);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    const sync = () => setSwatches(paletteColors());
    sync();
    window.addEventListener("webodas:colors", sync);
    return () => window.removeEventListener("webodas:colors", sync);
  }, []);

  // Guardar la selección mientras el foco está en el editor.
  useEffect(() => {
    const onSelChange = () => {
      const el = ref.current;
      const sel = document.getSelection();
      if (!el || !sel || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      if (el.contains(r.commonAncestorContainer)) savedRange.current = r.cloneRange();
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = value ?? "";
    if (incoming === lastEmitted.current) return;
    if (el.contains(document.activeElement) || el === document.activeElement) return;
    if (el.innerHTML !== incoming) el.innerHTML = incoming;
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    lastEmitted.current = el.innerHTML;
    onChange(el.innerHTML);
  };

  const restoreSelection = () => {
    const el = ref.current;
    const r = savedRange.current;
    if (!el || !r || !el.contains(r.commonAncestorContainer)) return false;
    const sel = document.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    return true;
  };

  // Negrita / cursiva / subrayado / tachado: execCommand SÍ alterna bien.
  const exec = (cmd: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (!restoreSelection()) return;
    try {
      document.execCommand("styleWithCSS", false, "false");
      document.execCommand(cmd);
    } catch {
      /* noop */
    }
    emit();
  };

  const clearFormat = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (!restoreSelection()) return;
    try {
      document.execCommand("removeFormat");
    } catch {
      /* noop */
    }
    emit();
  };

  // Color: envolver la selección en un <span style="color">.
  const applyColor = (c: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (!restoreSelection()) return;
    const sel = document.getSelection();
    const r = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    if (!r || r.collapsed) return;
    try {
      const span = document.createElement("span");
      span.style.color = c;
      span.appendChild(r.extractContents());
      r.insertNode(span);
      const nr = document.createRange();
      nr.selectNodeContents(span);
      sel!.removeAllRanges();
      sel!.addRange(nr);
      savedRange.current = nr.cloneRange();
    } catch {
      /* rangos complejos: ignorar */
    }
    rememberColor(c);
    emit();
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

  return (
    <FieldLabel label={label ?? "Texto"}>
      <div className="mb-1 flex flex-wrap items-center gap-1">
        {btn(<b>B</b>, () => exec("bold"), "Negrita")}
        {btn(<i>I</i>, () => exec("italic"), "Cursiva")}
        {btn(<u>U</u>, () => exec("underline"), "Subrayado")}
        {btn(<s>S</s>, () => exec("strikeThrough"), "Tachado")}
        {btn("↺", clearFormat, "Quitar formato de la selección")}
      </div>
      <div className={`mb-1.5 flex-wrap items-center gap-1 ${sinColor ? "hidden" : "flex"}`}>
        <span className="mr-1 text-xs text-neutral-500">Color:</span>
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            title={`Color ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyColor(c)}
            style={{ background: c }}
            className="h-6 w-6 rounded border border-neutral-300"
          />
        ))}
        <label
          className="ml-1 inline-flex h-6 cursor-pointer items-center rounded border border-neutral-300 px-2 text-xs"
          style={{ overflow: "hidden", position: "relative" }}
          title="Otro color"
          onMouseDown={(e) => e.preventDefault()}
        >
          + otro
          <input
            type="color"
            onChange={(e) => applyColor(e.target.value)}
            style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyDown={(e) => {
          if (singleLine && e.key === "Enter") e.preventDefault();
        }}
        data-placeholder="Escribe aquí…"
        className="wf-rich w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        style={{ minHeight: singleLine ? 38 : 90, whiteSpace: "pre-wrap" }}
      />
      <style>{`.wf-rich:empty:before{content:attr(data-placeholder);color:#9ca3af}`}</style>
    </FieldLabel>
  );
}
