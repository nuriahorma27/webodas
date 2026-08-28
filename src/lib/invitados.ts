// Invitados de la boda (prototipo: se guardan en el navegador).

export type EstadoInvitado = "Pendiente" | "Confirmado" | "Rechazado";

export type Invitado = {
  id: string;
  nombre: string;
  grupo: string;
  personas: number;
  estado: EstadoInvitado;
};

const KEY = "webodas:invitados";

export function loadInvitados(): Invitado[] {
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as Invitado[]) : [];
  } catch {
    return [];
  }
}

export function saveInvitados(list: Invitado[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("webodas:invitados"));
  } catch {
    /* noop */
  }
}

export function resumenInvitados() {
  const inv = loadInvitados();
  const personas = inv.reduce((s, i) => s + (Number(i.personas) || 0), 0);
  const confirmadas = inv
    .filter((i) => i.estado === "Confirmado")
    .reduce((s, i) => s + (Number(i.personas) || 0), 0);
  const pendientes = inv
    .filter((i) => i.estado === "Pendiente")
    .reduce((s, i) => s + (Number(i.personas) || 0), 0);
  return { grupos: inv.length, personas, confirmadas, pendientes };
}
