// Tareas de la boda (plantilla / cuadro de mando).
// Estado por tarea: "sin" | "proceso" | "hecho" | "descartada" — en localStorage.

export type Estado = "sin" | "proceso" | "hecho" | "descartada";

export const ESTADOS: { value: Estado; label: string; tone: "neutral" | "amber" | "green" | "muted" }[] = [
  { value: "sin", label: "Sin empezar", tone: "neutral" },
  { value: "proceso", label: "En proceso", tone: "amber" },
  { value: "hecho", label: "Terminado", tone: "green" },
  { value: "descartada", label: "No se hará", tone: "muted" },
];

/* ---------- fichas de detalle por tipo de tarea ---------- */

export type CampoTipo = "text" | "email" | "tel" | "eur" | "date" | "textarea" | "sino" | "checklist";
export type Campo = { key: string; label: string; tipo: CampoTipo; presets?: string[] };

export const FIELD_SETS: Record<string, Campo[]> = {
  reserva: [
    { key: "lugar", label: "Lugar", tipo: "text" },
    { key: "fecha", label: "Fecha reservada", tipo: "date" },
    { key: "contacto", label: "Contacto", tipo: "text" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  persona: [
    { key: "nombre", label: "Nombre", tipo: "text" },
    { key: "telefono", label: "Teléfono", tipo: "tel" },
    { key: "email", label: "Email", tipo: "email" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  proveedor: [
    { key: "nombre", label: "Nombre / empresa", tipo: "text" },
    { key: "email", label: "Email", tipo: "email" },
    { key: "telefono", label: "Teléfono", tipo: "tel" },
    { key: "presupuesto", label: "Presupuesto (€)", tipo: "eur" },
    { key: "pagado", label: "Pagado (€)", tipo: "eur" },
    { key: "contratado", label: "¿Contratado?", tipo: "sino" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  lugarFecha: [
    { key: "lugar", label: "Dónde", tipo: "text" },
    { key: "fecha", label: "Fecha", tipo: "date" },
    { key: "hora", label: "Hora", tipo: "text" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  documentos: [
    {
      key: "docs",
      label: "Documentos del expediente",
      tipo: "checklist",
      presets: [
        "Partida de nacimiento literal",
        "Fe de bautismo actualizada",
        "Certificado de confirmación",
        "DNI / pasaporte",
        "Certificado de empadronamiento",
        "Cursillo prematrimonial",
        "Amonestaciones / proclamas",
        "Expediente matrimonial firmado",
      ],
    },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  eleccion: [
    { key: "eleccion", label: "Decisión / elección", tipo: "textarea" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  compra: [
    { key: "tienda", label: "Tienda / dónde", tipo: "text" },
    { key: "detalle", label: "Detalle (talla, color, diseñador…)", tipo: "text" },
    { key: "enlace", label: "Enlace", tipo: "text" },
    { key: "comprado", label: "¿Comprado?", tipo: "sino" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  viaje: [
    { key: "destino", label: "Destino", tipo: "text" },
    { key: "ida", label: "Fecha de ida", tipo: "date" },
    { key: "vuelta", label: "Fecha de vuelta", tipo: "date" },
    { key: "agencia", label: "Agencia / reserva", tipo: "text" },
    { key: "presupuesto", label: "Presupuesto (€)", tipo: "eur" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  lista: [
    { key: "items", label: "Elementos", tipo: "checklist", presets: [] },
    { key: "presupuesto", label: "Presupuesto (€)", tipo: "eur" },
    { key: "notas", label: "Notas", tipo: "textarea" },
  ],
  simple: [{ key: "notas", label: "Notas", tipo: "textarea" }],
};

/* ---------- tareas ---------- */

export type Tarea = {
  id: string;
  titulo: string;
  categoria: string;
  fase: string;
  tipo: string;
  nota?: string;
  responsable?: string;
  notaVisible?: string;
  custom?: boolean;
};

export const RESPONSABLES_BASE = ["La novia", "El novio", "Los dos"];

// Tipos de ficha que se pueden elegir al crear una tarea nueva.
export const TIPOS_TAREA: { value: string; label: string }[] = [
  { value: "simple", label: "Solo notas" },
  { value: "proveedor", label: "Proveedor (varias opciones, contratar)" },
  { value: "reserva", label: "Reserva (lugar, fecha, pago)" },
  { value: "lugarFecha", label: "Lugar y fecha" },
  { value: "persona", label: "Persona / contacto" },
  { value: "compra", label: "Compra" },
  { value: "eleccion", label: "Decisión / elección" },
  { value: "lista", label: "Lista / listado" },
  { value: "viaje", label: "Viaje" },
  { value: "documentos", label: "Documentos / checklist" },
];

export const TIPO_LABEL: Record<string, string> = Object.fromEntries(
  TIPOS_TAREA.map((t) => [t.value, t.label]),
);

export const CATEGORIAS = ["Iglesia", "Finca", "Decoración", "Otros de la boda", "Otros de la novia"];

export const FASES = [
  "12 meses antes",
  "10-11 meses antes",
  "8-9 meses antes",
  "6-7 meses antes",
  "4-5 meses antes",
  "2-3 meses antes",
  "Último mes",
  "Sin fecha asignada",
];

// Meses antes de la boda en que la fase debería estar terminada.
export const FASE_MESES: Record<string, number> = {
  "12 meses antes": 12,
  "10-11 meses antes": 11,
  "8-9 meses antes": 9,
  "6-7 meses antes": 7,
  "4-5 meses antes": 5,
  "2-3 meses antes": 3,
  "Último mes": 1,
  "Sin fecha asignada": Infinity,
};

type Def = [titulo: string, fase: string, tipo: string, nota?: string];

const DATA: Record<string, Def[]> = {
  Iglesia: [
    ["Elegir iglesia y reservar", "12 meses antes", "reserva"],
    ["Cura / oficiante", "12 meses antes", "persona"],
    ["Trámites (documentos del expediente)", "8-9 meses antes", "documentos"],
    ["Cursillo prematrimonial", "4-5 meses antes", "lugarFecha"],
    ["Fotógrafo", "10-11 meses antes", "proveedor"],
    ["Vídeo", "10-11 meses antes", "proveedor"],
    ["Coro / música de ceremonia", "4-5 meses antes", "proveedor"],
    ["Elegir repertorio de canciones", "4-5 meses antes", "eleccion"],
    ["Flores de la iglesia", "8-9 meses antes", "proveedor"],
    ["Elegir lecturas y lectores", "4-5 meses antes", "eleccion"],
    ["Elegir testigos", "8-9 meses antes", "eleccion"],
    ["Arras y alianzas", "4-5 meses antes", "compra"],
  ],
  Finca: [
    ["Mirar fincas", "12 meses antes", "simple"],
    ["Elegir y reservar", "12 meses antes", "reserva"],
    ["Flores de la finca", "2-3 meses antes", "proveedor"],
    ["Prueba de menú", "2-3 meses antes", "eleccion"],
    ["Música en directo", "4-5 meses antes", "proveedor"],
    ["DJ", "8-9 meses antes", "proveedor"],
    ["Puesto de quesos", "Sin fecha asignada", "proveedor"],
    ["Chuches (Makro)", "Último mes", "compra"],
    ["Puros y tabaco", "Último mes", "compra"],
  ],
  Decoración: [
    ["Flores", "2-3 meses antes", "proveedor"],
    ["Velas", "2-3 meses antes", "compra"],
    ["Jarrones, pajareras, farolillos", "6-7 meses antes", "compra"],
    ["Seating plan y naming de mesas", "Último mes", "lista"],
    ["Mantelería y vajilla", "2-3 meses antes", "proveedor"],
    ["Juegos de mesa", "Último mes", "lista"],
    ["Meseros", "Último mes", "lista"],
    ["Libro de firmas", "2-3 meses antes", "compra"],
  ],
  "Otros de la boda": [
    ["Lista de invitados (con direcciones)", "12 meses antes", "lista"],
    ["Coche de los novios", "8-9 meses antes", "proveedor"],
    ["Web / mail «Save the date»", "6-7 meses antes", "simple"],
    ["Crear cuenta y email de la boda", "8-9 meses antes", "simple"],
    ["Invitaciones", "4-5 meses antes", "proveedor"],
    ["Bus de invitados", "2-3 meses antes", "proveedor"],
    ["Cena de pedida de mano", "8-9 meses antes", "lugarFecha"],
    ["Lista de boda", "6-7 meses antes", "simple"],
    ["Noche de bodas / hotel", "2-3 meses antes", "reserva"],
    ["Viaje de luna de miel", "6-7 meses antes", "viaje"],
    ["Baile nupcial", "2-3 meses antes", "eleccion", "Canción: My Way — Frank Sinatra"],
    ["Elegir canción de entrada / ramo", "4-5 meses antes", "eleccion"],
    ["Llevar huevos a Santa Clara", "Último mes", "simple"],
    ["Detalle para los testigos", "2-3 meses antes", "compra"],
    ["Vestidos de los niños de arras", "6-7 meses antes", "compra"],
  ],
  "Otros de la novia": [
    ["Vestido", "10-11 meses antes", "compra"],
    ["Peluquería", "8-9 meses antes", "proveedor"],
    ["Maquillaje", "8-9 meses antes", "proveedor"],
    ["Ramo", "4-5 meses antes", "compra"],
    ["Zapatos", "4-5 meses antes", "compra"],
    ["Alpargatas para después", "2-3 meses antes", "compra"],
    ["Camisón y bata para los preparativos", "2-3 meses antes", "compra"],
    ["Neceser para retocarse", "Último mes", "compra"],
    ["Pijama y lencería — noche de bodas", "2-3 meses antes", "compra"],
  ],
};

export const TAREAS: Tarea[] = CATEGORIAS.flatMap((categoria) =>
  DATA[categoria].map(([titulo, fase, tipo, nota], i) => ({
    id: `${categoria}-${i}`,
    titulo,
    categoria,
    fase,
    tipo,
    nota,
  })),
);

/* ---------- almacenamiento ---------- */

export type ChecklistItem = { label: string; done: boolean };
export type ProveedorOpcion = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  presupuesto: string;
  notas: string;
  descartada?: boolean;
};
export type TareaDetalle = Record<string, string | ChecklistItem[] | ProveedorOpcion[]>;

const DET_KEY = "webodas:tarea-detalle";

export function loadDetalles(): Record<string, TareaDetalle> {
  try {
    const r = localStorage.getItem(DET_KEY);
    return r ? (JSON.parse(r) as Record<string, TareaDetalle>) : {};
  } catch {
    return {};
  }
}

export function saveDetalle(id: string, d: TareaDetalle) {
  try {
    const all = loadDetalles();
    all[id] = d;
    localStorage.setItem(DET_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("webodas:tareas"));
  } catch {
    /* noop */
  }
}

const KEY = "webodas:tareas";

export function loadEstados(): Record<string, Estado> {
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as Record<string, Estado>) : {};
  } catch {
    return {};
  }
}

export function setEstado(id: string, estado: Estado) {
  try {
    const all = loadEstados();
    all[id] = estado;
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("webodas:tareas"));
  } catch {
    /* noop */
  }
}

/* ---------- personalización de la lista (añadir / quitar / editar) ---------- */

type Patch = Partial<Pick<Tarea, "titulo" | "fase" | "categoria" | "responsable" | "notaVisible">>;
type Personalizacion = {
  ov: Record<string, Patch>; // cambios sobre tareas de la plantilla
  borradas: string[]; // ids de plantilla ocultadas
  nuevas: Tarea[]; // tareas añadidas por la pareja
};

const CUSTOM_KEY = "webodas:tareas-custom";
const VACIA: Personalizacion = { ov: {}, borradas: [], nuevas: [] };

function loadCustom(): Personalizacion {
  try {
    const r = localStorage.getItem(CUSTOM_KEY);
    return r ? { ...VACIA, ...(JSON.parse(r) as Personalizacion) } : VACIA;
  } catch {
    return VACIA;
  }
}

function saveCustom(c: Personalizacion) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(c));
    window.dispatchEvent(new Event("webodas:tareas"));
  } catch {
    /* noop */
  }
}

const esCustom = (id: string) => id.startsWith("custom-");

// Lista final: plantilla (sin las borradas, con sus cambios) + las nuevas.
export function loadTareas(): Tarea[] {
  const c = loadCustom();
  const base = TAREAS.filter((t) => !c.borradas.includes(t.id)).map((t) => ({
    ...t,
    ...c.ov[t.id],
  }));
  const nuevas = c.nuevas.map((t) => ({ ...t, custom: true as const }));
  return [...base, ...nuevas];
}

export function addTarea(categoria: string, fase: string, tipo = "simple"): Tarea {
  const c = loadCustom();
  const nueva: Tarea = {
    id: `custom-${crypto.randomUUID()}`,
    titulo: "",
    categoria,
    fase,
    tipo,
    custom: true,
    responsable: "",
    notaVisible: "",
  };
  saveCustom({ ...c, nuevas: [...c.nuevas, nueva] });
  return nueva;
}

export function updateTarea(id: string, patch: Patch) {
  const c = loadCustom();
  if (esCustom(id)) {
    saveCustom({ ...c, nuevas: c.nuevas.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  } else {
    saveCustom({ ...c, ov: { ...c.ov, [id]: { ...c.ov[id], ...patch } } });
  }
}

export function removeTarea(id: string) {
  const c = loadCustom();
  if (esCustom(id)) {
    saveCustom({ ...c, nuevas: c.nuevas.filter((t) => t.id !== id) });
  } else {
    saveCustom({ ...c, borradas: [...c.borradas.filter((x) => x !== id), id] });
  }
}

export function resetTareas() {
  saveCustom(VACIA);
}
