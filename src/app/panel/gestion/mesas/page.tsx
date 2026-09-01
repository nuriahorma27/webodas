"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Toggle } from "@/components/ui";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";
import { loadInvitados, type Invitado } from "@/lib/invitados";
import {
  loadMesas,
  setTipoMesa,
  setModoMesas,
  addMesa,
  updateMesa,
  setNumeroMesa,
  setPresidencial,
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

const etiquetaMesa = (m: Mesa) => `Mesa ${m.numero}${m.nombre ? ` · ${m.nombre}` : ""}`;

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
      <Card className="space-y-3" data-tour="mesas-tipos">
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
                className={`rounded-xl border p-3.5 transition ${on ? "border-[#a9b19f] bg-[#edf0e8]" : "border-line bg-white/60"}`}
              >
                <Toggle
                  checked={Boolean(on)}
                  onChange={(checked) => setTipoMesa(t.id, { activo: checked })}
                  label={`Mesa ${t.label.toLowerCase()}`}
                />
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
      <Card className="space-y-4" data-tour="mesas-anadir">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg">3 · Mesas</h2>
            <p className="text-sm text-muted">
              {cfg.mesas.length} mesas · {totalSentados}/{totalPlazas} plazas ocupadas ·{" "}
              {sinMesa.length} sin mesa
            </p>
          </div>

          <div className="flex items-center gap-2">
          {cfg.mesas.length > 0 && (
            <button
              data-tour="mesas-imprimir"
              onClick={() => imprimirMesas(cfg, nombreDe)}
              className="rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:text-accent"
            >
              🖨 Imprimir plano
            </button>
          )}
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
                onNumero={(n) => setNumeroMesa(m.id, n)}
                onPlazas={(plazas) => updateMesa(m.id, { plazas })}
                onCabecera={(v) => updateMesa(m.id, { cabecera: v })}
                onPresidencial={(v) => setPresidencial(m.id, v)}
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
              ¿Seguro que quieres eliminar «{etiquetaMesa(porBorrar)}»? Sus{" "}
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

function svgMesa(mesa: Mesa, nombreDe: (id: string) => Invitado | undefined) {
  const rect = mesa.tipo === "rectangular";
  const VW = rect ? 400 : 280;
  const VH = rect ? 240 : 280;
  const n = Math.max(mesa.plazas, mesa.invitados.length);
  const pos = posicionesSillas(mesa.tipo, n, Boolean(mesa.cabecera));
  const r = n > 16 ? 11 : n > 10 ? 13 : 16;
  const fs = r > 13 ? 11 : 9;

  const mesaShape =
    mesa.tipo === "redonda"
      ? `<ellipse cx="${VW / 2}" cy="${VH / 2}" rx="${VW * 0.31}" ry="${VH * 0.31}" fill="#f4eee1" stroke="#cdbfa4"/>`
      : `<rect x="${VW * 0.19}" y="${VH * 0.19}" width="${VW * 0.62}" height="${VH * 0.62}" rx="${rect ? 16 : 8}" fill="#f4eee1" stroke="#cdbfa4"/>`;

  const serif = "'Cormorant Garamond', Georgia, serif";
  const sillas = pos
    .map((p, i) => {
      const x = (p.x / 100) * VW;
      const y = (p.y / 100) * VH;
      const inv = mesa.invitados[i] ? nombreDe(mesa.invitados[i]) : undefined;
      return `<g>
        <circle cx="${x}" cy="${y}" r="${r}" fill="${inv ? "#e9ddc6" : "#faf7f0"}" stroke="#b89b6a" stroke-width="1"/>
        <text x="${x}" y="${y}" dy="0.35em" text-anchor="middle" font-size="${fs}" font-family="${serif}" font-weight="600" fill="#3a342b">${i + 1}</text>
      </g>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${VW} ${VH}" width="${rect ? 360 : 280}" xmlns="http://www.w3.org/2000/svg">${mesaShape}${sillas}</svg>`;
}

function imprimirMesas(
  cfg: MesasConfig,
  nombreDe: (id: string) => Invitado | undefined,
) {
  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

  const boda = loadBoda();
  const pareja = nombrePareja(boda);
  const fecha = fechaLarga(boda);

  const portada = `<section class="portada">
    <div class="pmark">Plano de mesas</div>
    <h1 class="pnombre">${esc(pareja === "Vuestra boda" ? "Nuestra boda" : pareja)}</h1>
    ${fecha ? `<div class="pfecha">${esc(fecha)}</div>` : ""}
    <div class="prule"></div>
    <div class="pinfo">${cfg.mesas.length} mesas · ${cfg.mesas.reduce((s, m) => s + m.invitados.length, 0)} invitados sentados</div>
  </section>`;

  const paginas = [...cfg.mesas]
    .sort((a, b) =>
      Number(Boolean(b.presidencial)) - Number(Boolean(a.presidencial)) || a.numero - b.numero,
    )
    .map((m) => {
      const filas = m.invitados
        .map((id, i) => {
          const inv = nombreDe(id);
          return `<li><span class="li-n">${i + 1}.</span> ${esc(nombreCompleto(inv))} <span class="ini">${esc(iniciales(inv))}</span></li>`;
        })
        .join("");
      const dos = m.invitados.length > 6 ? " dos" : "";
      return `<section class="mesa">
        <div class="mhead">
          ${m.presidencial ? `<div class="mpres">★ Mesa presidencial</div>` : ""}
          <div class="mnum">Mesa ${m.numero}</div>
          ${m.nombre ? `<div class="mnom">${esc(m.nombre)}</div>` : ""}
        </div>
        <div class="dibujo">${svgMesa(m, nombreDe)}</div>
        <ol class="${dos.trim()}">${filas || '<li class="vacia">Sin invitados asignados</li>'}</ol>
      </section>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Plano de mesas · ${esc(pareja)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=EB+Garamond:ital@0;1&display=swap');
    @page { margin: 15mm; }
    * { box-sizing: border-box; }
    body { margin:0; color:#26221d; font-family: 'EB Garamond', Georgia, serif; }
    section { page-break-after: always; text-align:center; }
    section:last-child { page-break-after: auto; }

    .portada {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      min-height: 245mm; gap: 5mm;
    }
    .pmark { font-family:'EB Garamond',serif; letter-spacing:.32em; text-transform:uppercase;
      font-size: 11pt; color:#8a6d3b; }
    .pnombre { font-family:'Cormorant Garamond',serif; font-weight:500; font-size: 42pt;
      margin: 0; line-height:1.1; }
    .pfecha { font-family:'Cormorant Garamond',serif; font-size: 16pt; color:#6b6459; }
    .prule { width: 46mm; height:1px; background:#c9bda6; margin: 3mm 0; }
    .pinfo { font-size: 11pt; color:#8a8172; letter-spacing:.04em; }

    .mhead { margin-bottom: 5mm; }
    .mpres { font-family:'EB Garamond',serif; letter-spacing:.24em; text-transform:uppercase;
      font-size: 10pt; color:#8a6d3b; margin-bottom: 2mm; }
    .mnum { font-family:'Cormorant Garamond',serif; font-weight:600; font-size: 30pt; line-height:1; }
    .mnom { font-family:'Cormorant Garamond',serif; font-size: 15pt; color:#8a6d3b; margin-top:1mm; }
    .dibujo { margin: 0 0 6mm; }
    ol { list-style:none; padding:0; margin: 0 auto; max-width: 150mm; text-align:left; }
    ol.dos { column-count: 2; column-gap: 14mm; max-width: 175mm; }
    li { font-size: 12pt; padding: 1.6mm 0; border-bottom: 1px solid #ece5d6;
      break-inside: avoid; }
    li .li-n { color:#8a6d3b; font-family:'Cormorant Garamond',serif; font-weight:600; }
    li .ini { color:#b0a894; font-size: 9pt; letter-spacing:.08em; }
    li.vacia { color:#a29a89; border:none; font-style:italic; }
  </style></head><body>${portada}${paginas}
  <script>
    window.onload=function(){setTimeout(function(){window.print();},450);};
  <\/script>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Permite las ventanas emergentes para poder imprimir el plano.");
    return;
  }
  w.document.write(html);
  w.document.close();
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
        viene ? "bg-emerald-600" : "bg-[#a9864d]"
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
  onNumero,
  onPlazas,
  onCabecera,
  onPresidencial,
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
  onNumero: (n: number) => boolean;
  onPlazas: (n: number) => void;
  onCabecera: (v: boolean) => void;
  onPresidencial: (v: boolean) => void;
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

  const [errNum, setErrNum] = useState(false);

  const filtrados = q.trim()
    ? sinMesa.filter((i) => nombreCompleto(i).toLowerCase().includes(q.trim().toLowerCase()))
    : sinMesa;

  return (
    <div
      className={`rounded-xl border p-4 ${
        mesa.presidencial ? "border-accent bg-accent-soft/15" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-foreground px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Mesa
            </span>
            <input
              type="number"
              min={1}
              defaultValue={mesa.numero}
              key={mesa.numero}
              onFocus={() => setErrNum(false)}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (n === mesa.numero) return;
                if (!onNumero(n)) {
                  setErrNum(true);
                  e.target.value = String(mesa.numero);
                }
              }}
              className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-center font-display text-xl outline-none focus:border-accent"
              title="Número de mesa"
            />
            <label
              className={`ml-auto flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-xs ${
                mesa.presidencial
                  ? "border-accent bg-accent text-white"
                  : "border-line text-muted hover:border-accent"
              }`}
              title="Solo puede haber una mesa presidencial"
            >
              <input
                type="checkbox"
                checked={Boolean(mesa.presidencial)}
                onChange={(e) => onPresidencial(e.target.checked)}
                className="hidden"
              />
              ★ Presidencial
            </label>
          </div>
          <input
            defaultValue={mesa.nombre}
            placeholder="Ponle un nombre a la mesa (opcional)"
            onBlur={(e) => onRename(e.target.value.trim())}
            className="mt-2 w-full rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-accent"
          />
          {errNum && (
            <p className="mt-1 text-xs text-[#7b2233]">Ese número de mesa ya está en uso.</p>
          )}
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            {LABEL_TIPO[mesa.tipo]} · Plazas
            <input
              type="number"
              min={1}
              value={mesa.plazas}
              onChange={(e) => onPlazas(Math.max(1, Number(e.target.value)))}
              className="w-14 rounded border border-line bg-surface px-1 py-0.5 text-xs text-foreground outline-none focus:border-accent"
              title="Plazas de la mesa"
            />
            <span className={llena ? "font-semibold text-[#7b2233]" : ""}>
              · {mesa.invitados.length} sentados
            </span>
          </p>
          {mesa.tipo === "rectangular" && (
            <div className="mt-3 rounded-lg bg-[#f5f1ea] p-2.5">
              <Toggle
                checked={Boolean(mesa.cabecera)}
                onChange={onCabecera}
                label="Sillas en las cabeceras"
                description="Añade una silla en cada extremo de la mesa."
              />
            </div>
          )}
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
        <div className="my-3">
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
  const posiciones = posicionesSillas(mesa.tipo, n, Boolean(mesa.cabecera));

  // Todo en %: el dibujo escala al ancho disponible (móvil incluido).
  const rect = mesa.tipo === "rectangular";
  const maxAncho = rect ? 320 : 230;
  // Altura reservada con el truco padding-bottom (fiable en todos los móviles).
  const padPct = rect ? 66.66 : 100;
  const seatPct = n > 16 ? 8.5 : n > 10 ? 10 : 12;

  return (
    <div className="mx-auto w-full py-1" style={{ maxWidth: maxAncho }}>
      <div className="relative w-full">
        <div style={{ paddingBottom: `${padPct}%` }} />
        <div
          className="absolute bg-accent-soft/50 ring-1 ring-accent/30"
          style={{
            left: "22%",
            top: "22%",
            width: "56%",
            height: "56%",
            borderRadius: mesa.tipo === "redonda" ? "9999px" : rect ? "12px" : "8px",
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
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${seatPct}%`,
                aspectRatio: "1 / 1",
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Posiciones en % (centro del asiento) para cada silla según el tipo.
function posicionesSillas(
  tipo: TipoMesa,
  n: number,
  cabecera: boolean,
): { x: number; y: number }[] {
  if (n === 0) return [];
  // Todo dentro de un margen seguro (~10-90%) para que las sillas no se corten.
  if (tipo === "redonda") {
    const r = 37;
    return Array.from({ length: n }, (_, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return { x: 50 + r * Math.cos(ang), y: 50 + r * Math.sin(ang) };
    });
  }
  if (tipo === "rectangular") {
    const out: { x: number; y: number }[] = [];
    const lados = cabecera ? Math.max(0, n - 2) : n;
    const top = Math.ceil(lados / 2);
    const bottom = lados - top;
    for (let i = 0; i < top; i++) out.push({ x: pct(i, top), y: 18 });
    for (let i = 0; i < bottom; i++) out.push({ x: pct(i, bottom), y: 82 });
    if (cabecera && n >= 1) out.push({ x: 12, y: 50 });
    if (cabecera && n >= 2) out.push({ x: 88, y: 50 });
    return out;
  }
  // cuadrada: repartir parejo entre los 4 lados, sin sillas en las esquinas.
  const base = Math.floor(n / 4);
  const rem = n % 4;
  const counts = [0, 1, 2, 3].map((k) => base + (k < rem ? 1 : 0)); // t, r, b, l
  const out: { x: number; y: number }[] = [];
  const spread = (i: number, count: number) => (count === 1 ? 50 : 33 + (i * 34) / (count - 1));
  counts.forEach((count, side) => {
    for (let i = 0; i < count; i++) {
      const t = spread(i, count);
      if (side === 0) out.push({ x: t, y: 15 });
      else if (side === 1) out.push({ x: 85, y: t });
      else if (side === 2) out.push({ x: t, y: 85 });
      else out.push({ x: 15, y: t });
    }
  });
  return out;
}

function pct(i: number, total: number) {
  if (total === 1) return 50;
  return 18 + (i * 64) / (total - 1);
}
