"use client";

import { FieldLabel } from "@measured/puck";

export type Offset = { x?: number; y?: number };

const STEP = 8;

export function NudgeField({
  value,
  onChange,
  label,
}: {
  value?: Offset;
  onChange: (value: Offset) => void;
  label?: string;
}) {
  const v = { x: value?.x ?? 0, y: value?.y ?? 0 };
  const move = (dx: number, dy: number) => onChange({ x: v.x + dx, y: v.y + dy });

  const b = (content: string, onClick: () => void, extra = "") => (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 w-8 rounded border border-neutral-300 text-sm hover:bg-neutral-100 ${extra}`}
    >
      {content}
    </button>
  );

  return (
    <FieldLabel label={label ?? "Posición"}>
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          <span />
          {b("↑", () => move(0, -STEP))}
          <span />
          {b("←", () => move(-STEP, 0))}
          {b("•", () => onChange({ x: 0, y: 0 }))}
          {b("→", () => move(STEP, 0))}
          <span />
          {b("↓", () => move(0, STEP))}
          <span />
        </div>
        <span className="text-xs text-neutral-500">
          x: {v.x}px
          <br />y: {v.y}px
        </span>
      </div>
    </FieldLabel>
  );
}

export function offsetTransform(o?: Offset): string | undefined {
  const x = o?.x ?? 0;
  const y = o?.y ?? 0;
  return x || y ? `translate(${x}px, ${y}px)` : undefined;
}
