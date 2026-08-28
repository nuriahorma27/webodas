"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { RsvpForm } from "@/components/rsvp-form";
import {
  loadFormulario,
  addPregunta,
  updatePregunta,
  removePregunta,
  movePregunta,
  setPack,
  setIntro,
  type FormularioConfig,
  type PreguntaForm,
} from "@/lib/formulario";

const box =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

const PACK = ["Nombre", "Apellidos", "Email", "¿Asistirás?", "¿Vienes con acompañante? (+ nombre y apellidos)"];

export default function FormularioPage() {
  const [cfg, setCfg] = useState<FormularioConfig | null>(null);

  useEffect(() => {
    const sync = () => setCfg(loadFormulario());
    sync();
    window.addEventListener("webodas:formulario", sync);
    return () => window.removeEventListener("webodas:formulario", sync);
  }, []);

  if (!cfg) return null;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg">Cómo funciona</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>
            Antes de nada, ten tu{" "}
            <Link href="/panel/gestion/invitados" className="text-accent underline">
              lista de invitados
            </Link>{" "}
            y sus columnas listas.
          </li>
          <li>Aquí defines las preguntas del formulario.</li>
          <li>
            En <Link href="/panel/gestion/invitados" className="text-accent underline">Invitados → ⚙ Ajustes</Link>{" "}
            asocias cada pregunta a una columna, para que las respuestas se vuelquen solas.
          </li>
          <li>
            En el <Link href="/panel/webs" className="text-accent underline">editor de tu web</Link> añades el
            bloque «Confirmación (RSVP)»: solo pone el botón que abre este formulario.
          </li>
        </ol>
      </Card>

      <Card className="space-y-4">
        <div>
          <h3 className="font-display text-lg">Datos que siempre se piden</h3>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfg.pack}
              onChange={(e) => setPack(e.target.checked)}
            />
            Pedir el pack estándar
          </label>
          {cfg.pack && (
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
              {PACK.map((p) => (
                <li key={p} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-accent">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="block">
          <span className="text-xs text-muted">Texto de introducción del formulario</span>
          <input
            defaultValue={cfg.intro}
            onBlur={(e) => setIntro(e.target.value)}
            className={box}
          />
        </label>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-lg">Preguntas</h3>
        {cfg.preguntas.length === 0 && (
          <p className="text-sm text-muted">Aún no has añadido ninguna pregunta.</p>
        )}
        {cfg.preguntas.map((q, i) => (
          <PreguntaEditor
            key={q.id}
            q={q}
            anteriores={cfg.preguntas.slice(0, i)}
            pack={cfg.pack}
            primero={i === 0}
            ultimo={i === cfg.preguntas.length - 1}
          />
        ))}
        <button
          onClick={() => addPregunta()}
          className="w-full rounded-md border border-dashed border-line py-2 text-sm font-medium text-accent hover:border-accent"
        >
          + Añadir pregunta
        </button>
      </Card>

      <Card>
        <h3 className="font-display text-lg">Vista previa</h3>
        <p className="mt-1 text-sm text-muted">Así verán el formulario tus invitados:</p>
        <RsvpForm buttonLabel="Abrir el formulario" />
      </Card>
    </div>
  );
}

function PreguntaEditor({
  q,
  anteriores,
  pack,
  primero,
  ultimo,
}: {
  q: PreguntaForm;
  anteriores: PreguntaForm[];
  pack: boolean;
  primero: boolean;
  ultimo: boolean;
}) {
  const condOpciones = [
    { label: "Siempre visible", value: "" },
    ...(pack ? [{ label: "…si viene con acompañante", value: "¿Vienes con acompañante?" }] : []),
    ...anteriores.filter((p) => p.label).map((p) => ({ label: `…según «${p.label}»`, value: p.label })),
  ];
  const target = anteriores.find((p) => p.label === q.condLabel);
  const respuestas =
    q.condLabel === "¿Vienes con acompañante?"
      ? ["Sí", "No"]
      : target?.qtype === "si-no"
        ? ["Sí", "No"]
        : target?.qtype === "opcion"
          ? (target.options ?? "").split(",").map((o) => o.trim()).filter(Boolean)
          : [];

  return (
    <div className="space-y-2 rounded-md border border-line p-3">
      <div className="flex items-center gap-1">
        <input
          className={box}
          placeholder="Pregunta"
          defaultValue={q.label}
          onBlur={(e) => updatePregunta(q.id, { label: e.target.value })}
        />
        <button onClick={() => movePregunta(q.id, -1)} disabled={primero} className="px-1 text-muted disabled:opacity-25">
          ↑
        </button>
        <button onClick={() => movePregunta(q.id, 1)} disabled={ultimo} className="px-1 text-muted disabled:opacity-25">
          ↓
        </button>
        <button onClick={() => removePregunta(q.id)} className="px-1 text-muted hover:text-red-600">
          ✕
        </button>
      </div>

      <select
        className={box}
        value={q.qtype}
        onChange={(e) => updatePregunta(q.id, { qtype: e.target.value as PreguntaForm["qtype"] })}
      >
        <option value="texto">Texto libre</option>
        <option value="si-no">Sí / No</option>
        <option value="opcion">Elegir de una lista</option>
        <option value="numero">Número</option>
      </select>

      {q.qtype === "opcion" && (
        <input
          className={box}
          placeholder="Opciones separadas por comas"
          defaultValue={q.options}
          onBlur={(e) => updatePregunta(q.id, { options: e.target.value })}
        />
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <select
          className={box}
          value={q.condLabel}
          onChange={(e) => updatePregunta(q.id, { condLabel: e.target.value, condValue: "" })}
        >
          {condOpciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {q.condLabel &&
          (respuestas.length > 0 ? (
            <select
              className={box}
              value={q.condValue}
              onChange={(e) => updatePregunta(q.id, { condValue: e.target.value })}
            >
              <option value="">respuesta…</option>
              {respuestas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          ) : (
            <input
              className={box}
              placeholder="respuesta exacta"
              defaultValue={q.condValue}
              onBlur={(e) => updatePregunta(q.id, { condValue: e.target.value })}
            />
          ))}
      </div>
    </div>
  );
}
