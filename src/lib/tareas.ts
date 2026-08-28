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
  invitados: [{ key: "notas", label: "Notas", tipo: "textarea" }],
  webodas: [{ key: "notas", label: "Notas", tipo: "textarea" }],
  simple: [{ key: "notas", label: "Notas", tipo: "textarea" }],
};

// Tareas que se hacen en otra parte de webodas: enlace directo desde la ficha.
export const RUTAS_WEBODAS: Record<string, { href: string; label: string; sub: string }> = {
  "Crear la web de boda": {
    href: "/panel/webs",
    label: "Ir a la web de boda",
    sub: "Se hace en webodas · Web de boda",
  },
  "Configurar la lista de regalos": {
    href: "/panel/regalos",
    label: "Ir a la lista de regalos",
    sub: "Se hace en webodas · Lista de regalos",
  },
  "Recoger las confirmaciones (RSVP)": {
    href: "/panel/gestion/confirmaciones",
    label: "Ver las confirmaciones",
    sub: "Se hace en webodas · Confirmaciones",
  },
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
  { value: "invitados", label: "Invitados (enlaza con la sección)" },
  { value: "viaje", label: "Viaje" },
  { value: "documentos", label: "Documentos / checklist" },
];

export const TIPO_LABEL: Record<string, string> = Object.fromEntries(
  TIPOS_TAREA.map((t) => [t.value, t.label]),
);

