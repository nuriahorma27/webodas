// Proveedores de la boda.
// La lista = proveedores CONTRATADOS en tareas (automático) + los añadidos a mano aquí.

import { loadTareas, loadDetalles, type ProveedorOpcion } from "@/lib/tareas";
import { partidaByTarea, estimadoDe } from "@/lib/presupuesto";

export type Proveedor = {
  id: string;
  nombre: string;
  categoria: string;
  contacto: string;
  estado: string;
  importe: number;
  incluye?: string;
  desdeTarea?: string; // título de la tarea de la que sale (si es automático)
  taskId?: string;
};

const KEY = "webodas:proveedores";

export const ESTADOS_PROVEEDOR = [
  "Contratado",
  "Presupuesto pedido",
  "En contacto",
  "Descartado",
];

/* ---------- añadidos a mano ---------- */

export function loadManuales(): Proveedor[] {
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as Proveedor[]) : [];
  } catch {
    return [];
  }
}

function saveManuales(list: Proveedor[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("webodas:proveedores"));
  } catch {
    /* noop */
  }
}

export function addManual(): Proveedor {
  const nuevo: Proveedor = {
    id: crypto.randomUUID(),
    nombre: "",
    categoria: "",
    contacto: "",
    estado: "En contacto",
    importe: 0,
  };
  saveManuales([...loadManuales(), nuevo]);
  return nuevo;
}

export function updateManual(id: string, patch: Partial<Omit<Proveedor, "id">>) {
  saveManuales(loadManuales().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function removeManual(id: string) {
  saveManuales(loadManuales().filter((p) => p.id !== id));
}

/* ---------- automáticos (opción contratada de cada tarea) ---------- */

export function proveedoresDeTareas(): Proveedor[] {
  const detalles = loadDetalles();
  return loadTareas()
    .filter((t) => t.tipo === "proveedor")
    .flatMap((t) => {
      const d = detalles[t.id];
      const ops = (d?.opciones as ProveedorOpcion[]) ?? [];
      const c = ops.find((o) => o.id === (d?.contratado as string));
      if (!c) return [];
      const part = partidaByTarea(t.id);
      const importe = part ? estimadoDe(part) : Number(c.presupuesto) || 0;
      return [
        {
          id: `tarea-${t.id}`,
          nombre: c.nombre || t.titulo,
          categoria: t.categoria,
          contacto: c.telefono || c.email || "",
          estado: "Contratado",
          importe,
          incluye: c.notas || "",
          desdeTarea: t.titulo,
          taskId: t.id,
        },
      ];
    });
}

export function loadProveedores(): Proveedor[] {
  return [...proveedoresDeTareas(), ...loadManuales()];
}
