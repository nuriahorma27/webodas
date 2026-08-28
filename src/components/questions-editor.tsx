"use client";

import { usePuck, FieldLabel } from "@measured/puck";
import { loadColumnas, COLUMNAS_SUGERIDAS } from "@/lib/invitados";

export type Q = {
  label: string;
  qtype: string;
  options: string;
  condLabel: string;
  condValue: string;
  columna?: string;
};

const PACK_ITEMS = [
  "Nombre",
  "Apellidos",
  "¿Asistirás?",
  "¿Vienes con acompañante?",
  "Nombre del acompañante",
  "Apellidos del acompañante",
];

const box =
  "w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-neutral-900";

const empty: Q = { label: "", qtype: "texto", options: "", condLabel: "", condValue: "", columna: "" };

export function QuestionsEditor({
  value,
  onChange,
}: {
  value?: Q[];
  onChange: (v: Q[]) => void;
}) {
  const { selectedItem } = usePuck();
  const packOn = (selectedItem?.props?.packEstandar as string) !== "no";
  const list: Q[] = value ?? [];

  const colNames = Array.from(
    new Set([
      ...loadColumnas().map((c) => c.nombre),
      ...COLUMNAS_SUGERIDAS.map((c) => c.nombre),
    ]),
  );

  const upd = (i: number, patch: Partial<Q>) =>
    onChange(list.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const del = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...list, { ...empty, label: "Nueva pregunta" }]);

  // Opciones para la condición: pack + preguntas anteriores
  const condOptionsFor = (i: number) => {
    const prev = list.slice(0, i).filter((q) => q.label);
    const opts: { label: string; value: string }[] = [{ label: "Siempre visible", value: "" }];
    if (packOn) opts.push({ label: "…viene con acompañante", value: "¿Vienes con acompañante?" });
    prev.forEach((q) => opts.push({ label: `…la pregunta «${q.label}»`, value: q.label }));
    return opts;
  };
  const answerOptionsFor = (q: Q): string[] => {
    if (q.condLabel === "¿Vienes con acompañante?") return ["Sí", "No"];
    const target = list.find((x) => x.label === q.condLabel);
    if (target?.qtype === "si-no") return ["Sí", "No"];
    if (target?.qtype === "opcion")
      return (target.options ?? "").split(",").map((o) => o.trim()).filter(Boolean);
    return [];
  };

  return (
    <FieldLabel label="Preguntas">
      <div className="space-y-2">
        {packOn &&
          PACK_ITEMS.map((t) => (
            <div
              key={t}
              className="flex items-center justify-between rounded-md px-3 py-2 text-xs"
              style={{
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
              }}
            >
              <span>{t}</span>
              <span className="opacity-70">del pack</span>
            </div>
          ))}

        {list.map((q, i) => {
          const answers = answerOptionsFor(q);
          return (
            <div key={i} className="space-y-2 rounded-md border border-neutral-200 p-3">
              <div className="flex items-center gap-1">
                <input
                  className={box}
                  placeholder="Pregunta"
                  value={q.label}
                  onChange={(e) => upd(i, { label: e.target.value })}
                />
                <button type="button" onClick={() => move(i, -1)} className="px-1 text-neutral-400 hover:text-neutral-900">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1 text-neutral-400 hover:text-neutral-900">↓</button>
                <button type="button" onClick={() => del(i)} className="px-1 text-neutral-400 hover:text-red-600">✕</button>
              </div>

              <select className={box} value={q.qtype} onChange={(e) => upd(i, { qtype: e.target.value })}>
                <option value="texto">Texto libre</option>
                <option value="si-no">Sí / No</option>
                <option value="opcion">Opción de una lista</option>
                <option value="numero">Número</option>
              </select>

              {q.qtype === "opcion" && (
                <input
                  className={box}
                  placeholder="Opciones separadas por comas"
                  value={q.options}
                  onChange={(e) => upd(i, { options: e.target.value })}
                />
              )}

              <label className="block text-[11px] text-neutral-500">
                Guardar la respuesta en la columna de invitados:
                <input
                  className={box + " mt-1"}
                  list="cols-invitados"
                  placeholder="(ninguna)"
                  value={q.columna ?? ""}
                  onChange={(e) => upd(i, { columna: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className={box}
                  value={q.condLabel}
                  onChange={(e) => upd(i, { condLabel: e.target.value, condValue: "" })}
                >
                  {condOptionsFor(i).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {q.condLabel &&
                  (answers.length > 0 ? (
                    <select className={box} value={q.condValue} onChange={(e) => upd(i, { condValue: e.target.value })}>
                      <option value="">respuesta…</option>
                      {answers.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={box}
                      placeholder="respuesta exacta"
                      value={q.condValue}
                      onChange={(e) => upd(i, { condValue: e.target.value })}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={add}
          className="w-full rounded-md border border-dashed border-neutral-300 py-2 text-xs text-neutral-600 hover:border-neutral-500"
        >
          + Añadir pregunta
        </button>

        <datalist id="cols-invitados">
          {colNames.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </FieldLabel>
  );
}