// Mismas categorías que en Presupuesto + algunas propias de tareas.
export const CATEGORIAS = [
  "Iglesia",
  "Banquete",
  "Música",
  "Decoración y flores",
  "Fotografía y vídeo",
  "La novia",
  "El novio",
  "Papelería",
  "Transporte",
  "Alojamiento",
  "Detalles y regalos",
  "Preboda y pedida",
  "Viaje de novios",
  "Invitados y web",
  "Otros",
];

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
    ["Mirar y reservar iglesia", "12 meses antes", "proveedor"],
    ["Cura / oficiante", "12 meses antes", "persona"],
    ["Trámites y documentación del expediente", "8-9 meses antes", "documentos"],
    ["Cursillo prematrimonial", "4-5 meses antes", "lugarFecha"],
    ["Coro / música de la ceremonia", "4-5 meses antes", "proveedor"],
    ["Elegir repertorio de canciones", "4-5 meses antes", "eleccion"],
    ["Elegir lecturas y lectores", "4-5 meses antes", "eleccion"],
    ["Flores de la iglesia", "8-9 meses antes", "proveedor"],
    ["Arras y alianzas", "4-5 meses antes", "compra"],
    ["Misaletes / hojas de misa", "2-3 meses antes", "compra"],
  ],
  Banquete: [
    ["Mirar y reservar la finca", "12 meses antes", "proveedor"],
    ["Hacer la prueba de menú", "2-3 meses antes", "eleccion"],
    ["Decidir barra libre y horas extra", "2-3 meses antes", "eleccion"],
    ["Elegir la bodega y las bebidas", "2-3 meses antes", "eleccion"],
    ["Contratar el puesto de quesos o la recena", "Sin fecha asignada", "proveedor"],
    ["Encargar la tarta nupcial", "2-3 meses antes", "proveedor"],
    ["Comprar las chuches o el candy bar", "Último mes", "compra"],
  ],
  Música: [
    ["Contratar la música en directo (cóctel o ceremonia)", "4-5 meses antes", "proveedor"],
    ["Contratar el DJ o la discoteca móvil", "8-9 meses antes", "proveedor"],
    ["Contratar el photocall o el fotomatón", "2-3 meses antes", "proveedor"],
    ["Elegir y preparar el baile nupcial", "2-3 meses antes", "eleccion"],
    ["Elegir las canciones de entrada y salida", "4-5 meses antes", "eleccion"],
  ],
  "Decoración y flores": [
    ["Flores y centros de mesa", "2-3 meses antes", "proveedor"],
    ["Decoración de espacios", "2-3 meses antes", "proveedor"],
    ["Iluminación", "2-3 meses antes", "proveedor"],
    ["Velas y atrezzo", "2-3 meses antes", "compra"],
    ["Jarrones, farolillos, pajareras", "6-7 meses antes", "compra"],
    ["Mantelería y vajilla", "2-3 meses antes", "proveedor"],
    ["Libro de firmas", "2-3 meses antes", "compra"],
  ],
  "Fotografía y vídeo": [
    ["Contratar el fotógrafo", "10-11 meses antes", "proveedor"],
    ["Contratar el vídeo", "10-11 meses antes", "proveedor"],
    ["Reservar la sesión de fotos preboda", "4-5 meses antes", "lugarFecha"],
  ],
  "La novia": [
    ["Contratar o comprar el vestido de novia", "10-11 meses antes", "proveedor"],
    ["Arreglos del vestido", "2-3 meses antes", "compra"],
    ["Contratar la peluquería", "12 meses antes", "proveedor"],
    ["Contratar el maquillaje", "12 meses antes", "proveedor"],
    ["Reservar las pruebas de peluquería y maquillaje", "2-3 meses antes", "lugarFecha"],
    ["Comprar los zapatos de la novia", "4-5 meses antes", "compra"],
    ["Comprar el tocado o el velo", "4-5 meses antes", "compra"],
    ["Encargar el ramo de novia", "4-5 meses antes", "compra"],
    ["Elegir las joyas y complementos", "4-5 meses antes", "compra"],
    ["Comprar la lencería y la ropa interior", "2-3 meses antes", "compra"],
    ["Comprar alpargatas para la fiesta", "2-3 meses antes", "compra"],
    ["Preparar el neceser para retoques", "Último mes", "compra"],
  ],
  "El novio": [
    ["Contratar o comprar el traje del novio", "6-7 meses antes", "proveedor"],
    ["Comprar la camisa del novio", "4-5 meses antes", "compra"],
    ["Comprar los zapatos del novio", "4-5 meses antes", "compra"],
    ["Comprar los complementos (corbata, gemelos)", "4-5 meses antes", "compra"],
    ["Reservar la barbería para antes de la boda", "Último mes", "lugarFecha"],
  ],
  Papelería: [
    ["Encargar las invitaciones", "4-5 meses antes", "proveedor"],
    ["Enviar el «Save the date» a los invitados", "8-9 meses antes", "simple"],
    ["Encargar las minutas del menú", "2-3 meses antes", "compra"],
    ["Hacer el seating plan y los nombres de mesa", "Último mes", "lista", "Se organiza en webodas · Mesas"],
    ["Encargar los números o carteles de mesa", "Último mes", "compra"],
  ],
  Transporte: [
    ["Reservar el coche de los novios", "8-9 meses antes", "proveedor"],
    ["Contratar el autobús para los invitados", "2-3 meses antes", "proveedor"],
  ],
  Alojamiento: [
    ["Noche de bodas / hotel", "2-3 meses antes", "reserva"],
    ["Alojamiento para invitados de fuera", "4-5 meses antes", "simple"],
  ],
  "Detalles y regalos": [
    ["Detalle para los invitados", "2-3 meses antes", "compra"],
    ["Detalle para los testigos", "2-3 meses antes", "compra"],
    ["Puros y tabaco", "Último mes", "compra"],
    ["Vestidos de los niños de arras", "6-7 meses antes", "proveedor"],
  ],
  "Preboda y pedida": [
    ["Cena / evento de pedida de mano", "8-9 meses antes", "lugarFecha"],
    ["Fiesta preboda", "2-3 meses antes", "lugarFecha"],
  ],
  "Viaje de novios": [
    ["Reservar el viaje de luna de miel", "6-7 meses antes", "viaje"],
    ["Pasaportes / visados / vacunas", "4-5 meses antes", "simple"],
  ],
  "Invitados y web": [
    ["Preparar la lista de invitados con sus direcciones", "12 meses antes", "invitados"],
    ["Crear la web de boda", "10-11 meses antes", "webodas"],
    ["Configurar la lista de regalos", "6-7 meses antes", "webodas"],
    ["Recoger las confirmaciones (RSVP)", "2-3 meses antes", "webodas"],
  ],
  Otros: [
    ["Elegir testigos y padrinos", "8-9 meses antes", "eleccion"],
    ["Cita en el registro civil (si hay boda civil)", "8-9 meses antes", "lugarFecha"],
    ["Seguro de la boda", "6-7 meses antes", "simple"],
    ["Wedding planner (si lo hay)", "12 meses antes", "proveedor"],
  ],
};

export const TAREAS: Tarea[] = CATEGORIAS.flatMap((categoria) =>
  (DATA[categoria] ?? []).map(([titulo, fase, tipo, nota], i) => ({
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
