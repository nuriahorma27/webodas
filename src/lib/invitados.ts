// Invitados de la boda (prototipo: se guardan en el navegador).
// Una fila = una persona.

export type Viene = "Pendiente" | "Sí" | "No";
export const VIENE_OPCIONES: Viene[] = ["Pendiente", "Sí", "No"];

export type TipoInvitado = "Adulto" | "Niño";
export const TIPO_OPCIONES: TipoInvitado[] = ["Adulto", "Niño"];

export const GRUPOS_DEFAULT = [
  "Familia de la novia",
  "Familia del novio",
  "Amigos de la novia",
  "Amigos del novio",
  "Amigos comunes",
  "Trabajo",
  "Otros",
];
export const SUBGRUPOS_DEFAULT: string[] = [];

export type TipoColumna = "texto" | "sino" | "numero" | "lista";

export const TIPO_COLUMNA_LABEL: Record<TipoColumna, string> = {
  texto: "Texto",
  sino: "Sí / No",
  numero: "Número",
  lista: "Listado de opciones",
};

// Columnas extra que se pueden añadir.
export const COLUMNAS_SUGERIDAS: { nombre: string; tipo: TipoColumna }[] = [
  // seguimiento (sí/no)
  { nombre: "Save the date enviado", tipo: "sino" },
  { nombre: "Invitación enviada", tipo: "sino" },
  { nombre: "Invitación entregada", tipo: "sino" },
  { nombre: "Confirmado por teléfono", tipo: "sino" },
  { nombre: "Detalle entregado", tipo: "sino" },
  { nombre: "Menú confirmado", tipo: "sino" },
  { nombre: "Alojamiento reservado", tipo: "sino" },
  { nombre: "Bus ida", tipo: "sino" },
  { nombre: "Bus vuelta", tipo: "sino" },
  { nombre: "Regalo", tipo: "sino" },
  { nombre: "Agradecimiento enviado", tipo: "sino" },
  // datos
  { nombre: "Cantidad (regalo)", tipo: "numero" },
  { nombre: "Hora vuelta", tipo: "texto" },
  { nombre: "Dirección", tipo: "texto" },
  { nombre: "Alergias", tipo: "texto" },
  { nombre: "Menú", tipo: "texto" },
  { nombre: "Mesa", tipo: "texto" },
  { nombre: "Alojamiento", tipo: "texto" },
  { nombre: "Notas", tipo: "texto" },
];

export type Invitado = {
  id: string;
  nombre: string;
  apellido: string;
  viene: Viene;
  grupo: string;
  subgrupo: string;
  tipo: TipoInvitado;
  extra: Record<string, string>; // valores de columnas personalizadas (por id de columna)
};

export type ColumnaInvitado = {
  id: string;
  nombre: string;
  tipo: TipoColumna;
  opciones?: string; // para tipo "lista": opciones separadas por comas
  preguntaRsvp?: string; // pregunta del cuestionario que rellena esta columna
};

const KEY = "webodas:invitados";
const COLS_KEY = "webodas:invitados-columnas:v2";
const GRUPOS_KEY = "webodas:invitados-grupos";
const SUBGRUPOS_KEY = "webodas:invitados-subgrupos";

/* ---------- grupos y subgrupos (configurables) ---------- */

function loadLista(key: string, def: string[]): string[] {
  try {
    const r = localStorage.getItem(key);
    if (!r) return def;
    const arr = JSON.parse(r) as string[];
    return Array.isArray(arr) ? arr : def;
  } catch {
    return def;
  }
}
function saveLista(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event("webodas:invitados"));
  } catch {
    /* noop */
  }
}

export const loadGrupos = () => loadLista(GRUPOS_KEY, GRUPOS_DEFAULT);
export const saveGrupos = (l: string[]) => saveLista(GRUPOS_KEY, l);
export const loadSubgrupos = () => loadLista(SUBGRUPOS_KEY, SUBGRUPOS_DEFAULT);
export const saveSubgrupos = (l: string[]) => saveLista(SUBGRUPOS_KEY, l);

/* ---------- invitados ---------- */

