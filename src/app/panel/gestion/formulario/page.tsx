"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  loadFormulario,
  addPregunta,
  updatePregunta,
  removePregunta,
  movePregunta,
  setEstandar,
  setIntro,
  INTRO_EJEMPLO,
  type FormularioConfig,
  type PreguntaForm,
} from "@/lib/formulario";

const box =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export default function FormularioPage() {
  const [cfg, setCfg] = useState<FormularioConfig | null>(null);

  useEffect(() => {
    const sync = () => setCfg(loadFormulario());
    sync();
    window.addEventListener("webodas:formulario", sync);
    return () => window.removeEventListener("webodas:formulario", sync);
  }, []);

  if (!cfg) return null;

  const est = cfg.estandar;
  const item = (k: keyof typeof est, texto: string, nota?: string) => (
    <label className="flex items-start gap-2.5 py-1.5 text-sm">
      <input
        type="checkbox"
        checked={est[k]}
        onChange={(e) => setEstandar({ [k]: e.target.checked })}
        className="mt-0.5"
      />
      <span>
        {texto}
        {nota && <span className="block text-xs text-muted">{nota}</span>}
      </span>
    </label>
  );

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg">Cómo funciona el formulario</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["1", "Prepara tu lista", "Ten lista tu lista de invitados y sus columnas.", "/panel/gestion/invitados"],
            ["2", "Crea las preguntas", "Aquí eliges qué se pregunta en el formulario.", null],
            [
              "3",
              "Conecta las respuestas",
              "En Invitados → ⚙ Ajustes eliges en qué columna de tu lista se guarda la respuesta de cada pregunta, para no copiarlas a mano.",
              "/panel/gestion/invitados",
            ],
            ["4", "Ponlo en tu web", "Añade el bloque «Formulario de confirmación»: solo pone el botón que lo abre.", "/panel/webs"],
          ].map(([n, t, d, href]) => (
            <div key={n as string} className="flex gap-3 rounded-lg border border-line p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {n}
              </span>
              <div>
                <p className="text-sm font-medium">{t}</p>
                <p className="text-xs text-muted">{d}</p>
                {href && (
                  <Link href={href as string} className="text-xs text-accent underline">
                    Ir →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg">Texto de introducción</h3>
        <p className="mt-0.5 text-sm text-muted">
          Un mensaje corto que verán al abrir el formulario. Si lo dejas vacío no aparece.
        </p>
        <input
          defaultValue={cfg.intro}
          onBlur={(e) => setIntro(e.target.value)}
          placeholder={`p. ej. «${INTRO_EJEMPLO}»`}
          className={`${box} mt-2`}
        />
      </Card>

      <Card>
        <h3 className="font-display text-lg">Datos estándar</h3>
        <p className="mt-0.5 text-sm text-muted">
          Marca qué datos básicos se piden. El nombre siempre se pide.
        </p>
        <div className="mt-2 divide-y divide-line">
          <label className="flex items-center gap-2.5 py-1.5 text-sm text-muted">
            <input type="checkbox" checked disabled className="mt-0.5" />
            Nombre <span className="text-xs">(siempre)</span>
          </label>
          {item("apellidos", "Apellidos")}
          {item("email", "Email")}
          {item("asiste", "¿Asistirás? (Sí / No)")}
          {item(
            "acompanante",
            "¿Vienes con acompañante? (Sí / No)",
            "Si responde «Sí», se piden el nombre y los apellidos del acompañante.",
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-lg">Preguntas del formulario</h3>

        <div className="rounded-lg border border-dashed border-line p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Del pack estándar</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            <li className="text-muted">Nombre</li>
            {est.apellidos && <li className="text-muted">Apellidos</li>}
            {est.email && <li className="text-muted">Email</li>}
            {est.asiste && <li className="text-muted">¿Asistirás? · Sí / No</li>}
            {est.acompanante && (
              <li className="text-muted">
                ¿Vienes con acompañante? · Sí / No
                <span className="block text-xs">
                  → si «Sí»: Nombre y apellidos del acompañante
                </span>
              </li>
            )}
          </ul>
          <p className="mt-1.5 text-xs text-muted">Se activan y desactivan arriba, en «Datos estándar».</p>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-muted">Preguntas propias</p>
        {cfg.preguntas.length === 0 && (
          <p className="text-sm text-muted">Aún no has añadido ninguna pregunta.</p>
        )}
        {cfg.preguntas.map((q, i) => (
          <PreguntaEditor
            key={q.id}
            q={q}
            numero={i + 1}
            anteriores={cfg.preguntas.slice(0, i)}
            pack={cfg.estandar.acompanante}
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
        <p className="text-sm text-muted">
          Para ver el formulario tal y como lo verán tus invitados, ábrelo desde el botón «Ver web»
          del editor, o desde la propia web publicada.
        </p>
      </Card>
    </div>
  );
}

function PreguntaEditor({
  q,
  numero,
  anteriores,
  pack,
  primero,
  ultimo,
}: {
  q: PreguntaForm;
  numero: number;
  anteriores: PreguntaForm[];
  pack: boolean;
  primero: boolean;
  ultimo: boolean;
}) {
  const [mostrarCond, setMostrarCond] = useState(false);
  const tieneCond = Boolean(q.condLabel) || mostrarCond;

  const dependeDe = [
    ...(pack ? [{ value: "¿Vienes con acompañante?", label: "¿Vienes con acompañante?" }] : []),
    ...anteriores.filter((p) => p.label).map((p) => ({ value: p.label, label: p.label })),
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

  const quitarCond = () => {
    updatePregunta(q.id, { condLabel: "", condValue: "" });
    setMostrarCond(false);
  };

  return (
    <div className="rounded-lg border border-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Pregunta {numero}
        </span>
        <div className="flex items-center gap-1 text-base text-muted">
          <button
            onClick={() => movePregunta(q.id, -1)}
            disabled={primero}
            className="px-1 hover:text-foreground disabled:opacity-20"
            title="Subir"
          >
            ↑
          </button>
          <button
            onClick={() => movePregunta(q.id, 1)}
            disabled={ultimo}
            className="px-1 hover:text-foreground disabled:opacity-20"
            title="Bajar"
          >
            ↓
          </button>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar la pregunta "${q.label || "sin texto"}"?`)) removePregunta(q.id);
            }}
            className="px-1 text-sm hover:text-red-600"
            title="Eliminar"
          >
            🗑
          </button>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-muted">Texto de la pregunta</span>
        <input
          className={`${box} mt-1`}
          placeholder="p. ej. ¿Necesitas autobús?"
          defaultValue={q.label}
          onBlur={(e) => updatePregunta(q.id, { label: e.target.value })}
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Tipo de respuesta</span>
        <select
          className={`${box} mt-1`}
          value={q.qtype}
          onChange={(e) => updatePregunta(q.id, { qtype: e.target.value as PreguntaForm["qtype"] })}
        >
          <option value="texto">Texto libre</option>
          <option value="si-no">Sí / No</option>
          <option value="opcion">Elegir una opción de una lista</option>
          <option value="numero">Un número</option>
        </select>
      </label>

      {q.qtype === "opcion" && (
        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Opciones (separadas por comas)</span>
          <input
            className={`${box} mt-1`}
            placeholder="Normal, Vegetariano, Sin gluten, Infantil"
            defaultValue={q.options}
            onBlur={(e) => updatePregunta(q.id, { options: e.target.value })}
          />
        </label>
      )}

      <div className="mt-3">
        {!tieneCond ? (
          <button
            onClick={() => setMostrarCond(true)}
            className="text-xs font-medium text-accent hover:underline"
          >
            + Mostrar esta pregunta solo en algunos casos
          </button>
        ) : (
          <div className="rounded-md bg-accent-soft/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">
                Mostrar esta pregunta solo si…
              </span>
              <button onClick={quitarCond} className="text-xs text-muted underline hover:text-red-600">
                quitar condición
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select
                className={box}
                value={q.condLabel}
                onChange={(e) => updatePregunta(q.id, { condLabel: e.target.value, condValue: "" })}
              >
                <option value="">la respuesta a…</option>
                {dependeDe.map((o) => (
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
                    <option value="">…es…</option>
                    {respuestas.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={box}
                    placeholder="…es (respuesta exacta)"
                    defaultValue={q.condValue}
                    onBlur={(e) => updatePregunta(q.id, { condValue: e.target.value })}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
