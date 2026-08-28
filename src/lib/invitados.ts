// Invitados de la boda (prototipo: se guardan en el navegador).
// Una fila = una persona.

export type Viene = "Pendiente" | "Sí" | "No";
export const VIENE_OPCIONES: Viene[] = ["Pendiente", "Sí", "No"];

export type TipoInvitado = "Adulto" | "Niño";
export const TIPO_OPCIONES: TipoInvitado[] = ["Adulto", "Niño"];

export const GRUPOS_SUGERIDOS = [
  "Familia de la novia",
  "Familia del novio",
  "Amigos de la novia",
  "Amigos del novio",
  "Amigos comunes",
  "Trabajo",
  "Otros",
];

// Columnas extra que se pueden añadir. tipo: texto libre o sí/no.
export const COLUMNAS_SUGERIDAS: { nombre: string; tipo: "texto" | "sino" }[] = [
  { nombre: "Invitación entregada", tipo: "sino" },
  { nombre: "Dirección", tipo: "texto" },
  { nombre: "Alergias", tipo: "texto" },
  { nombre: "Bus ida", tipo: "sino" },
  { nombre: "Bus vuelta", tipo: "sino" },
  { nombre: "Hora vuelta", tipo: "texto" },
  { nombre: "Regalo", tipo: "texto" },
  { nombre: "Cantidad (regalo)", tipo: "texto" },
  { nombre: "Agradecimiento enviado", tipo: "sino" },
  { nombre: "Mesa", tipo: "texto" },
  { nombre: "Menú", tipo: "texto" },
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

export type ColumnaInvitado = { id: string; nombre: string; tipo: "texto" | "sino" };

const KEY = "webodas:invitados";
const COLS_KEY = "webodas:invitados-columnas";

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

/* ---------- columnas personalizadas ---------- */

export function loadColumnas(): ColumnaInvitado[] {
  try {
    const r = localStorage.getItem(COLS_KEY);
    return r ? (JSON.parse(r) as ColumnaInvitado[]) : [];
  } catch {
    return [];
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

export function addColumna(nombre: string, tipo: "texto" | "sino" = "texto"): ColumnaInvitado {
  const col = { id: crypto.randomUUID(), nombre: nombre.trim() || "Columna", tipo };
  saveColumnas([...loadColumnas(), col]);
  return col;
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
