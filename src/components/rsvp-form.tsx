"use client";

import { useEffect, useState } from "react";
import { addResponse } from "@/lib/rsvp";
import {
  loadFormulario,
  LABEL_ALERGIAS,
  LABEL_BUS,
  LABEL_BUS_IDA,
  LABEL_BUS_VUELTA,
  type PreguntaForm,
} from "@/lib/formulario";

export function RsvpForm({
  buttonLabel = "Confirmar asistencia",
  weddingId = "demo",
}: {
  buttonLabel?: string;
  weddingId?: string;
}) {
  const [cfg, setCfg] = useState(() => loadFormulario());
  useEffect(() => {
    const sync = () => setCfg(loadFormulario());
    sync();
    window.addEventListener("webodas:formulario", sync);
    return () => window.removeEventListener("webodas:formulario", sync);
  }, []);
  const questions: PreguntaForm[] = cfg.preguntas;
  const est = cfg.estandar;

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
  const [answersAcomp, setAnswersAcomp] = useState<Record<string, string>>({});

  const set = (label: string, v: string) => setAnswers((a) => ({ ...a, [label]: v }));
  const setA = (label: string, v: string) => setAnswersAcomp((a) => ({ ...a, [label]: v }));

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
  const visible = (q: PreguntaForm) => {
    if (!q.condLabel) return true;
    return (ctx[q.condLabel] ?? "").toLowerCase() === (q.condValue ?? "").toLowerCase();
  };

  const conAcomp = est.acompanante && asiste === "Sí" && acomp === "Sí";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const respuestas: Record<string, string> = {};
    if (conAcomp) {
      const acompNom = `${acompNombre} ${acompApellidos}`.trim();
      if (acompNom) respuestas["Acompañante"] = acompNom;
    }
    if (est.alergias && answers[LABEL_ALERGIAS])
      respuestas[LABEL_ALERGIAS] = answers[LABEL_ALERGIAS];
    if (est.bus) {
      for (const l of [LABEL_BUS, LABEL_BUS_IDA, LABEL_BUS_VUELTA])
        if (answers[l]) respuestas[l] = answers[l];
    }
    questions.forEach((q) => {
      if (asiste === "Sí" && visible(q) && answers[q.label]) respuestas[q.label] = answers[q.label];
    });

    const respuestasAcomp: Record<string, string> = {};
    if (conAcomp) {
      if (est.alergiasAcomp && answersAcomp[LABEL_ALERGIAS])
        respuestasAcomp[LABEL_ALERGIAS] = answersAcomp[LABEL_ALERGIAS];
      if (est.busAcomp) {
        if (answersAcomp[LABEL_BUS_IDA]) respuestasAcomp[LABEL_BUS_IDA] = answersAcomp[LABEL_BUS_IDA];
        if (answersAcomp[LABEL_BUS_VUELTA])
          respuestasAcomp[LABEL_BUS_VUELTA] = answersAcomp[LABEL_BUS_VUELTA];
      }
    }

    addResponse(weddingId, {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      nombre: nombre.trim() || "(sin nombre)",
      apellido: apellidos.trim(),
      email,
      asiste,
      acompanantes: conAcomp ? 1 : 0,
      respuestas,
      ...(conAcomp
        ? {
            acompNombre: acompNombre.trim(),
            acompApellido: acompApellidos.trim(),
            respuestasAcomp,
          }
        : {}),
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

  const renderQuestion = (q: PreguntaForm, i: number) => {
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
          background: "var(--wf-accent, #8a6d3b)",
          color: "#fff",
          border: "none",
          letterSpacing: "0.1em",
          fontFamily: "var(--wf-body, inherit)",
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
              fontFamily: "var(--wf-body, inherit)",
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
                <h3 style={{ fontFamily: "var(--wf-heading, Georgia, serif)", fontSize: 24, marginBottom: 8 }}>¡Gracias!</h3>
                <p style={{ fontSize: 15, color: "#555" }}>Hemos recibido tu respuesta.</p>
                <button type="button" onClick={close} style={{ marginTop: 20, padding: "10px 22px", background: "var(--wf-accent, #8a6d3b)", color: "#fff", border: "none", cursor: "pointer" }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
                <h3 style={{ fontFamily: "var(--wf-heading, Georgia, serif)", fontSize: 24, marginBottom: 2 }}>Confirmar asistencia</h3>
                {cfg.intro && <p style={{ fontSize: 14, color: "#666", marginTop: -6 }}>{cfg.intro}</p>}

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: est.apellidos ? "1fr 1fr" : "1fr" }}>
                  <div>
                    <label style={lab}>Nombre</label>
                    <input style={field} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  {est.apellidos && (
                    <div>
                      <label style={lab}>Apellidos</label>
                      <input style={field} value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                    </div>
                  )}
                </div>

                {est.email && (
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
                )}

                {est.asiste && (
                  <div>
                    <label style={lab}>¿Asistirás?</label>
                    <select style={field} value={asiste} onChange={(e) => setAsiste(e.target.value)}>
                      <option>Sí</option>
                      <option>No</option>
                    </select>
                  </div>
                )}

                {est.acompanante && (!est.asiste || asiste === "Sí") && (
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

                {(!est.asiste || asiste === "Sí") && (est.alergias || est.bus) && (
                  <>
                    {conAcomp && (
                      <p style={{ ...lab, marginTop: 4, borderTop: "1px solid #eee", paddingTop: 12 }}>
                        Tus datos
                      </p>
                    )}
                    {est.alergias && (
                      <div>
                        <label style={lab}>Alergias / intolerancias</label>
                        <input
                          style={field}
                          value={answers[LABEL_ALERGIAS] ?? ""}
                          onChange={(e) => set(LABEL_ALERGIAS, e.target.value)}
                          placeholder="Deja vacío si no hay"
                        />
                      </div>
                    )}
                    {est.bus && (
                      <div>
                        <label style={lab}>¿Necesitas autobús?</label>
                        <select style={field} value={answers[LABEL_BUS] ?? ""} onChange={(e) => set(LABEL_BUS, e.target.value)}>
                          <option value="">Elige…</option>
                          <option>Sí</option>
                          <option>No</option>
                        </select>
                        {answers[LABEL_BUS] === "Sí" && (
                          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
                            <div>
                              <label style={lab}>Bus de ida</label>
                              <input style={field} value={answers[LABEL_BUS_IDA] ?? ""} onChange={(e) => set(LABEL_BUS_IDA, e.target.value)} placeholder="Sí / No / horario" />
                            </div>
                            <div>
                              <label style={lab}>Bus de vuelta</label>
                              <input style={field} value={answers[LABEL_BUS_VUELTA] ?? ""} onChange={(e) => set(LABEL_BUS_VUELTA, e.target.value)} placeholder="Sí / No / horario" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {(!est.asiste || asiste === "Sí") &&
                  questions.map((q, i) => (visible(q) ? renderQuestion(q, i) : null))}

                {conAcomp && (est.alergiasAcomp || est.busAcomp) && (
                  <>
                    <p style={{ ...lab, marginTop: 4, borderTop: "1px solid #eee", paddingTop: 12 }}>
                      Datos de tu acompañante
                    </p>
                    {est.alergiasAcomp && (
                      <div>
                        <label style={lab}>Alergias / intolerancias del acompañante</label>
                        <input
                          style={field}
                          value={answersAcomp[LABEL_ALERGIAS] ?? ""}
                          onChange={(e) => setA(LABEL_ALERGIAS, e.target.value)}
                          placeholder="Deja vacío si no hay"
                        />
                      </div>
                    )}
                    {est.busAcomp && (
                      <div>
                        <label style={lab}>¿El acompañante necesita autobús?</label>
                        <select style={field} value={answersAcomp[LABEL_BUS] ?? ""} onChange={(e) => setA(LABEL_BUS, e.target.value)}>
                          <option value="">Elige…</option>
                          <option>Sí</option>
                          <option>No</option>
                        </select>
                        {answersAcomp[LABEL_BUS] === "Sí" && (
                          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
                            <div>
                              <label style={lab}>Bus de ida</label>
                              <input style={field} value={answersAcomp[LABEL_BUS_IDA] ?? ""} onChange={(e) => setA(LABEL_BUS_IDA, e.target.value)} placeholder="Sí / No / horario" />
                            </div>
                            <div>
                              <label style={lab}>Bus de vuelta</label>
                              <input style={field} value={answersAcomp[LABEL_BUS_VUELTA] ?? ""} onChange={(e) => setA(LABEL_BUS_VUELTA, e.target.value)} placeholder="Sí / No / horario" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  style={{ marginTop: 4, padding: "12px 28px", background: "var(--wf-accent, #8a6d3b)", color: "#fff", border: "none", letterSpacing: "0.1em", cursor: "pointer" }}
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
