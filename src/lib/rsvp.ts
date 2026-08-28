// Respuestas del formulario de confirmación (prototipo: se guardan en el navegador).

export type RsvpQuestion = {
  label: string;
  qtype: string;
  options?: string;
  condLabel?: string;
  condValue?: string;
};

// Preguntas disponibles del bloque RSVP de la web (para asociarlas a columnas de invitados).
export function loadPreguntasRsvp(weddingId = "demo"): string[] {
  try {
    const raw = localStorage.getItem(`webodas:site:${weddingId}`);
    if (!raw) return [];
    const data = JSON.parse(raw) as { content?: { type: string; props?: Record<string, unknown> }[] };
    const rsvp = (data.content ?? []).find((b) => b.type === "RSVP");
    if (!rsvp) return [];
    const pack = (rsvp.props?.packEstandar as string) !== "no";
    const packQ = pack ? ["¿Asistirás?", "¿Vienes con acompañante?"] : [];
    const custom = ((rsvp.props?.questions as { label: string }[]) ?? [])
      .map((q) => q.label)
      .filter(Boolean);
    return [...packQ, ...custom];
  } catch {
    return [];
  }
}
export type RsvpResponse = {
  id: string;
  fecha: string;
  nombre: string;
  email: string;
  asiste: string;
  acompanantes: number;
  respuestas: Record<string, string>;
};

const key = (weddingId: string) => `webodas:rsvp:${weddingId}`;

export function loadResponses(weddingId: string): RsvpResponse[] {
  try {
    const raw = localStorage.getItem(key(weddingId));
    return raw ? (JSON.parse(raw) as RsvpResponse[]) : [];
  } catch {
    return [];
  }
}

export function addResponse(weddingId: string, r: RsvpResponse) {
  try {
    const all = [r, ...loadResponses(weddingId)];
    localStorage.setItem(key(weddingId), JSON.stringify(all));
    window.dispatchEvent(new Event("webodas:rsvp"));
  } catch {
    /* noop */
  }
}

// Respuestas de ejemplo para que el panel no salga vacío.
export const RSVP_SEED: RsvpResponse[] = [
  {
    id: "seed-1",
    fecha: "2026-06-02",
    nombre: "Carlos y Nuria",
    email: "carlos.nuria@email.com",
    asiste: "Sí",
    acompanantes: 2,
    respuestas: { "Menú": "Normal", "Alergias / intolerancias": "Ninguna", "Autobús": "Sí" },
  },
  {
    id: "seed-2",
    fecha: "2026-06-04",
    nombre: "Laura Méndez",
    email: "laura.mendez@email.com",
    asiste: "Sí",
    acompanantes: 1,
    respuestas: { "Menú": "Vegetariano", "Alergias / intolerancias": "Lactosa", "Autobús": "No" },
  },
  {
    id: "seed-3",
    fecha: "2026-06-05",
    nombre: "Tíos de Sevilla",
    email: "tios.sevilla@email.com",
    asiste: "No",
    acompanantes: 0,
    respuestas: { "Menú": "-", "Alergias / intolerancias": "-", "Autobús": "-" },
  },
];
