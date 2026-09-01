// Lista de regalos (prototipo: se guarda en el navegador).

export type Gift = {
  id: string;
  nombre: string;
  imagen: string;
  tipo: string;
  objetivo: number;
  aportado: number;
};

export type Cobro = {
  metodo: "manual" | "stripe";
  iban?: string;
  titular?: string;
  bizum?: string;
  stripeAccountId?: string;
  stripeConnected?: boolean;
};

export type ListaRegalos = {
  titulo: string;
  subtitulo: string;
  texto: string;
  colorBg?: string;
  colorText?: string;
  cobro?: Cobro;
  gifts: Gift[];
};

export type Aportacion = {
  id: string;
  fecha: string;
  giftId: string;
  giftNombre: string;
  nombre: string;
  email: string;
  mensaje: string;
  importe: number;
  estado: "pendiente" | "confirmada";
  metodo: "manual" | "stripe";
};

export const TIPOS_REGALO = ["Producto", "Experiencia", "Hucha"];

export const REGALOS_DEFAULT: ListaRegalos = {
  titulo: "Lista de regalos",
  subtitulo: "Vuestra presencia es nuestro mejor regalo",
  texto:
    "…pero si además queréis tener un detalle, aquí van algunas ideas. Cualquier aportación, por pequeña que sea, nos hace mucha ilusión.",
  cobro: { metodo: "manual" },
  gifts: [
    { id: "g1", nombre: "Aportación viaje de novios", imagen: "", tipo: "Hucha", objetivo: 2000, aportado: 1150 },
    { id: "g2", nombre: "Batería de cocina", imagen: "", tipo: "Producto", objetivo: 320, aportado: 320 },
    { id: "g3", nombre: "Robot de cocina", imagen: "", tipo: "Producto", objetivo: 600, aportado: 240 },
    { id: "g4", nombre: "Juego de sábanas", imagen: "", tipo: "Producto", objetivo: 180, aportado: 0 },
    { id: "g5", nombre: "Cena en restaurante", imagen: "", tipo: "Experiencia", objetivo: 150, aportado: 150 },
    { id: "g6", nombre: "Aportación libre", imagen: "", tipo: "Hucha", objetivo: 0, aportado: 890 },
  ],
};

const KEY = "webodas:regalos";

let override: ListaRegalos | null = null;
export function setListaOverride(l: ListaRegalos | null) {
  override = l;
}

export function loadLista(): ListaRegalos {
  if (override) return override;
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as ListaRegalos) : REGALOS_DEFAULT;
  } catch {
    return REGALOS_DEFAULT;
  }
}

export function saveLista(l: ListaRegalos) {
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
    window.dispatchEvent(new Event("webodas:regalos"));
  } catch {
    /* noop */
  }
}

const AP_KEY = "webodas:aportaciones";

export function loadAportaciones(): Aportacion[] {
  try {
    const r = localStorage.getItem(AP_KEY);
    return r ? (JSON.parse(r) as Aportacion[]) : [];
  } catch {
    return [];
  }
}

// Registra la aportación. Si está confirmada (pago Stripe ok), suma al regalo.
export function contribuir(
  giftId: string,
  a: Omit<Aportacion, "id" | "fecha" | "giftId" | "giftNombre"> & { id?: string },
) {
  try {
    const existentes = loadAportaciones();
    if (a.id && existentes.some((x) => x.id === a.id)) return; // ya registrada

    const lista = loadLista();
    const gift = lista.gifts.find((g) => g.id === giftId);
    if (!gift) return;
    if (a.estado === "confirmada") {
      gift.aportado = (gift.aportado || 0) + a.importe;
      saveLista(lista);
    }
    const ap: Aportacion = {
      id: a.id ?? crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      giftId,
      giftNombre: gift.nombre,
      ...a,
    };
    localStorage.setItem(AP_KEY, JSON.stringify([ap, ...existentes]));
    window.dispatchEvent(new Event("webodas:regalos"));
  } catch {
    /* noop */
  }
}

/* ---------- aportaciones en el servidor (las que hacen los invitados) ---------- */

// Guarda una aportación en el servidor (páginas públicas /lista/[slug]).
export async function contribuirServer(
  weddingId: string,
  giftId: string,
  a: Omit<Aportacion, "id" | "fecha" | "giftId" | "giftNombre"> & { id?: string },
): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const lista = loadLista();
    const gift = lista.gifts.find((g) => g.id === giftId);
    const payload = {
      ...a,
      id: a.id ?? crypto.randomUUID(),
      fecha: new Date().toISOString().slice(0, 10),
      giftNombre: gift?.nombre ?? "",
    };
    await createClient()
      .from("gift_contributions")
      .insert({ wedding_id: weddingId, gift_id: giftId, payload });
  } catch {
    /* noop */
  }
}

// La pareja lee las aportaciones que le han hecho por la web.
export async function fetchAportacionesServer(): Promise<Aportacion[]> {
  try {
    const [{ createClient }, { getWedding }] = await Promise.all([
      import("@/lib/supabase/client"),
      import("@/lib/wedding"),
    ]);
    const w = await getWedding();
    if (!w) return [];
    const { data, error } = await createClient()
      .from("gift_contributions")
      .select("id, gift_id, created_at, payload")
      .eq("wedding_id", w.id)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => {
      const p = (row.payload ?? {}) as Partial<Aportacion>;
      return {
        id: row.id,
        fecha: p.fecha || row.created_at.slice(0, 10),
        giftId: row.gift_id,
        giftNombre: p.giftNombre ?? "",
        nombre: p.nombre ?? "",
        email: p.email ?? "",
        mensaje: p.mensaje ?? "",
        importe: p.importe ?? 0,
        estado: p.estado === "confirmada" ? "confirmada" : "pendiente",
        metodo: p.metodo === "stripe" ? "stripe" : "manual",
      } as Aportacion;
    });
  } catch {
    return [];
  }
}

// La pareja marca una aportación del servidor como recibida.
export async function confirmarAportacionServer(id: string, giftId: string, importe: number) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    const { data } = await sb.from("gift_contributions").select("payload").eq("id", id).single();
    const payload = { ...((data?.payload as object) ?? {}), estado: "confirmada" };
    await sb.from("gift_contributions").update({ payload }).eq("id", id);
    const lista = loadLista();
    const gift = lista.gifts.find((g) => g.id === giftId);
    if (gift) {
      gift.aportado = (gift.aportado || 0) + importe;
      saveLista(lista);
    }
  } catch {
    /* noop */
  }
}

// La pareja confirma una aportación manual → suma al regalo.
export function confirmarAportacion(id: string) {
  try {
    const all = loadAportaciones();
    const ap = all.find((x) => x.id === id);
    if (!ap || ap.estado === "confirmada") return;
    ap.estado = "confirmada";
    localStorage.setItem(AP_KEY, JSON.stringify(all));
    const lista = loadLista();
    const gift = lista.gifts.find((g) => g.id === ap.giftId);
    if (gift) {
      gift.aportado = (gift.aportado || 0) + ap.importe;
      saveLista(lista);
    }
    window.dispatchEvent(new Event("webodas:regalos"));
  } catch {
    /* noop */
  }
}
