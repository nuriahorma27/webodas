// Paleta de colores compartida por todo el editor (secciones y textos).
// Hay una paleta base fija + los colores que la persona añade (máx. 6, en el navegador).

const STORE_KEY = "webodas:colors";

// Paleta base: siempre visible, no se acumula.
export const BASE_PALETTE = [
  "#ffffff",
  "#1f2937",
  "#4b6b43",
  "#e6b8b8",
  "#7c4a4a",
  "#c8a96a",
];

const norm = (c: string) => c.trim().toLowerCase();

export function loadSavedColors(): string[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.filter((c) => !BASE_PALETTE.map(norm).includes(norm(c)));
  } catch {
    return [];
  }
}

export function rememberColor(color: string) {
  try {
    const c = norm(color);
    if (!c || BASE_PALETTE.map(norm).includes(c)) return;
    if (loadSavedColors().map(norm).includes(c)) return;
    const next = [c, ...loadSavedColors().filter((x) => norm(x) !== c)].slice(0, 6);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setTimeout(() => window.dispatchEvent(new Event("webodas:colors")), 0);
  } catch {
    /* noop */
  }
}

// Base fija + las que ya se han usado.
export function paletteColors(): string[] {
  const saved = loadSavedColors();
  return [...BASE_PALETTE, ...saved];
}
