// Formulario de confirmación (RSVP). Se configura en Gestión → Formulario,
// no en el editor de la web. La web solo muestra el botón que lo abre.

export type PreguntaForm = {
  id: string;
  label: string;
  qtype: "texto" | "si-no" | "opcion" | "numero";
  options: string; // opciones separadas por comas (para qtype "opcion")
  condLabel: string; // pregunta anterior de la que depende ("" = siempre)
  condValue: string; // respuesta que activa esta pregunta
};

export type DatosEstandar = {
  apellidos: boolean;
  email: boolean;
  asiste: boolean; // ¿Asistirás? (Sí/No)
  acompanante: boolean; // ¿Vienes con acompañante? (Sí/No) + nombre y apellidos si Sí
  alergias: boolean; // alergias del invitado
  alergiasAcomp: boolean; // alergias del acompañante (si lo hay)
  bus: boolean; // autobús del invitado (ida y vuelta)
  busAcomp: boolean; // autobús del acompañante (si lo hay)
  // Cómo se pregunta cada trayecto: "sino" (Sí / No) o "lista" (elegir horario).
  busIdaModo: "sino" | "lista";
  busIdaHorarios: string; // horarios separados por comas (modo "lista")
  busIdaUbicacion: string; // punto de recogida (texto libre) que se muestra al invitado
  busVueltaModo: "sino" | "lista";
  busVueltaHorarios: string;
  busVueltaUbicacion: string;
};

// Etiquetas de pregunta que generan los packs (para asociarlas a columnas).
export const LABEL_ALERGIAS = "Alergias";
export const LABEL_BUS = "¿Necesita autobús?";
export const LABEL_BUS_IDA = "Autobús ida";
export const LABEL_BUS_VUELTA = "Autobús vuelta";

// Textos que ve el invitado en el formulario (distintos del nombre de columna).
export const PREGUNTA_ALERGIAS =
  "¿Tienes alguna alergia o intolerancia que debamos saber?";
export const PREGUNTA_ALERGIAS_ACOMP =
  "¿Tu acompañante tiene alguna alergia o intolerancia que debamos saber?";

export type FormularioConfig = {
  intro: string;
  estandar: DatosEstandar;
  preguntas: PreguntaForm[];
  // Orden de TODO el formulario: claves estándar (ver CLAVES_ESTANDAR) e
  // ids de preguntas personalizadas, mezcladas. "nombre" va siempre primero.
  orden: string[];
};

// Claves de los datos estándar que se pueden ordenar dentro del formulario.
export const CLAVES_ESTANDAR = [
  "apellidos",
  "email",
  "asiste",
  "acompanante",
  "alergias",
  "bus",
] as const;
export type ClaveEstandar = (typeof CLAVES_ESTANDAR)[number];

export const LABEL_ESTANDAR: Record<ClaveEstandar, string> = {
  apellidos: "Apellidos",
  email: "Email",
  asiste: "¿Asistirás? (Sí / No)",
  acompanante: "¿Vienes con acompañante? (Sí / No)",
  alergias: "Alergias / intolerancias",
  bus: "Autobús (¿lo necesita? + ida y vuelta)",
};

// Reconstruye/repara el orden: añade lo que falte y quita lo que ya no existe.
function repararOrden(orden: string[] | undefined, preguntas: PreguntaForm[]): string[] {
  const validas = new Set<string>([...CLAVES_ESTANDAR, ...preguntas.map((p) => p.id)]);
  const base = (orden ?? []).filter((k) => validas.has(k));
  for (const k of CLAVES_ESTANDAR) if (!base.includes(k)) base.push(k);
  for (const p of preguntas) if (!base.includes(p.id)) base.push(p.id);
  return base;
}

const KEY = "webodas:formulario";

const ESTANDAR_DEFAULT: DatosEstandar = {
  apellidos: true,
  email: true,
  asiste: true,
  acompanante: true,
  alergias: true,
  alergiasAcomp: true,
  bus: false,
  busAcomp: false,
  busIdaModo: "sino",
  busIdaHorarios: "",
  busIdaUbicacion: "",
  busVueltaModo: "sino",
  busVueltaHorarios: "",
  busVueltaUbicacion: "",
};

const nueva = (label = "Nueva pregunta"): PreguntaForm => ({
  id: crypto.randomUUID(),
  label,
  qtype: "texto",
  options: "",
  condLabel: "",
  condValue: "",
});

// Texto de ejemplo (placeholder) para la introducción.
export const INTRO_EJEMPLO = "Confírmanos tu asistencia antes del 1 de agosto.";

let DEFAULT: FormularioConfig | null = null;
function def(): FormularioConfig {
  if (!DEFAULT) {
    const preguntas = [
      { ...nueva("Menú"), qtype: "opcion" as const, options: "Normal, Vegetariano, Sin gluten, Infantil" },
    ];
    DEFAULT = {
      intro: "",
      estandar: { ...ESTANDAR_DEFAULT },
      preguntas,
      orden: repararOrden([], preguntas),
    };
  }
  return DEFAULT;
}

