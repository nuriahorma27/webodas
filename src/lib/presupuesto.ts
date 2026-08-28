// Presupuesto de la boda (prototipo: se guarda en el navegador).

export type Partida = {
  id: string;
  categoria: string;
  concepto: string;
  proveedor: string;
  estimado: number;
  pagado: number;
};

const KEY = "webodas:presupuesto";

// Categorías estándar y sus partidas típicas. Se ofrecen al pulsar
// "Añadir categoría" (también para volver a añadir una borrada por error).
export const CATEGORIAS_ESTANDAR: Record<string, string[]> = {
  Iglesia: [
    "Donativo Iglesia",
    "Cura",
    "Flores iglesia",
    "Fotografía Iglesia",
    "Vídeo Iglesia",
    "Música ceremonia / órgano",
  ],
  "Ceremonia civil": ["Oficiante", "Flores", "Fotografía", "Vídeo", "Música"],
  Banquete: [
    "Alquiler finca",
    "Hora extra barra libre",
    "Música en vivo",
    "DJ",
    "Invitados",
  ],
  "Traje novia": [
    "Vestido",
    "Arreglos",
    "Zapatos",
    "Tocado / velo",
    "Ropa interior",
    "Ramo",
    "Complementos",
  ],
  "Traje novio": ["Traje", "Camisa", "Zapatos", "Complementos"],
  Transportes: ["Coche novios", "Autobuses"],
  Invitaciones: [
    "Invitaciones",
    "Save the date",
    "Minutas / seating plan",
    "Sellos y envíos",
  ],
  Otros: [
    "Chuches / candy bar",
    "Detalle invitados",
    "Puros y tabaco",
    "Peluquería y maquillaje",
    "Fotografía y vídeo",
    "Ramo para regalar",
    "Preboda",
    "Pedida",
  ],
  "Viaje de novios": ["Billetes", "Hoteles", "Efectivo", "Seguro de viaje", "Tasas"],
};

// Categorías que se muestran de arranque (en este orden).
const CATEGORIAS_INICIALES = [
  "Iglesia",
  "Banquete",
  "Traje novia",
  "Traje novio",
  "Transportes",
  "Invitaciones",
  "Otros",
  "Viaje de novios",
];

const nuevaPartida = (categoria: string, concepto: string): Partida => ({
  id: crypto.randomUUID(),
  categoria,
  concepto,
  proveedor: "",
  estimado: 0,
  pagado: 0,
});

export function partidasIniciales(): Partida[] {
  return CATEGORIAS_INICIALES.flatMap((cat) =>
    (CATEGORIAS_ESTANDAR[cat] ?? []).map((concepto) => nuevaPartida(cat, concepto)),
  );
}

let SEED: Partida[] | null = null;
function seed(): Partida[] {
  if (!SEED) SEED = partidasIniciales();
  return SEED;
}

export function loadPartidas(): Partida[] {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return seed();
    const arr = JSON.parse(r) as Partida[];
    return Array.isArray(arr) ? arr : seed();
  } catch {
    return seed();
  }
}

export function savePartidas(partidas: Partida[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(partidas));
    window.dispatchEvent(new Event("webodas:presupuesto"));
  } catch {
    /* noop */
  }
}

export function addPartida(categoria: string): Partida {
  const nueva = nuevaPartida(categoria, "");
  savePartidas([...loadPartidas(), nueva]);
  return nueva;
}

// Añade una categoría con sus partidas estándar (o una sola vacía si es libre).
export function addCategoria(nombre: string) {
  const actuales = loadPartidas();
  if (categoriasOrdenadas(actuales).includes(nombre)) return;
  const conceptos = CATEGORIAS_ESTANDAR[nombre] ?? [""];
  savePartidas([...actuales, ...conceptos.map((c) => nuevaPartida(nombre, c))]);
}

export function updatePartida(id: string, patch: Partial<Omit<Partida, "id">>) {
  savePartidas(loadPartidas().map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

export function removePartida(id: string) {
  savePartidas(loadPartidas().filter((x) => x.id !== id));
}

export function removeCategoria(categoria: string) {
  savePartidas(loadPartidas().filter((x) => x.categoria !== categoria));
}

export function renameCategoria(anterior: string, nueva: string) {
  savePartidas(
    loadPartidas().map((x) => (x.categoria === anterior ? { ...x, categoria: nueva } : x)),
  );
}

// Mueve el bloque entero de una categoría arriba/abajo.
export function moveCategoria(categoria: string, dir: -1 | 1) {
  const partidas = loadPartidas();
  const orden = categoriasOrdenadas(partidas);
  const i = orden.indexOf(categoria);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= orden.length) return;
  [orden[i], orden[j]] = [orden[j], orden[i]];
  savePartidas(
    orden.flatMap((cat) => partidas.filter((p) => p.categoria === cat)),
  );
}

// Orden de categorías = primera aparición en la lista.
export function categoriasOrdenadas(partidas: Partida[]): string[] {
  const vistas: string[] = [];
  for (const x of partidas) if (!vistas.includes(x.categoria)) vistas.push(x.categoria);
  return vistas;
}

export function totales(partidas: Partida[]) {
  return partidas.reduce(
    (acc, x) => ({
      estimado: acc.estimado + (x.estimado || 0),
      pagado: acc.pagado + (x.pagado || 0),
    }),
    { estimado: 0, pagado: 0 },
  );
}
