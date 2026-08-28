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

// Respuestas guardadas en el servidor (las que mandan los invitados por la web).
export async function fetchResponsesServer(): Promise<RsvpResponse[]> {
  try {
    const [{ createClient }, { getWedding }] = await Promise.all([
      import("@/lib/supabase/client"),
      import("@/lib/wedding"),
    ]);
    const w = await getWedding();
    if (!w) return [];
    const { data, error } = await createClient()
      .from("rsvp_responses")
      .select("id, created_at, payload")
      .eq("wedding_id", w.id)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    const rs = data.map((row) => ({
      ...(row.payload as RsvpResponse),
      id: row.id,
      fecha: (row.payload as RsvpResponse)?.fecha || row.created_at,
    }));
    return aplicarOverlay(rs);
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

// Estado de volcado por respuesta (sirve tanto para las locales como las del servidor).
const OVERLAY = "webodas:rsvp-volcadas";
type Overlay = Record<string, Partial<RsvpResponse>>;
function loadOverlay(): Overlay {
  try {
    return JSON.parse(localStorage.getItem(OVERLAY) || "{}") as Overlay;
  } catch {
    return {};
  }
}
export function aplicarOverlay(rs: RsvpResponse[]): RsvpResponse[] {
  const ov = loadOverlay();
  return rs.map((r) => (ov[r.id] ? { ...r, ...ov[r.id] } : r));
}

export function updateResponse(weddingId: string, id: string, patch: Partial<RsvpResponse>) {
  try {
    // local (demo)
    const all = loadResponses(weddingId).map((r) => (r.id === id ? { ...r, ...patch } : r));
    localStorage.setItem(key(weddingId), JSON.stringify(all));
    // overlay (para respuestas del servidor)
    const ov = loadOverlay();
    ov[id] = { ...ov[id], ...patch };
    localStorage.setItem(OVERLAY, JSON.stringify(ov));
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
      Menú: "Normal",
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
