"use client";

import { useState } from "react";
import { addResponse, type RsvpQuestion } from "@/lib/rsvp";

export function RsvpForm({
  questions,
  buttonLabel = "Confirmar asistencia",
  weddingId = "demo",
  pack = true,
}: {
  questions: RsvpQuestion[];
  buttonLabel?: string;
  weddingId?: string;
  pack?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [asiste, setAsiste] = useState("Sí");
  const [acomp, setAcomp] = useState("No");
  const [acompNombre, setAcompNombre] = useState("");
  const [acompApellidos, setAcompApellidos] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const set = (label: string, v: string) => setAnswers((a) => ({ ...a, [label]: v }));

  const close = () => {
    setOpen(false);
    setTimeout(() => setSent(false), 200);
  };

  // Contexto para las condiciones: respuestas del pack + preguntas personalizadas.
  const ctx: Record<string, string> = {
    Asiste: asiste,
    Acompañante: acomp,
    ...answers,
  };
  const visible = (q: RsvpQuestion) => {
    if (!q.condLabel) return true;
    return (ctx[q.condLabel] ?? "").toLowerCase() === (q.condValue ?? "").toLowerCase();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const respuestas: Record<string, string> = {};
    const acompNom = `${acompNombre} ${acompApellidos}`.trim();
    if (acomp === "Sí" && acompNom) respuestas["Acompañante"] = acompNom;
    (questions ?? []).forEach((q) => {
      if (asiste === "Sí" && visible(q) && answers[q.label]) respuestas[q.label] = answers[q.label];
    });
    addResponse(weddingId, {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      nombre: nombre.trim() || "(sin nombre)",
      apellido: apellidos.trim(),
      email,
      asiste,
      acompanantes: acomp === "Sí" ? 1 : 0,
      respuestas,
    });

    setSent(true);
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d9d4ca",
    borderRadius: 4,
    background: "#fff",
    fontSize: 15,
    color: "#1c1a17",
  };
  const lab: React.CSSProperties = { display: "block", fontSize: 14, marginBottom: 6, fontWeight: 600 };

  const renderQuestion = (q: RsvpQuestion, i: number) => {
    const opts = (q.options ?? "").split(",").map((o) => o.trim()).filter(Boolean);
    return (
      <div key={i}>
        <label style={lab}>{q.label}</label>
        {q.qtype === "opcion" && opts.length > 0 ? (
          <select style={field} value={answers[q.label] ?? ""} onChange={(e) => set(q.label, e.target.value)}>
            <option value="">Elige…</option>
            {opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : q.qtype === "si-no" ? (
          <select style={field} value={answers[q.label] ?? ""} onChange={(e) => set(q.label, e.target.value)}>
            <option value="">Elige…</option>
            <option>Sí</option>
            <option>No</option>
          </select>
        ) : q.qtype === "numero" ? (
          <input type="number" style={field} value={answers[q.label] ?? ""} onChange={(e) => set(q.label, e.target.value)} />
        ) : (
          <input style={field} value={answers[q.label] ?? ""} onChange={(e) => set(q.label, e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "12px 28px",
          background: "var(--wf-accent)",
          color: "#fff",
          border: "none",
          letterSpacing: "0.1em",
          fontFamily: "var(--wf-body)",
          cursor: "pointer",
        }}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              color: "#1c1a17",
              borderRadius: 8,
              maxWidth: 440,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px 26px",
              fontFamily: "var(--wf-body)",
              textAlign: "left",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              style={{ position: "absolute", top: 12, right: 14, border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#999" }}
            >
              ×
            </button>

            {sent ? (
              <div style={{ padding: "20px 0" }}>
                <h3 style={{ fontFamily: "var(--wf-heading)", fontSize: 24, marginBottom: 8 }}>¡Gracias!</h3>
                <p style={{ fontSize: 15, color: "#555" }}>Hemos recibido tu respuesta.</p>
                <button type="button" onClick={close} style={{ marginTop: 20, padding: "10px 22px", background: "var(--wf-accent)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
                <h3 style={{ fontFamily: "var(--wf-heading)", fontSize: 24, marginBottom: 2 }}>Confirmar asistencia</h3>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label style={lab}>Nombre</label>
                    <input style={field} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div>
                    <label style={lab}>Apellidos</label>
                    <input style={field} value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label style={lab}>Email</label>
                  <input
                    type="email"
                    style={field}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {pack && (
                  <div>
                    <label style={lab}>¿Asistirás?</label>
                    <select style={field} value={asiste} onChange={(e) => setAsiste(e.target.value)}>
                      <option>Sí</option>
                      <option>No</option>
                    </select>
                  </div>
                )}

                {pack && asiste === "Sí" && (
                  <>
                    <div>
                      <label style={lab}>¿Vienes con acompañante?</label>
                      <select style={field} value={acomp} onChange={(e) => setAcomp(e.target.value)}>
                        <option>No</option>
                        <option>Sí</option>
                      </select>
                    </div>

                    {acomp === "Sí" && (
                      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                          <label style={lab}>Nombre del acompañante</label>
                          <input style={field} value={acompNombre} onChange={(e) => setAcompNombre(e.target.value)} />
                        </div>
                        <div>
                          <label style={lab}>Apellidos del acompañante</label>
                          <input style={field} value={acompApellidos} onChange={(e) => setAcompApellidos(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {(!pack || asiste === "Sí") &&
                  (questions ?? []).map((q, i) => (visible(q) ? renderQuestion(q, i) : null))}

                <button
                  type="submit"
                  style={{ marginTop: 4, padding: "12px 28px", background: "var(--wf-accent)", color: "#fff", border: "none", letterSpacing: "0.1em", cursor: "pointer" }}
                >
                  Enviar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
