// Presupuesto de la boda (prototipo: se guarda en el navegador).

export type Partida = {
  id: string;
  categoria: string;
  concepto: string;
  proveedor: string;
  estimado: number;
  pagado: number;
  // Partidas de menú: el estimado se calcula precio × comensales.
  tipo?: "menu";
  precioUnidad?: number;
  cantidad?: number;
};

const KEY = "webodas:presupuesto";

// Conceptos que se tratan como "menú" (precio por comensal × nº).
export const MENU_CONCEPTOS = ["Menú invitados", "Menú niños", "Menú proveedores"];

// Estimado real de una partida (calculado si es de tipo menú).
export function estimadoDe(p: Partida): number {
  if (p.tipo === "menu") return (p.precioUnidad || 0) * (p.cantidad || 0);
  return p.estimado || 0;
}

// Categorías estándar y sus partidas típicas. Se ofrecen al pulsar
// "Añadir categoría" (también para volver a añadir una borrada por error).
export const CATEGORIAS_ESTANDAR: Record<string, string[]> = {
  Iglesia: [
    "Donativo iglesia",
    "Cura / oficiante",
    "Flores iglesia",
    "Música ceremonia / órgano",
    "Coro o solista",
    "Misaletes / hojas de misa",
    "Megafonía / alfombra",
  ],
  "Ceremonia civil": [
    "Oficiante",
    "Flores ceremonia",
    "Música ceremonia",
    "Megafonía",
    "Atrezzo / photocall",
  ],
  Banquete: [
    "Alquiler finca",
    "Menú invitados",
    "Menú niños",
    "Menú proveedores",
    "Cóctel / aperitivo",
    "Barra libre / hora extra",
    "Bodega y bebidas",
    "Tarta nupcial",
    "Recena",
  ],
  Música: [
    "Música cóctel",
    "Música en vivo",
    "DJ / discoteca móvil",
    "Photocall / fotomatón",
    "Espectáculos (saxo, fuegos...)",
  ],
  "Decoración y flores": [
    "Centros de mesa",
    "Flores y ramos de damas",
    "Decoración de espacios",
    "Iluminación",
    "Velas y atrezzo",
  ],
  "Fotografía y vídeo": [
    "Reportaje de fotografía",
    "Reportaje de vídeo",
    "Álbum y copias",
    "Sesión preboda / postboda",
    "Dron",
  ],
  "Traje y belleza novia": [
    "Vestido",
    "Arreglos",
    "Zapatos",
    "Tocado / velo",
    "Lencería",
    "Joyas y complementos",
    "Ramo de novia",
    "Peluquería y maquillaje",
    "Pruebas de peluquería y maquillaje",
  ],
  "Traje y belleza novio": [
    "Traje",
    "Camisa",
    "Zapatos",
    "Complementos (corbata, gemelos)",
    "Barbería",
  ],
  Papelería: [
    "Save the date",
    "Invitaciones",
    "Sobres y sellos",
    "Minutas",
    "Seating plan / plano de mesas",
    "Números de mesa",
    "Cartelería",
    "Libro de firmas",
  ],
  Transporte: [
    "Coche de novios",
    "Autobuses para invitados",
    "Taxis y traslados",
  ],
  Alojamiento: [
    "Noche de bodas",
    "Alojamiento de los novios",
    "Alojamiento de familiares",
  ],
  "Detalles y regalos": [
    "Detalle para invitados",
    "Detalle para damas y padrinos",
    "Puros y tabaco",
    "Kit de fiesta / abanicos",
    "Cesta de baño",
  ],
  "Preboda y pedida": [
    "Pedida de mano",
    "Fiesta preboda",
    "Sesión / book preboda",
  ],
  "Viaje de novios": [
    "Billetes",
    "Hoteles",
    "Efectivo",
    "Seguro de viaje",
    "Tasas",
    "Excursiones",
  ],
  Otros: [
    "Seguro de la boda",
    "Wedding planner",
    "Propinas",
    "Imprevistos",
  ],
};

// Categorías que se muestran de arranque (en este orden).
const CATEGORIAS_INICIALES = [
  "Iglesia",
  "Banquete",
  "Música",
  "Decoración y flores",
  "Fotografía y vídeo",
  "Traje y belleza novia",
  "Traje y belleza novio",
  "Papelería",
  "Transporte",
  "Detalles y regalos",
  "Viaje de novios",
  "Otros",
];

const nuevaPartida = (categoria: string, concepto: string): Partida => ({
  id: crypto.randomUUID(),
  categoria,
  concepto,
  proveedor: "",
  estimado: 0,
  pagado: 0,
  ...(MENU_CONCEPTOS.includes(concepto) ? { tipo: "menu" as const } : {}),
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

export function resetPartidas() {
  savePartidas(partidasIniciales());
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
      estimado: acc.estimado + estimadoDe(x),
      pagado: acc.pagado + (x.pagado || 0),
    }),
    { estimado: 0, pagado: 0 },
  );
}