export function loadInvitados(): Invitado[] {
  try {
    const r = localStorage.getItem(KEY);
    const list = r ? (JSON.parse(r) as Invitado[]) : [];
    return list.map((i) => ({ ...i, extra: i.extra ?? {} }));
  } catch {
    return [];
  }
}

function saveInvitados(list: Invitado[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("webodas:invitados"));
  } catch {
    /* noop */
  }
}

export function addInvitado(): Invitado {
  const nuevo: Invitado = {
    id: crypto.randomUUID(),
    nombre: "",
    apellido: "",
    viene: "Pendiente",
    grupo: "",
    subgrupo: "",
    tipo: "Adulto",
    extra: {},
  };
  saveInvitados([...loadInvitados(), nuevo]);
  return nuevo;
}

export function updateInvitado(id: string, patch: Partial<Omit<Invitado, "id" | "extra">>) {
  saveInvitados(loadInvitados().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function updateInvitadoExtra(id: string, colId: string, valor: string) {
  saveInvitados(
    loadInvitados().map((i) =>
      i.id === id ? { ...i, extra: { ...i.extra, [colId]: valor } } : i,
    ),
  );
}

export function removeInvitado(id: string) {
  saveInvitados(loadInvitados().filter((i) => i.id !== id));
}

// Añade una lista de {nombre, apellido}; ignora los que ya existen. Devuelve cuántos añadió.
export function importarInvitados(filas: { nombre: string; apellido: string }[]): number {
  const norm = (s: string) => s.trim().toLowerCase();
  const list = loadInvitados();
  const existentes = new Set(list.map((i) => `${norm(i.nombre)}|${norm(i.apellido)}`));
  let n = 0;
  for (const f of filas) {
    const nombre = (f.nombre || "").trim();
    const apellido = (f.apellido || "").trim();
    if (!nombre && !apellido) continue;
    const clave = `${norm(nombre)}|${norm(apellido)}`;
    if (existentes.has(clave)) continue;
    existentes.add(clave);
    list.push({
      id: crypto.randomUUID(),
      nombre,
      apellido,
      viene: "Pendiente",
      grupo: "",
      subgrupo: "",
      tipo: "Adulto",
      extra: {},
    });
    n++;
  }
  saveInvitados(list);
  return n;
}

/* ---------- columnas personalizadas ---------- */

// Columnas que aparecen de serie la primera vez.
const COLUMNAS_INICIALES: { nombre: string; tipo: TipoColumna }[] = [
  { nombre: "Invitación entregada", tipo: "sino" },
  { nombre: "Dirección", tipo: "texto" },
  { nombre: "Alergias", tipo: "texto" },
  { nombre: "Regalo", tipo: "sino" },
  { nombre: "Cantidad (regalo)", tipo: "numero" },
  { nombre: "Agradecimiento enviado", tipo: "sino" },
];

let SEED_COLS: ColumnaInvitado[] | null = null;
function seedCols(): ColumnaInvitado[] {
  if (!SEED_COLS)
    SEED_COLS = COLUMNAS_INICIALES.map((c) => ({ id: crypto.randomUUID(), ...c }));
  return SEED_COLS;
}

export function loadColumnas(): ColumnaInvitado[] {
  try {
    const r = localStorage.getItem(COLS_KEY);
    if (!r) return seedCols();
    const arr = JSON.parse(r) as ColumnaInvitado[];
    return Array.isArray(arr) ? arr : seedCols();
  } catch {
    return seedCols();
  }
}

function saveColumnas(list: ColumnaInvitado[]) {
  try {
    localStorage.setItem(COLS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("webodas:invitados"));
  } catch {
    /* noop */
  }
}

export function addColumna(
  nombre: string,
  tipo: TipoColumna = "texto",
  opciones?: string,
): ColumnaInvitado {
  const col: ColumnaInvitado = {
    id: crypto.randomUUID(),
    nombre: nombre.trim() || "Columna",
    tipo,
    ...(tipo === "lista" && opciones ? { opciones } : {}),
  };
  saveColumnas([...loadColumnas(), col]);
  return col;
}

export function updateColumna(id: string, patch: Partial<Omit<ColumnaInvitado, "id">>) {
  saveColumnas(loadColumnas().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

export function moveColumna(id: string, dir: -1 | 1) {
  const list = loadColumnas();
  const i = list.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  saveColumnas(list);
}

export function resetColumnas() {
  saveColumnas(COLUMNAS_INICIALES.map((c) => ({ id: crypto.randomUUID(), ...c })));
}

export function removeColumna(id: string) {
  saveColumnas(loadColumnas().filter((c) => c.id !== id));
  saveInvitados(
    loadInvitados().map((i) => {
      if (!(id in i.extra)) return i;
      const extra = { ...i.extra };
      delete extra[id];
      return { ...i, extra };
    }),
  );
}

/* ---------- volcado desde el formulario RSVP ---------- */

// Crea una fila de gestión con nombre/apellido (para "crear nuevo" al revisar respuestas).
export function crearInvitado(nombre: string, apellido: string): Invitado {
  const nuevo: Invitado = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    viene: "Pendiente",
    grupo: "",
    subgrupo: "",
    tipo: "Adulto",
    extra: {},
  };
  saveInvitados([...loadInvitados(), nuevo]);
  return nuevo;
}

// Vuelca una respuesta a una fila de gestión concreta.
export function aplicarRespuestaAInvitado(
  invitadoId: string,
  viene: Viene,
  respuestasPorColumna: { columna: string; valor: string }[],
) {
  const norm = (s: string) => s.trim().toLowerCase();
  const list = loadInvitados();
  const inv = list.find((i) => i.id === invitadoId);
  if (!inv) return;
  inv.viene = viene;
  let cols = loadColumnas();
  for (const { columna, valor } of respuestasPorColumna) {
    if (!columna || !valor) continue;
    let col = cols.find((c) => norm(c.nombre) === norm(columna));
    if (!col) {
      col = { id: crypto.randomUUID(), nombre: columna.trim(), tipo: "texto" };
      cols = [...cols, col];
    }
    inv.extra[col.id] = valor;
  }
  saveColumnas(cols);
  saveInvitados(list);
}

// Busca (o crea) a la persona por nombre+apellido, actualiza si viene y vuelca
// las respuestas de las preguntas que estén asociadas a una columna.
export function upsertInvitadoDesdeRsvp(p: {
  nombre: string;
  apellido: string;
  viene: Viene;
  respuestasPorColumna?: { columna: string; valor: string }[];
}) {
  const norm = (s: string) => s.trim().toLowerCase();
  const list = loadInvitados();
  let inv = list.find(
    (i) => norm(i.nombre) === norm(p.nombre) && norm(i.apellido) === norm(p.apellido),
  );
  if (!inv) {
    inv = {
      id: crypto.randomUUID(),
      nombre: p.nombre.trim(),
      apellido: p.apellido.trim(),
      viene: p.viene,
      grupo: "",
      subgrupo: "",
      tipo: "Adulto",
      extra: {},
    };
    list.push(inv);
  } else {
    inv.viene = p.viene;
  }

  let cols = loadColumnas();
  for (const { columna, valor } of p.respuestasPorColumna ?? []) {
    if (!columna || !valor) continue;
    let col = cols.find((c) => norm(c.nombre) === norm(columna));
    if (!col) {
      col = { id: crypto.randomUUID(), nombre: columna.trim(), tipo: "texto" };
      cols = [...cols, col];
    }
    inv.extra[col.id] = valor;
  }
  saveColumnas(cols);
  saveInvitados(list);
}

/* ---------- resumen ---------- */

export function resumenInvitados() {
  const inv = loadInvitados();
  const n = (f: (i: Invitado) => boolean) => inv.filter(f).length;
  return {
    grupos: new Set(inv.map((i) => i.grupo).filter(Boolean)).size,
    personas: inv.length,
    confirmadas: n((i) => i.viene === "Sí"),
    pendientes: n((i) => i.viene === "Pendiente"),
    noVienen: n((i) => i.viene === "No"),
    adultos: n((i) => i.tipo === "Adulto" && i.viene !== "No"),
    ninos: n((i) => i.tipo === "Niño" && i.viene !== "No"),
  };
}
