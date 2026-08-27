"use client";

import { useEffect, useState } from "react";
import { Card, Stat, Badge } from "@/components/ui";
import { loadResponses, RSVP_SEED, type RsvpResponse } from "@/lib/rsvp";

export default function ConfirmacionesPage() {
  const [rows, setRows] = useState<RsvpResponse[]>([]);

  useEffect(() => {
    const sync = () => setRows([...loadResponses("demo"), ...RSVP_SEED]);
    sync();
    window.addEventListener("webodas:rsvp", sync);
    return () => window.removeEventListener("webodas:rsvp", sync);
  }, []);

  const asisten = rows.filter((r) => r.asiste === "Sí");
  const personas = asisten.reduce((s, r) => s + 1 + r.acompanantes, 0);

  // Columnas dinámicas: todas las preguntas que han aparecido en alguna respuesta.
  const extraCols = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r.respuestas))),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Respuestas" value={`${rows.length}`} />
        <Stat label="Asisten" value={`${asisten.length}`} sub={`${rows.length - asisten.length} no pueden`} />
        <Stat label="Personas confirmadas" value={`${personas}`} sub="con acompañantes" />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-lg">Respuestas del formulario</h2>
          <span className="text-xs text-muted">Se actualizan solas al recibir una nueva</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Nombre</th>
                <th className="px-5 py-2.5">Email</th>
                <th className="px-5 py-2.5">Fecha</th>
                <th className="px-5 py-2.5">Asiste</th>
                <th className="px-5 py-2.5 text-center">Acomp.</th>
                {extraCols.map((c) => (
                  <th key={c} className="px-5 py-2.5">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium">{r.nombre}</td>
                  <td className="px-5 py-3 text-muted">{r.email || "—"}</td>
                  <td className="px-5 py-3 text-muted">{r.fecha}</td>
                  <td className="px-5 py-3">
                    <Badge tone={r.asiste === "Sí" ? "green" : "red"}>{r.asiste}</Badge>
                  </td>
                  <td className="px-5 py-3 text-center">{r.acompanantes}</td>
                  {extraCols.map((c) => (
                    <td key={c} className="px-5 py-3 text-muted">{r.respuestas[c] ?? "—"}</td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5 + extraCols.length} className="px-5 py-8 text-center text-muted">
                    Aún no hay respuestas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted">
        Las preguntas se configuran en el editor de la web, en el bloque «Confirmación (RSVP)».
      </p>
    </div>
  );
}