export function loadFormulario(): FormularioConfig {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return def();
    const c = JSON.parse(r) as Partial<FormularioConfig> & { pack?: boolean };
    const raw = (c.estandar ??
      (c.pack === false
        ? { apellidos: false, email: false, asiste: false, acompanante: false }
        : {})) as Record<string, unknown>;
    // migración de valores antiguos ("no" | "solo" | "con-acomp" | boolean)
    const bool = (v: unknown, def: boolean) =>
      typeof v === "boolean" ? v : v === "solo" || v === "con-acomp" ? true : v === "no" ? false : def;
    const preguntas = Array.isArray(c.preguntas) ? c.preguntas : [];
    return {
      intro: !c.intro || c.intro === INTRO_EJEMPLO ? "" : c.intro,
      estandar: {
        ...ESTANDAR_DEFAULT,
        ...raw,
        alergias: bool(raw.alergias, true),
        alergiasAcomp: bool(raw.alergiasAcomp ?? raw.alergias, true),
        // El autobús no tiene opción "solo del invitado": lo que se pida
        // cuenta también para el acompañante.
        bus: bool(raw.bus ?? raw.buses ?? raw.busAcomp, false),
        busAcomp: bool(raw.bus ?? raw.buses ?? raw.busAcomp, false),
      },
      preguntas,
      orden: repararOrden(c.orden, preguntas),
    };
  } catch {
    return def();
  }
}

export function saveFormulario(c: FormularioConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    window.dispatchEvent(new Event("webodas:formulario"));
  } catch {
    /* noop */
  }
}

export function addPregunta() {
  const c = loadFormulario();
  const q = nueva();
  saveFormulario({ ...c, preguntas: [...c.preguntas, q], orden: [...c.orden, q.id] });
}

export function updatePregunta(id: string, patch: Partial<Omit<PreguntaForm, "id">>) {
  const c = loadFormulario();
  saveFormulario({
    ...c,
    preguntas: c.preguntas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function removePregunta(id: string) {
  const c = loadFormulario();
  saveFormulario({
    ...c,
    preguntas: c.preguntas.filter((p) => p.id !== id),
    orden: c.orden.filter((k) => k !== id),
  });
}

// Mueve cualquier fila del formulario (estándar o pregunta) arriba/abajo.
export function moveItem(key: string, dir: -1 | 1) {
  const c = loadFormulario();
  const list = [...c.orden];
  const i = list.indexOf(key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  saveFormulario({ ...c, orden: list });
}

export function setEstandar(patch: Partial<DatosEstandar>) {
  const c = loadFormulario();
  const next = { ...c.estandar, ...patch };
  // El autobús siempre cuenta para invitado y acompañante por igual.
  if ("bus" in patch) next.busAcomp = next.bus;
  saveFormulario({ ...c, estandar: next });
}

export function setIntro(intro: string) {
  saveFormulario({ ...loadFormulario(), intro });
}

// Etiquetas de todas las preguntas (para asociarlas a columnas de invitados).
export function labelsFormulario(): string[] {
  const c = loadFormulario();
  const out: string[] = [];
  for (const k of c.orden) {
    if (k === "asiste") {
      if (c.estandar.asiste) out.push("¿Asistirás?");
    } else if (k === "acompanante") {
      if (c.estandar.acompanante) out.push("¿Vienes con acompañante?");
    } else if (k === "alergias") {
      if (c.estandar.alergias || c.estandar.alergiasAcomp) out.push(LABEL_ALERGIAS);
    } else if (k === "bus") {
      if (c.estandar.bus || c.estandar.busAcomp)
        out.push(LABEL_BUS, LABEL_BUS_IDA, LABEL_BUS_VUELTA);
    } else if (k !== "apellidos" && k !== "email") {
      const q = c.preguntas.find((p) => p.id === k);
      if (q?.label) out.push(q.label);
    }
  }
  return out;
}

// Tipo (y opciones) que debe tener una columna asociada a esa pregunta.
export function formatoPregunta(label: string): {
  tipo: "texto" | "sino" | "numero" | "lista";
  opciones?: string;
} {
  if (label === "¿Asistirás?" || label === "¿Vienes con acompañante?") return { tipo: "sino" };
  if (label === LABEL_BUS) return { tipo: "sino" };
  if (label === LABEL_ALERGIAS) return { tipo: "texto" };
  if (label === LABEL_BUS_IDA || label === LABEL_BUS_VUELTA) {
    const e = loadFormulario().estandar;
    const modo = label === LABEL_BUS_IDA ? e.busIdaModo : e.busVueltaModo;
    const horarios = label === LABEL_BUS_IDA ? e.busIdaHorarios : e.busVueltaHorarios;
    return modo === "lista" ? { tipo: "lista", opciones: horarios } : { tipo: "sino" };
  }
  const q = loadFormulario().preguntas.find((p) => p.label === label);
  if (!q) return { tipo: "texto" };
  if (q.qtype === "si-no") return { tipo: "sino" };
  if (q.qtype === "numero") return { tipo: "numero" };
  if (q.qtype === "opcion") return { tipo: "lista", opciones: q.options };
  return { tipo: "texto" };
}
