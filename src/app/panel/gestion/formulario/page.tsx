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
  moveItem,
  setEstandar,
  setIntro,
  INTRO_EJEMPLO,
  CLAVES_ESTANDAR,
  type FormularioConfig,
  type PreguntaForm,
  type ClaveEstandar,
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

  const NOTA_ESTANDAR: Partial<Record<ClaveEstandar, string>> = {
    acompanante: "Si responde «Sí», se le piden nombre y apellidos del acompañante.",
    alergias: "Se pregunta al invitado y, si trae acompañante, también por las de su acompañante.",
    bus: "Se pregunta una vez y cuenta también para el acompañante.",
  };
  const TEXTO_ESTANDAR: Record<ClaveEstandar, string> = {
    apellidos: "Apellidos",
    email: "Email",
    asiste: "¿Asistirás? (Sí / No)",
    acompanante: "¿Vienes con acompañante? (Sí / No)",
    alergias: "Alergias / intolerancias",
    bus: "Autobús (¿lo necesita? + ida y vuelta)",
  };

  const toggleEstandar = (k: ClaveEstandar, v: boolean) =>
    setEstandar(k === "alergias" ? { alergias: v, alergiasAcomp: v } : { [k]: v });

  // Contenido de una fila de dato estándar (sin el envoltorio de orden).
  const contenidoEstandar = (k: ClaveEstandar) => (
    <div className="text-sm">
      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={est[k]}
          onChange={(e) => toggleEstandar(k, e.target.checked)}
          className="mt-0.5"
        />
        <span>
          {TEXTO_ESTANDAR[k]}
          {NOTA_ESTANDAR[k] && (
            <span className="block text-xs text-muted">{NOTA_ESTANDAR[k]}</span>
          )}
        </span>
      </label>
      {k === "bus" && est.bus && (
        <div className="ml-6 mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["Bus de ida", "busIdaModo", "busIdaHorarios", "busIdaUbicacion"],
              ["Bus de vuelta", "busVueltaModo", "busVueltaHorarios", "busVueltaUbicacion"],
            ] as const
          ).map(([titulo, kModo, kHor, kUbi]) => (
            <div key={kModo} className="rounded-md border border-line p-2.5">
              <p className="text-xs font-medium">{titulo}</p>
              <select
                className={`${box} mt-1`}
                value={est[kModo]}
                onChange={(e) => setEstandar({ [kModo]: e.target.value as "sino" | "lista" })}
              >
                <option value="sino">Preguntar Sí / No</option>
                <option value="lista">Elegir un horario de una lista</option>
              </select>
              {est[kModo] === "lista" && (
                <input
                  className={`${box} mt-2`}
                  placeholder="Horarios separados por comas (17:00, 17:30, 18:00)"
                  defaultValue={est[kHor]}
                  onBlur={(e) => setEstandar({ [kHor]: e.target.value })}
                />
              )}
              <input
                className={`${box} mt-2`}
                placeholder="Punto de recogida (p. ej. Plaza Mayor, junto a la fuente)"
                defaultValue={est[kUbi]}
                onBlur={(e) => setEstandar({ [kUbi]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const esClave = (k: string): k is ClaveEstandar =>
    (CLAVES_ESTANDAR as readonly string[]).includes(k);

  let numQ = 0;

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

      <Card className="space-y-3" data-tour="form-preguntas">
        <h3 className="font-display text-lg">Preguntas del formulario</h3>
        <p className="text-sm text-muted">
          Este es el formulario completo, en el orden en que lo verán tus invitados. Marca los
          datos que quieres pedir, añade tus preguntas y ordénalo todo con ↑ ↓.
        </p>

        <div className="rounded-lg border border-line divide-y divide-line">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
            <span className="w-8 shrink-0" />
            <input type="checkbox" checked disabled />
            <span>
              Nombre <span className="text-xs">(siempre el primero)</span>
            </span>
          </div>

          {cfg.orden.map((k, i) => {
            const q = esClave(k) ? null : cfg.preguntas.find((p) => p.id === k);
            if (!esClave(k) && !q) return null;
            if (q) numQ += 1;
            const anteriores = cfg.preguntas.filter(
              (p) => cfg.orden.indexOf(p.id) < i && cfg.orden.indexOf(p.id) >= 0,
            );
            return (
              <div key={k} className="flex gap-2 px-3 py-2.5">
                <div className="flex w-8 shrink-0 flex-col items-center pt-0.5 text-muted">
                  <button
                    onClick={() => moveItem(k, -1)}
                    disabled={i === 0}
                    className="leading-none hover:text-foreground disabled:opacity-20"
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(k, 1)}
                    disabled={i === cfg.orden.length - 1}
                    className="leading-none hover:text-foreground disabled:opacity-20"
                    title="Bajar"
                  >
                    ↓
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  {esClave(k) ? (
                    contenidoEstandar(k)
                  ) : (
                    <PreguntaEditor
                      q={q as PreguntaForm}
                      numero={numQ}
                      anteriores={anteriores}
                      pack={cfg.estandar.acompanante}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => addPregunta()}
          className="w-full rounded-md border border-dashed border-line py-2 text-sm font-medium text-accent hover:border-accent"
        >
          + Añadir pregunta
        </button>
      </Card>

      <Card data-tour="form-preview">
        <h3 className="font-display text-lg">Vista previa</h3>
        <p className="mt-0.5 text-sm text-muted">
          Abre el formulario tal y como lo verán tus invitados en la web.
        </p>
        <RsvpForm buttonLabel="Ver el formulario" />
      </Card>
    </div>
  );
}


function PreguntaEditor({
  q,
  numero,
  anteriores,
  pack,
}: {
  q: PreguntaForm;
  numero: number;
  anteriores: PreguntaForm[];
  pack: boolean;
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
          Tu pregunta {numero}
        </span>
        <button
          onClick={() => {
            if (confirm(`¿Eliminar la pregunta "${q.label || "sin texto"}"?`)) removePregunta(q.id);
          }}
          className="px-1 text-sm text-muted hover:text-red-600"
          title="Eliminar"
        >
          🗑
        </button>
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

      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(q.acomp)}
          onChange={(e) => updatePregunta(q.id, { acomp: e.target.checked })}
          className="mt-0.5"
        />
        <span>
          Preguntarla también, por separado, para el acompañante
          <span className="block text-xs text-muted">
            Si el invitado trae acompañante, aparece una segunda vez con «(acompañante)».
          </span>
        </span>
      </label>

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
