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

export type FormularioConfig = {
  pack: boolean; // pide nombre, apellidos, asistencia y acompañante
  intro: string;
  preguntas: PreguntaForm[];
};

const KEY = "webodas:formulario";

const nueva = (label = "Nueva pregunta"): PreguntaForm => ({
  id: crypto.randomUUID(),
  label,
  qtype: "texto",
  options: "",
  condLabel: "",
  condValue: "",
});

let DEFAULT: FormularioConfig | null = null;
function def(): FormularioConfig {
  if (!DEFAULT)
    DEFAULT = {
      pack: true,
      intro: "Confírmanos tu asistencia antes del 1 de agosto.",
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
    const c = JSON.parse(r) as FormularioConfig;
    return {
      pack: c.pack ?? true,
      intro: c.intro ?? "",
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

export function setPack(pack: boolean) {
  saveFormulario({ ...loadFormulario(), pack });
}

export function setIntro(intro: string) {
  saveFormulario({ ...loadFormulario(), intro });
}

// Etiquetas de todas las preguntas (para asociarlas a columnas de invitados).
export function labelsFormulario(): string[] {
  const c = loadFormulario();
  const pack = c.pack ? ["¿Asistirás?", "¿Vienes con acompañante?"] : [];
  return [...pack, ...c.preguntas.map((p) => p.label).filter(Boolean)];
}
