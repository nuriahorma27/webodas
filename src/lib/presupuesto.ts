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

const p = (categoria: string, concepto: string): Partida => ({
  id: crypto.randomUUID(),
  categoria,
  concepto,
  proveedor: "",
  estimado: 0,
  pagado: 0,
});

export function partidasIniciales(): Partida[] {
  return [
    p("Iglesia", "Donativo Iglesia"),
    p("Iglesia", "Cura"),
    p("Iglesia", "Flores iglesia"),
    p("Iglesia", "Fotografía Iglesia"),
    p("Iglesia", "Vídeo Iglesia"),
    p("Iglesia", "Música ceremonia / órgano"),

    p("Banquete", "Alquiler finca"),
    p("Banquete", "Hora extra barra libre"),
    p("Banquete", "Música en vivo"),
    p("Banquete", "DJ"),
    p("Banquete", "Invitados"),

    p("Otros", "Autobuses"),
    p("Otros", "Fotografía y vídeo"),
    p("Otros", "Peluquería y maquillaje"),
    p("Otros", "Invitaciones"),
    p("Otros", "Puros y tabaco"),
    p("Otros", "Detalle invitados"),
    p("Otros", "Zapatos novia"),
    p("Otros", "Tocado novia"),
    p("Otros", "Ramo novia"),
    p("Otros", "Ramo para regalar"),
    p("Otros", "Preboda"),
    p("Otros", "Pedida"),
    p("Otros", "Vestido novia"),

    p("Viaje de novios", "Billetes"),
    p("Viaje de novios", "Hoteles"),
    p("Viaje de novios", "Efectivo"),
    p("Viaje de novios", "Seguro de viaje"),
    p("Viaje de novios", "Tasas"),
  ];
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
  const nueva = p(categoria, "");
  savePartidas([...loadPartidas(), nueva]);
  return nueva;
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
