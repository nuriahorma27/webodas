// Mesas del banquete (prototipo: se guardan en el navegador).

export type TipoMesa = "redonda" | "cuadrada" | "rectangular";

export const TIPOS_MESA: { id: TipoMesa; label: string; plazasDefault: number }[] = [
  { id: "redonda", label: "Redonda", plazasDefault: 10 },
  { id: "cuadrada", label: "Cuadrada", plazasDefault: 8 },
  { id: "rectangular", label: "Rectangular", plazasDefault: 14 },
];

export const LABEL_TIPO: Record<TipoMesa, string> = {
  redonda: "Redonda",
  cuadrada: "Cuadrada",
  rectangular: "Rectangular",
};

export type MesaModo = "asignado" | "libre";

export type Mesa = {
  id: string;
  numero: number; // nº de mesa, único entre todas las mesas
  nombre: string; // nombre libre opcional ("Familia", "Amigos del cole"…)
  tipo: TipoMesa;
  plazas: number;
  cabecera?: boolean; // solo rectangular: una silla en cada extremo corto
  presidencial?: boolean; // mesa presidencial (solo una)
  invitados: string[]; // orden = nº de silla (silla 1 = invitados[0])
};

export type MesasConfig = {
  tipos: Record<TipoMesa, { activo: boolean; max: number }>;
  modo: MesaModo;
  mesas: Mesa[];
};

const KEY = "webodas:mesas:v1";

function def(): MesasConfig {
  return {
    tipos: {
      redonda: { activo: true, max: 10 },
      cuadrada: { activo: false, max: 8 },
      rectangular: { activo: false, max: 14 },
    },
    modo: "libre",
    mesas: [],
  };
}

export function loadMesas(): MesasConfig {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return def();
    const c = JSON.parse(r) as Partial<MesasConfig>;
    const base = def();
    const cfg: MesasConfig = {
      tipos: { ...base.tipos, ...(c.tipos ?? {}) },
      modo: c.modo === "asignado" ? "asignado" : "libre",
      mesas: Array.isArray(c.mesas)
        ? c.mesas.map((m, idx) => ({
            id: m.id,
            numero: Number(m.numero) > 0 ? Math.floor(Number(m.numero)) : idx + 1,
            nombre: m.nombre ?? "",
            tipo: (["redonda", "cuadrada", "rectangular"] as TipoMesa[]).includes(m.tipo)
              ? m.tipo
              : "redonda",
            plazas: Math.max(1, Number(m.plazas) || 8),
            cabecera: Boolean(m.cabecera),
            presidencial: Boolean(m.presidencial),
            invitados: Array.isArray(m.invitados) ? m.invitados.filter(Boolean) : [],
          }))
        : [],
    };
    // Garantiza números de mesa únicos.
    const vistos = new Set<number>();
    for (const m of cfg.mesas) {
      if (vistos.has(m.numero)) m.numero = primerLibre(vistos);
      vistos.add(m.numero);
    }
    return cfg;
  } catch {
    return def();
  }
}

function primerLibre(usados: Set<number>): number {
  let n = 1;
  while (usados.has(n)) n++;
  return n;
}

function save(c: MesasConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    window.dispatchEvent(new Event("webodas:mesas"));
  } catch {
    /* noop */
  }
}

export function setTipoMesa(tipo: TipoMesa, patch: Partial<{ activo: boolean; max: number }>) {
  const c = loadMesas();
  c.tipos[tipo] = { ...c.tipos[tipo], ...patch };
  if (patch.max !== undefined && patch.max < 1) c.tipos[tipo].max = 1;
  save(c);
}

export function setModoMesas(modo: MesaModo) {
  save({ ...loadMesas(), modo });
}

export function addMesa(tipo: TipoMesa) {
  const c = loadMesas();
  const numero = primerLibre(new Set(c.mesas.map((m) => m.numero)));
  c.mesas.push({
    id: crypto.randomUUID(),
    numero,
    nombre: "",
    tipo,
    plazas: c.tipos[tipo]?.max ?? 8,
    invitados: [],
  });
  save(c);
}

// Cambia el número de mesa. Devuelve false si el número ya está usado o no es válido.
export function setNumeroMesa(id: string, numero: number): boolean {
  const n = Math.floor(numero);
  if (!(n > 0)) return false;
  const c = loadMesas();
  if (c.mesas.some((m) => m.id !== id && m.numero === n)) return false;
  c.mesas = c.mesas.map((m) => (m.id === id ? { ...m, numero: n } : m));
  save(c);
  return true;
}

// Marca (o desmarca) la mesa presidencial. Solo puede haber una.
export function setPresidencial(id: string, v: boolean) {
  const c = loadMesas();
  c.mesas = c.mesas.map((m) => ({
    ...m,
    presidencial: m.id === id ? v : v ? false : m.presidencial,
  }));
  save(c);
}

export function updateMesa(id: string, patch: Partial<Omit<Mesa, "id" | "invitados">>) {
  const c = loadMesas();
  c.mesas = c.mesas.map((m) => (m.id === id ? { ...m, ...patch } : m));
  save(c);
}

export function removeMesa(id: string) {
  const c = loadMesas();
  c.mesas = c.mesas.filter((m) => m.id !== id);
  save(c);
}

// Sienta a un invitado en una mesa (lo quita de cualquier otra). pos = índice de silla.
export function sentar(mesaId: string, invitadoId: string, pos?: number) {
  const c = loadMesas();
  c.mesas = c.mesas.map((m) => ({
    ...m,
    invitados: m.invitados.filter((x) => x !== invitadoId),
  }));
  c.mesas = c.mesas.map((m) => {
    if (m.id !== mesaId) return m;
    const lista = [...m.invitados];
    const i = pos === undefined || pos > lista.length ? lista.length : Math.max(0, pos);
    lista.splice(i, 0, invitadoId);
    return { ...m, invitados: lista };
  });
  save(c);
}

export function quitarDeMesa(invitadoId: string) {
  const c = loadMesas();
  c.mesas = c.mesas.map((m) => ({
    ...m,
    invitados: m.invitados.filter((x) => x !== invitadoId),
  }));
  save(c);
}

export function moverEnMesa(mesaId: string, invitadoId: string, dir: -1 | 1) {
  const c = loadMesas();
  c.mesas = c.mesas.map((m) => {
    if (m.id !== mesaId) return m;
    const lista = [...m.invitados];
    const i = lista.indexOf(invitadoId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= lista.length) return m;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    return { ...m, invitados: lista };
  });
  save(c);
}

export function mesaDeInvitado(c: MesasConfig, invitadoId: string): Mesa | undefined {
  return c.mesas.find((m) => m.invitados.includes(invitadoId));
}
