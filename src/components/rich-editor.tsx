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
}: {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  singleLine?: boolean;
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

  const wrap = (make: () => HTMLElement) => {
    const el = ref.current;
    const r = savedRange.current;
    if (!el || !r || r.collapsed || !el.contains(r.commonAncestorContainer)) return;
    const wrapper = make();
    try {
      wrapper.appendChild(r.extractContents());
      r.insertNode(wrapper);
      // reseleccionar el contenido envuelto
      const sel = document.getSelection();
      const nr = document.createRange();
      nr.selectNodeContents(wrapper);
      sel?.removeAllRanges();
      sel?.addRange(nr);
      savedRange.current = nr.cloneRange();
    } catch {
      /* rangos complejos: ignorar */
    }
    emit();
  };

  const tag = (name: string) => wrap(() => document.createElement(name));
  const styled = (css: Partial<CSSStyleDeclaration>) =>
    wrap(() => {
      const s = document.createElement("span");
      Object.assign(s.style, css);
      return s;
    });

  const clearFormat = () => {
    const el = ref.current;
    const r = savedRange.current;
    if (!el || !r || r.collapsed) return;
    const text = r.toString();
    r.deleteContents();
    r.insertNode(document.createTextNode(text));
    emit();
  };

  const applyColor = (c: string) => {
    styled({ color: c });
    rememberColor(c);
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
        {btn(<b>B</b>, () => tag("strong"), "Negrita")}
        {btn(<i>I</i>, () => tag("em"), "Cursiva")}
        {btn(<u>U</u>, () => styled({ textDecoration: "underline" }), "Subrayado")}
        {btn(<s>S</s>, () => styled({ textDecoration: "line-through" }), "Tachado")}
        {btn("↺", clearFormat, "Quitar formato de la selección")}
      </div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
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
