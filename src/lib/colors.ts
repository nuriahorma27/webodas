// Paleta de colores compartida por todo el editor (secciones y textos).
// Solo se muestran los colores que la persona ya ha usado (guardados en el navegador).

const STORE_KEY = "webodas:colors";

export function loadSavedColors(): string[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function rememberColor(color: string) {
  try {
    const c = color.toLowerCase();
    if (!c) return;
    if (loadSavedColors().includes(c)) return;
    const next = [c, ...loadSavedColors().filter((x) => x !== c)].slice(0, 8);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    // Diferido para no re-renderizar en medio del click que lo provocó.
    setTimeout(() => window.dispatchEvent(new Event("webodas:colors")), 0);
  } catch {
    /* noop */
  }
}

// Muestras visibles = solo las que ya se han usado. Vacío al principio.
export function paletteColors(): string[] {
  return loadSavedColors();
}
