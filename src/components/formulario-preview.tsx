"use client";

import { type FormularioConfig } from "@/lib/formulario";

function Campo({ label, tipo = "texto", options = "" }: { label: string; tipo?: string; options?: string }) {
  const opts = options.split(",").map((o) => o.trim()).filter(Boolean);
  return (
    <div>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="mt-1 rounded border border-line bg-neutral-50 px-2 py-1.5 text-sm text-muted">
        {tipo === "si-no"
          ? "Sí  /  No"
          : tipo === "opcion"
            ? opts.length
              ? opts.join(" · ")
              : "Elige una opción…"
            : tipo === "numero"
              ? "0"
              : " "}
      </div>
    </div>
  );
}

export function FormularioPreview({ cfg }: { cfg: FormularioConfig }) {
  const est = cfg.estandar;
  return (
    <div className="w-[min(92vw,26rem)] rounded-xl border border-line bg-surface p-5 shadow-sm sm:w-[30rem] sm:p-7">
      <p className="font-display text-lg sm:text-xl">Confirmar asistencia</p>
      {cfg.intro && <p className="mt-1 text-sm text-muted">{cfg.intro}</p>}
      <div className="mt-3 space-y-3">
        <Campo label="Nombre" />
        {est.apellidos && <Campo label="Apellidos" />}
        {est.email && <Campo label="Email" />}
        {est.asiste && <Campo label="¿Asistirás?" tipo="si-no" />}
        {est.acompanante && <Campo label="¿Vienes con acompañante?" tipo="si-no" />}
        {cfg.preguntas
          .filter((q) => q.label)
          .map((q) =>
            q.condLabel ? (
              <div
                key={q.id}
                className="rounded-md border border-dashed border-line bg-neutral-50/60 p-2 opacity-70"
              >
                <p className="mb-1 text-[11px] italic text-muted">
                  ⌁ solo si «{q.condLabel}» = {q.condValue || "…"} — no siempre visible
                </p>
                <Campo label={q.label} tipo={q.qtype} options={q.options} />
              </div>
            ) : (
              <Campo key={q.id} label={q.label} tipo={q.qtype} options={q.options} />
            ),
          )}
      </div>
      <div className="mt-4 rounded-md bg-foreground py-2 text-center text-sm font-medium text-white">
        Enviar
      </div>
    </div>
  );
}
