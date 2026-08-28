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
  apellido?: string;
  email: string;
  asiste: string;
  acompanantes: number;
  respuestas: Record<string, string>;
  // acompañante (cuando lo trae): es una persona más de la lista
  acompNombre?: string;
  acompApellido?: string;
  respuestasAcomp?: Record<string, string>;
  invitadoId?: string; // fila de "mi gestión" a la que se ha vinculado el invitado
  acompInvitadoId?: string; // fila a la que se ha vinculado el acompañante
  aplicada?: boolean; // ya se ha volcado
};

const key = (weddingId: string) => `webodas:rsvp:${weddingId}`;

export function loadResponses(weddingId: string): RsvpResponse[] {
  try {
    const raw = localStorage.getItem(key(weddingId));
    if (raw) return JSON.parse(raw) as RsvpResponse[];
    // Primera vez: respuestas de ejemplo para ver cómo llega la información.
    return weddingId === "demo" ? RSVP_SEED : [];
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

export function updateResponse(weddingId: string, id: string, patch: Partial<RsvpResponse>) {
  try {
    const all = loadResponses(weddingId).map((r) => (r.id === id ? { ...r, ...patch } : r));
    localStorage.setItem(key(weddingId), JSON.stringify(all));
    window.dispatchEvent(new Event("webodas:rsvp"));
  } catch {
    /* noop */
  }
}

// Valor de una pregunta a partir de una respuesta (mapea las del pack).
export function valorRespuesta(r: RsvpResponse, pregunta: string): string {
  if (pregunta === "¿Asistirás?") return r.asiste;
  if (pregunta === "¿Vienes con acompañante?") return r.acompanantes > 0 ? "Sí" : "No";
  return r.respuestas[pregunta] ?? "";
}

// Respuestas de ejemplo para ver cómo llega la información rellenada.
export const RSVP_SEED: RsvpResponse[] = [
  {
    id: "seed-1",
    fecha: "2026-06-02T18:42:00.000Z",
    nombre: "Laura",
    apellido: "Méndez Gil",
    email: "laura.mendez@email.com",
    asiste: "Sí",
    acompanantes: 1,
    respuestas: {
      Acompañante: "Diego Ramos",
      Menú: "Vegetariano",
      Alergias: "Lactosa",
      "¿Necesita autobús?": "Sí",
      "Autobús ida": "Sí",
      "Autobús vuelta": "Sí, el de las 02:00",
    },
    acompNombre: "Diego",
    acompApellido: "Ramos",
    respuestasAcomp: {
      Alergias: "Ninguna",
      "¿Necesita autobús?": "Sí",
      "Autobús ida": "Sí",
      "Autobús vuelta": "Sí, el de las 02:00",
    },
  },
  {
    id: "seed-2",
    fecha: "2026-06-04T09:15:00.000Z",
    nombre: "Carlos",
    apellido: "Ortega",
    email: "carlos.ortega@email.com",
    asiste: "Sí",
    acompanantes: 0,
    respuestas: {
      Menú: "Normal",
      Alergias: "",
      "¿Necesita autobús?": "No",
    },
  },
  {
    id: "seed-3",
    fecha: "2026-06-05T21:03:00.000Z",
    nombre: "Marta",
    apellido: "Sevilla",
    email: "marta.sevilla@email.com",
    asiste: "No",
    acompanantes: 0,
    respuestas: {},
  },
];
