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
};

export type FormularioConfig = {
  intro: string;
  estandar: DatosEstandar;
  preguntas: PreguntaForm[];
};

const KEY = "webodas:formulario";

const ESTANDAR_DEFAULT: DatosEstandar = {
  apellidos: true,
  email: true,
  asiste: true,
  acompanante: true,
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
  if (!DEFAULT)
    DEFAULT = {
      intro: "",
      estandar: { ...ESTANDAR_DEFAULT },
      preguntas: [
        { ...nueva("Menú"), qtype: "opcion", options: "Normal, Vegetariano, Sin gluten, Infantil" },
        { ...nueva("Alergias / intolerancias") },
        { ...nueva("¿Necesitas autobús?"), qtype: "si-no" },
      ],
    };
  return DEFAULT;
}

export function loadFormulario(): FormularioConfig {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return def();
    const c = JSON.parse(r) as Partial<FormularioConfig> & { pack?: boolean };
    // migración: antes había un único `pack: boolean`
    const estandar =
      c.estandar ??
      (c.pack === false
        ? { apellidos: false, email: false, asiste: false, acompanante: false }
        : { ...ESTANDAR_DEFAULT });
    return {
      intro: c.intro ?? "",
      estandar: { ...ESTANDAR_DEFAULT, ...estandar },
      preguntas: Array.isArray(c.preguntas) ? c.preguntas : [],
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
  saveFormulario({ ...c, preguntas: [...c.preguntas, nueva()] });
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
  saveFormulario({ ...c, preguntas: c.preguntas.filter((p) => p.id !== id) });
}

export function movePregunta(id: string, dir: -1 | 1) {
  const c = loadFormulario();
  const list = [...c.preguntas];
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  saveFormulario({ ...c, preguntas: list });
}

export function setEstandar(patch: Partial<DatosEstandar>) {
  const c = loadFormulario();
  saveFormulario({ ...c, estandar: { ...c.estandar, ...patch } });
}

export function setIntro(intro: string) {
  saveFormulario({ ...loadFormulario(), intro });
}

// Etiquetas de todas las preguntas (para asociarlas a columnas de invitados).
export function labelsFormulario(): string[] {
  const c = loadFormulario();
  const pack: string[] = [];
  if (c.estandar.asiste) pack.push("¿Asistirás?");
  if (c.estandar.acompanante) pack.push("¿Vienes con acompañante?");
  return [...pack, ...c.preguntas.map((p) => p.label).filter(Boolean)];
}

// Tipo (y opciones) que debe tener una columna asociada a esa pregunta.
export function formatoPregunta(label: string): {
  tipo: "texto" | "sino" | "numero" | "lista";
  opciones?: string;
} {
  if (label === "¿Asistirás?" || label === "¿Vienes con acompañante?") return { tipo: "sino" };
  const q = loadFormulario().preguntas.find((p) => p.label === label);
  if (!q) return { tipo: "texto" };
  if (q.qtype === "si-no") return { tipo: "sino" };
  if (q.qtype === "numero") return { tipo: "numero" };
  if (q.qtype === "opcion") return { tipo: "lista", opciones: q.options };
  return { tipo: "texto" };
}
