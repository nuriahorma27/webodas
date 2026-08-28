"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { loadInvitados, type Invitado } from "@/lib/invitados";
import {
  loadMesas,
  setTipoMesa,
  setModoMesas,
  addMesa,
  updateMesa,
  removeMesa,
  sentar,
  quitarDeMesa,
  moverEnMesa,
  TIPOS_MESA,
  LABEL_TIPO,
  type MesasConfig,
  type Mesa,
  type TipoMesa,
} from "@/lib/mesas";

export default function MesasPage() {
  const [cfg, setCfg] = useState<MesasConfig | null>(null);
  const [inv, setInv] = useState<Invitado[]>([]);
  const [porBorrar, setPorBorrar] = useState<Mesa | null>(null);
  const [addAbierto, setAddAbierto] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCfg(loadMesas());
      setInv(loadInvitados());
    };
    sync();
    window.addEventListener("webodas:mesas", sync);
    window.addEventListener("webodas:invitados", sync);
    return () => {
      window.removeEventListener("webodas:mesas", sync);
      window.removeEventListener("webodas:invitados", sync);
    };
  }, []);

  const nombreDe = useMemo(() => {
    const map = new Map(inv.map((i) => [i.id, i]));
    return (id: string) => map.get(id);
  }, [inv]);

  if (!cfg) return null;

  // Invitados que pueden sentarse: vienen ("Sí") o pendientes. No los "No".
  const sentables = inv.filter((i) => (i.nombre || i.apellido) && i.viene !== "No");
  const sentadosIds = new Set(cfg.mesas.flatMap((m) => m.invitados));
  const sinMesa = sentables.filter((i) => !sentadosIds.has(i.id));

  const tiposActivos = TIPOS_MESA.filter((t) => cfg.tipos[t.id]?.activo);

  const totalPlazas = cfg.mesas.reduce((s, m) => s + m.plazas, 0);
  const totalSentados = cfg.mesas.reduce((s, m) => s + m.invitados.length, 0);

  const anadirMesa = (tipo: TipoMesa) => {
    addMesa(tipo);
    setAddAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* 1 · Tipos de mesa disponibles */}
      <Card className="space-y-3">
        <div>
          <h2 className="font-display text-lg">1 · Tipos de mesa</h2>
          <p className="text-sm text-muted">
            Marca los tipos que usarás y su número máximo de comensales.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS_MESA.map((t) => {
            const on = cfg.tipos[t.id]?.activo;
            return (
              <div
                key={t.id}
                className={`rounded-lg border p-3 ${on ? "border-accent bg-accent-soft/20" : "border-line"}`}
              >
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(on)}
                    onChange={(e) => setTipoMesa(t.id, { activo: e.target.checked })}
                  />
                  {t.label}
                </label>
                {on && (
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                    Máx. personas
                    <input
                      type="number"
                      min={1}
                      value={cfg.tipos[t.id].max}
                      onChange={(e) => setTipoMesa(t.id, { max: Number(e.target.value) })}
                      className="w-16 rounded border border-line bg-surface px-2 py-1 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2 · Modo */}
      <Card className="space-y-3">
        <div>
          <h2 className="font-display text-lg">2 · Asignación de sillas</h2>
          <p className="text-sm text-muted">
            Elige si cada persona tiene una silla concreta o la mesa es libre.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["libre", "Mesa libre", "Asignas personas a la mesa, sin silla fija."],
              ["asignado", "Silla asignada", "Cada persona tiene un número de silla en la mesa."],
            ] as const
          ).map(([v, titulo, desc]) => (
            <button
              key={v}
              onClick={() => setModoMesas(v)}
              className={`rounded-lg border p-3 text-left ${
                cfg.modo === v ? "border-foreground bg-foreground text-white" : "border-line hover:border-accent"
              }`}
            >
              <span className="block text-sm font-medium">{titulo}</span>
              <span className={`block text-xs ${cfg.modo === v ? "text-white/70" : "text-muted"}`}>
                {desc}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 3 · Mesas */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg">3 · Mesas</h2>
            <p className="text-sm text-muted">
              {cfg.mesas.length} mesas · {totalSentados}/{totalPlazas} plazas ocupadas ·{" "}
              {sinMesa.length} sin mesa
            </p>
          </div>

          <div className="relative">
            {tiposActivos.length === 0 ? (
              <span className="text-xs text-muted">Activa algún tipo de mesa arriba.</span>
            ) : tiposActivos.length === 1 ? (
              <button
                onClick={() => anadirMesa(tiposActivos[0].id)}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                + Añadir mesa
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAddAbierto((v) => !v)}
                  onBlur={() => setTimeout(() => setAddAbierto(false), 150)}
                  className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  + Añadir mesa ▾
                </button>
                {addAbierto && (
                  <div className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-md border border-line bg-background text-sm shadow-lg">
                    {tiposActivos.map((t) => (
                      <button
                        key={t.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => anadirMesa(t.id)}
                        className="block w-full px-3 py-2 text-left hover:bg-accent-soft/40"
                      >
                        Mesa {t.label.toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {cfg.mesas.length === 0 ? (
          <p className="text-sm text-muted">Aún no has creado ninguna mesa.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cfg.mesas.map((m) => (
              <MesaCard
                key={m.id}
                mesa={m}
                modo={cfg.modo}
                sinMesa={sinMesa}
                nombreDe={nombreDe}
                onSentar={(id, pos) => sentar(m.id, id, pos)}
                onQuitar={quitarDeMesa}
                onMover={(id, dir) => moverEnMesa(m.id, id, dir)}
                onRename={(nombre) => updateMesa(m.id, { nombre })}
                onPlazas={(plazas) => updateMesa(m.id, { plazas })}
                onBorrar={() => setPorBorrar(m)}
              />
            ))}
          </div>
        )}
      </Card>

      {porBorrar && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPorBorrar(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-background p-5 shadow-xl"
          >
            <h3 className="font-display text-lg">Eliminar mesa</h3>
            <p className="mt-1 text-sm text-muted">
              ¿Seguro que quieres eliminar «{porBorrar.nombre}»? Sus{" "}
              {porBorrar.invitados.length} invitados volverán a «sin mesa».
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPorBorrar(null)}
                className="rounded-md border border-line px-3 py-1.5 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removeMesa(porBorrar.id);
                  setPorBorrar(null);
                }}
                className="rounded-md bg-[#7b2233] px-3 py-1.5 text-sm font-medium text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function nombreCompleto(i?: Invitado) {
  if (!i) return "—";
  return `${i.nombre} ${i.apellido}`.trim() || "(sin nombre)";
}

function iniciales(i?: Invitado) {
  if (!i) return "?";
  const a = (i.nombre || "").trim()[0] ?? "";
  const b = (i.apellido || "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function EstadoPunto({ inv }: { inv?: Invitado }) {
  if (!inv) return null;
  const viene = inv.viene === "Sí";
  return (
    <span
      title={viene ? "Viene" : "Pendiente"}
      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white ${
        viene ? "bg-emerald-600" : "bg-amber-500"
      }`}
    >
      {viene ? "✓" : "P"}
    </span>
  );
}

function MesaCard({
  mesa,
  modo,
  sinMesa,
  nombreDe,
  onSentar,
  onQuitar,
  onMover,
  onRename,
  onPlazas,
  onBorrar,
}: {
  mesa: Mesa;
  modo: "asignado" | "libre";
  sinMesa: Invitado[];
  nombreDe: (id: string) => Invitado | undefined;
  onSentar: (id: string, pos?: number) => void;
  onQuitar: (id: string) => void;
  onMover: (id: string, dir: -1 | 1) => void;
  onRename: (nombre: string) => void;
  onPlazas: (n: number) => void;
  onBorrar: () => void;
}) {
  const llena = mesa.invitados.length > mesa.plazas;
  // picker: null = cerrado; { pos } = eligiendo a quién sentar (en la silla pos si viene)
  const [picker, setPicker] = useState<{ pos?: number } | null>(null);
  const [q, setQ] = useState("");

  const abrirPicker = (pos?: number) => {
    setQ("");
    setPicker({ pos });
  };
  const elegir = (id: string) => {
    onSentar(id, picker?.pos);
    setPicker(null);
  };

  const filtrados = q.trim()
    ? sinMesa.filter((i) => nombreCompleto(i).toLowerCase().includes(q.trim().toLowerCase()))
    : sinMesa;

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <input
            defaultValue={mesa.nombre}
            onBlur={(e) => onRename(e.target.value.trim() || mesa.nombre)}
            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-display text-base outline-none hover:border-line focus:border-accent"
          />
          <p className="px-1 text-xs text-muted">
            {LABEL_TIPO[mesa.tipo]} ·{" "}
            <span className={llena ? "font-semibold text-[#7b2233]" : ""}>
              {mesa.invitados.length}/{mesa.plazas}
            </span>{" "}
            <input
              type="number"
              min={1}
              value={mesa.plazas}
              onChange={(e) => onPlazas(Math.max(1, Number(e.target.value)))}
              className="ml-1 w-14 rounded border border-line bg-surface px-1 py-0.5 text-xs outline-none focus:border-accent"
              title="Plazas de la mesa"
            />
          </p>
        </div>
        <button
          onClick={onBorrar}
          className="shrink-0 rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
          title="Eliminar mesa"
        >
          🗑
        </button>
      </div>

      {modo === "asignado" && (
        <div className="my-3 flex justify-center">
          <MesaDibujo mesa={mesa} nombreDe={nombreDe} onSilla={abrirPicker} />
        </div>
      )}

      {/* Lista ordenable */}
      <ol className="mt-2 space-y-1">
        {mesa.invitados.map((id, idx) => {
          const i = nombreDe(id);
          return (
            <li
              key={id}
              className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                idx >= mesa.plazas ? "bg-[#7b2233]/10" : "bg-surface"
              }`}
            >
              <span className="w-6 shrink-0 text-center text-xs text-muted">{idx + 1}</span>
              <EstadoPunto inv={i} />
              <span className="min-w-0 flex-1 truncate">{nombreCompleto(i)}</span>
              <span className="flex shrink-0 text-muted">
                <button
                  onClick={() => onMover(id, -1)}
                  disabled={idx === 0}
                  className="px-1 hover:text-foreground disabled:opacity-20"
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMover(id, 1)}
                  disabled={idx === mesa.invitados.length - 1}
                  className="px-1 hover:text-foreground disabled:opacity-20"
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  onClick={() => onQuitar(id)}
                  className="px-1 hover:text-red-600"
                  title="Quitar de la mesa"
                >
                  ✕
                </button>
              </span>
            </li>
          );
        })}
        {mesa.invitados.length === 0 && (
          <li className="px-2 py-1 text-sm text-muted">Mesa vacía.</li>
        )}
      </ol>

      {picker ? (
        <div className="mt-2 rounded-lg border border-line bg-surface p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              {picker.pos !== undefined ? `Sentar en la silla ${picker.pos + 1}` : "Añadir a la mesa"}
            </span>
            <button
              onClick={() => setPicker(null)}
              className="text-xs text-muted underline hover:text-foreground"
            >
              cerrar
            </button>
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="mt-1.5 w-full rounded border border-line bg-background px-2 py-1 text-sm outline-none focus:border-accent"
          />
          <ul className="mt-1.5 max-h-52 overflow-auto">
            {filtrados.length === 0 && (
              <li className="px-1 py-1.5 text-sm text-muted">
                {sinMesa.length === 0 ? "Todos tienen mesa." : "Sin coincidencias."}
              </li>
            )}
            {filtrados.map((i) => (
              <li key={i.id}>
                <button
                  onClick={() => elegir(i.id)}
                  className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-sm hover:bg-accent-soft/40"
                >
                  <EstadoPunto inv={i} />
                  {nombreCompleto(i)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          onClick={() => abrirPicker()}
          className="mt-2 w-full rounded-md border border-dashed border-line py-1.5 text-xs font-medium text-accent hover:border-accent"
        >
          + Sentar invitado
        </button>
      )}
    </div>
  );
}

/* --------- Dibujo de la mesa con sillas numeradas --------- */

function MesaDibujo({
  mesa,
  nombreDe,
  onSilla,
}: {
  mesa: Mesa;
  nombreDe: (id: string) => Invitado | undefined;
  onSilla: (pos: number) => void;
}) {
  const n = Math.max(mesa.plazas, mesa.invitados.length);
  const seats = Array.from({ length: n }, (_, i) => i);
  const posiciones = posicionesSillas(mesa.tipo, n);

  const base = mesa.tipo === "rectangular" ? 260 : 220;
  const W = mesa.tipo === "rectangular" ? Math.min(360, base + Math.max(0, n - 8) * 12) : base;
  const H = mesa.tipo === "rectangular" ? 170 : base;
  const seatPx = n > 16 ? 24 : n > 10 ? 28 : 32;

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <div
        className="absolute bg-accent-soft/50 ring-1 ring-accent/30"
        style={{
          left: "18%",
          top: "18%",
          width: "64%",
          height: "64%",
          borderRadius: mesa.tipo === "redonda" ? "9999px" : mesa.tipo === "rectangular" ? "16px" : "10px",
        }}
      />
      {seats.map((idx) => {
        const p = posiciones[idx];
        const ocupanteId = mesa.invitados[idx];
        const inv = ocupanteId ? nombreDe(ocupanteId) : undefined;
        return (
          <button
            key={idx}
            onClick={() => onSilla(idx)}
            title={inv ? `Silla ${idx + 1} · ${nombreCompleto(inv)}` : `Silla ${idx + 1} (libre)`}
            className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[10px] font-semibold transition ${
              ocupanteId
                ? "border-accent/60 bg-background text-foreground"
                : "border-dashed border-line bg-surface text-muted hover:border-accent hover:bg-accent-soft/40 hover:text-accent"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: seatPx, height: seatPx }}
          >
            {inv ? iniciales(inv) : idx + 1}
          </button>
        );
      })}
    </div>
  );
}

// Posiciones en % (centro del asiento) para cada silla según el tipo.
function posicionesSillas(tipo: TipoMesa, n: number): { x: number; y: number }[] {
  if (n === 0) return [];
  if (tipo === "redonda") {
    const rx = 46;
    const ry = 46;
    return Array.from({ length: n }, (_, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: 50 + rx * Math.cos(ang), y: 50 + ry * Math.sin(ang) };
    });
  }
  if (tipo === "rectangular") {
    const top = Math.ceil(n / 2);
    const bottom = n - top;
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < top; i++) out.push({ x: pct(i, top), y: 6 });
    for (let i = 0; i < bottom; i++) out.push({ x: pct(i, bottom), y: 94 });
    return out;
  }
  const perSide = Math.ceil(n / 4);
  const out: { x: number; y: number }[] = [];
  const sides: ("t" | "r" | "b" | "l")[] = ["t", "r", "b", "l"];
  let placed = 0;
  for (const s of sides) {
    const count = Math.min(perSide, n - placed);
    for (let i = 0; i < count; i++) {
      const t = pct(i, count);
      if (s === "t") out.push({ x: t, y: 6 });
      else if (s === "b") out.push({ x: t, y: 94 });
      else if (s === "l") out.push({ x: 6, y: t });
      else out.push({ x: 94, y: t });
    }
    placed += count;
    if (placed >= n) break;
  }
  return out;
}

function pct(i: number, total: number) {
  if (total === 1) return 50;
  return 12 + (i * 76) / (total - 1);
}
