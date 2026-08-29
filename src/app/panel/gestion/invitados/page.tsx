"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Stat } from "@/components/ui";
import { leerNombresExcel } from "@/lib/import-excel";
import {
  loadResponses,
  fetchResponsesServer,
  updateResponse,
  valorRespuesta,
  type RsvpResponse,
} from "@/lib/rsvp";
import {
  labelsFormulario,
  formatoPregunta,
  LABEL_BUS,
  LABEL_BUS_IDA,
  LABEL_BUS_VUELTA,
} from "@/lib/formulario";
import {
  descargarInvitadosExcel,
  descargarRespuestasExcel,
  descargarAlergiasExcel,
} from "@/lib/export-excel";
import {
  loadInvitados,
  loadColumnas,
  crearInvitado,
  aplicarRespuestaAInvitado,
  loadGrupos,
  saveGrupos,
  loadSubgrupos,
  saveSubgrupos,
  addInvitado,
  updateInvitado,
  updateInvitadoExtra,
  removeInvitado,
  addColumna,
  updateColumna,
  removeColumna,
  moveColumna,
  resetColumnas,
  importarInvitados,
  resumenInvitados,
  VIENE_OPCIONES,
  TIPO_OPCIONES,
  TIPO_COLUMNA_LABEL,
  COLUMNAS_SUGERIDAS,
  COLUMNAS_FIJAS,
  loadFijasOcultas,
  toggleFija,
  type Invitado,
  type ColumnaInvitado,
  type TipoColumna,
  type Viene,
  type TipoInvitado,
} from "@/lib/invitados";


// Celda editable. El texto completo se ve al pasar el ratón (tooltip nativo).
function CeldaTexto({
  value,
  onSave,
  align = "",
  muted = false,
  numero = false,
}: {
  value: string;
  onSave: (v: string) => void;
  align?: string;
  muted?: boolean;
  numero?: boolean;
}) {
  return (
    <input
      inputMode={numero ? "numeric" : undefined}
      defaultValue={value}
      title={value || undefined}
      onBlur={(e) => onSave(e.target.value.trim())}
      className={`w-full min-w-[7rem] truncate bg-transparent px-2.5 py-2 text-sm outline-none focus:bg-accent-soft/30 ${align} ${
        muted ? "text-muted" : ""
      }`}
    />
  );
}

function CeldaSelect({
  value,
  opciones,
  onSave,
  tone = "",
  muted = false,
}: {
  value: string;
  opciones: string[];
  onSave: (v: string) => void;
  tone?: string;
  muted?: boolean;
}) {
  const lista = value && !opciones.includes(value) ? [...opciones, value] : opciones;
  return (
    <select
      value={value}
      title={value || undefined}
      onChange={(e) => onSave(e.target.value)}
      className={`w-full min-w-[6rem] bg-transparent px-2 py-2 text-sm outline-none focus:bg-accent-soft/30 ${
        tone || (muted ? "text-muted" : "")
      }`}
    >
      {lista.map((o) => (
        <option key={o || "—"} value={o}>
          {o || "—"}
        </option>
      ))}
    </select>
  );
}

// Tarjeta de un invitado para móvil (equivalente a una fila de la tabla).
function InvitadoCard({
  inv: i,
  cols,
  grupos,
  subgrupos,
  verFija,
  onBorrar,
}: {
  inv: Invitado;
  cols: ColumnaInvitado[];
  grupos: string[];
  subgrupos: string[];
  verFija: (k: string) => boolean;
  onBorrar: () => void;
}) {
  const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-2 border-t border-line/70 py-1.5">
      <span className="shrink-0 text-xs text-muted">{label}</span>
      <div className="min-w-0 flex-1 text-right">{children}</div>
    </div>
  );
  return (
    <Card className="space-y-1 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <CeldaTexto
            value={i.nombre}
            onSave={(v) => updateInvitado(i.id, { nombre: v })}
            align="font-medium !min-w-0"
          />
          <CeldaTexto
            value={i.apellido}
            onSave={(v) => updateInvitado(i.id, { apellido: v })}
            align="!min-w-0 text-muted"
          />
        </div>
        <button
          onClick={onBorrar}
          className="shrink-0 rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar invitado"
        >
          🗑
        </button>
      </div>
      {verFija("viene") && (
        <Campo label="¿Viene?">
          <CeldaSelect
            value={i.viene}
            opciones={[...VIENE_OPCIONES]}
            onSave={(v) => updateInvitado(i.id, { viene: v as Viene })}
            tone={
              i.viene === "Sí"
                ? "text-emerald-700"
                : i.viene === "No"
                  ? "text-[#7b2233]"
                  : "text-amber-700"
            }
          />
        </Campo>
      )}
      {verFija("grupo") && (
        <Campo label="Grupo">
          <CeldaSelect
            value={i.grupo}
            opciones={["", ...grupos]}
            onSave={(v) => updateInvitado(i.id, { grupo: v })}
            muted
          />
        </Campo>
      )}
      {verFija("subgrupo") && (
        <Campo label="Subgrupo">
          <CeldaSelect
            value={i.subgrupo}
            opciones={["", ...subgrupos]}
            onSave={(v) => updateInvitado(i.id, { subgrupo: v })}
            muted
          />
        </Campo>
      )}
      {verFija("tipo") && (
        <Campo label="Adulto / Niño">
          <CeldaSelect
            value={i.tipo}
            opciones={[...TIPO_OPCIONES]}
            onSave={(v) => updateInvitado(i.id, { tipo: v as TipoInvitado })}
            muted
          />
        </Campo>
      )}
      {cols.map((c) => (
        <Campo key={c.id} label={c.nombre}>
          {c.tipo === "sino" ? (
            <CeldaSelect
              value={i.extra[c.id] ?? ""}
              opciones={["", "Sí", "No"]}
              onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
              muted
            />
          ) : c.tipo === "lista" ? (
            <CeldaSelect
              value={i.extra[c.id] ?? ""}
              opciones={["", ...(c.opciones ?? "").split(",").map((o) => o.trim()).filter(Boolean)]}
              onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
              muted
            />
          ) : (
            <CeldaTexto
              value={i.extra[c.id] ?? ""}
              onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
              muted
              numero={c.tipo === "numero"}
              align="!min-w-0 text-right"
            />
          )}
        </Campo>
      ))}
    </Card>
  );
}

function DescargaMenu({
  opciones,
}: {
  opciones: { label: string; run: () => void }[];
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-accent"
      >
        ⬇ Descargar ▾
      </button>
      {abierto && (
        <div className="absolute right-0 z-30 mt-1 w-60 overflow-hidden rounded-md border border-line bg-background text-sm shadow-lg">
          {opciones.map((o) => (
            <button
              key={o.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                o.run();
                setAbierto(false);
              }}
              className="block w-full px-3 py-2 text-left hover:bg-accent-soft/40"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvitadosPage() {
  const [inv, setInv] = useState<Invitado[] | null>(null);
  const [cols, setCols] = useState<ColumnaInvitado[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [subgrupos, setSubgrupos] = useState<string[]>([]);
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<"" | Viene>("");
  const [ajustes, setAjustes] = useState(false);
  const [vista, setVista] = useState<"gestion" | "respuestas">("gestion");
  const [respuestas, setRespuestas] = useState<RsvpResponse[]>([]);
  const [fijasOcultas, setFijasOcultas] = useState<string[]>([]);
  const [porBorrar, setPorBorrar] = useState<Invitado | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const verFija = (k: string) => !fijasOcultas.includes(k);

  const importar = async (file: File) => {
    try {
      const filas = await leerNombresExcel(file);
      if (filas.length === 0) {
        alert("No se han encontrado nombres en el archivo.");
        return;
      }
      const n = importarInvitados(filas);
      alert(
        n > 0
          ? `Se han añadido ${n} invitado${n === 1 ? "" : "s"}.`
          : "Todos los invitados del archivo ya estaban en la lista.",
      );
    } catch {
      alert("No se ha podido leer el archivo. Asegúrate de que es un Excel (.xlsx) o CSV.");
    }
  };

  useEffect(() => {
    const sync = () => {
      setInv(loadInvitados());
      setCols(loadColumnas());
      setGrupos(loadGrupos());
      setSubgrupos(loadSubgrupos());
      setPreguntas(labelsFormulario());
      setRespuestas(loadResponses("demo"));
      setFijasOcultas(loadFijasOcultas());
      // Respuestas reales de la web (servidor).
      fetchResponsesServer().then((srv) => {
        if (srv.length) setRespuestas((prev) => [...srv, ...prev.filter((p) => p.id.startsWith("seed-"))]);
      });
    };
    sync();
    // Primera vez (lista vacía): abrir directamente la configuración de la tabla.
    if (loadInvitados().length === 0) setAjustes(true);
    window.addEventListener("webodas:invitados", sync);
    window.addEventListener("webodas:rsvp", sync);
    window.addEventListener("webodas:formulario", sync);
    return () => {
      window.removeEventListener("webodas:invitados", sync);
      window.removeEventListener("webodas:rsvp", sync);
      window.removeEventListener("webodas:formulario", sync);
    };
  }, []);

  if (!inv) return null;

  const r = resumenInvitados();
  const filas = filtro ? inv.filter((i) => i.viene === filtro) : inv;

  const pendientesRespuesta = respuestas.filter((x) => !x.aplicada).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => setVista("gestion")}
          className={`rounded-xl border px-4 py-3 text-left transition ${
            vista === "gestion"
              ? "border-foreground bg-foreground text-white"
              : "border-line bg-surface hover:border-accent"
          }`}
        >
          <span className="block font-display text-base">Mi lista de invitados</span>
          <span className={`block text-xs ${vista === "gestion" ? "text-white/70" : "text-muted"}`}>
            Tu lista de trabajo: quién viene, mesas, detalles, regalos…
          </span>
        </button>
        <button
          onClick={() => setVista("respuestas")}
          className={`rounded-xl border px-4 py-3 text-left transition ${
            vista === "respuestas"
              ? "border-foreground bg-foreground text-white"
              : "border-line bg-surface hover:border-accent"
          }`}
        >
          <span className="flex items-center gap-2 font-display text-base">
            Respuestas del formulario
            {pendientesRespuesta > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-xs font-normal text-white">
                {pendientesRespuesta} sin revisar
              </span>
            )}
          </span>
          <span
            className={`block text-xs ${vista === "respuestas" ? "text-white/70" : "text-muted"}`}
          >
            Lo que han rellenado tus invitados en la web
          </span>
        </button>
      </div>

      {vista === "respuestas" ? (
        <VistaRespuestas respuestas={respuestas} invitados={inv} columnas={cols} />
      ) : (
        <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Personas" value={String(r.personas)} sub={`${r.adultos} adultos · ${r.ninos} niños`} />
        <Stat label="Confirmadas" value={String(r.confirmadas)} tone="positive" />
        <Stat label="Pendientes" value={String(r.pendientes)} />
        <Stat label="No vienen" value={String(r.noVienen)} tone="negative" />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(["", ...VIENE_OPCIONES] as ("" | Viene)[]).map((e) => (
          <button
            key={e || "todos"}
            onClick={() => setFiltro(e)}
            className={`rounded-full px-3 py-1 text-xs ${
              filtro === e ? "bg-foreground text-white" : "border border-line text-muted"
            }`}
          >
            {e === "" ? "Todos" : e === "Sí" ? "Vienen" : e === "No" ? "No vienen" : "Pendientes"}
          </button>
        ))}
        <div className="relative ml-auto">
          <DescargaMenu
            opciones={[
              { label: "Descargar Excel de la lista", run: () => descargarInvitadosExcel(inv, cols, fijasOcultas) },
              { label: "Descargar listado de alergias", run: () => descargarAlergiasExcel(inv, cols) },
            ]}
          />
        </div>
        <button
          onClick={() => setAjustes((v) => !v)}
          className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-muted hover:text-accent"
        >
          ⚙ Ajustes de la lista
        </button>
      </div>

      {ajustes && (
        <AjustesModal
          grupos={grupos}
          subgrupos={subgrupos}
          cols={cols}
          fijasOcultas={fijasOcultas}
          preguntas={preguntas}
          onClose={() => setAjustes(false)}
        />
      )}

      <RecuentoBus inv={inv} cols={cols} />

      {/* Móvil: una tarjeta por invitado */}
      <div className="space-y-3 md:hidden">
        {filas.length === 0 && (
          <Card className="text-center text-sm text-muted">
            {filtro ? "Nadie en este estado." : "Aún no has añadido invitados."}
          </Card>
        )}
        {filas.map((i) => (
          <InvitadoCard
            key={i.id}
            inv={i}
            cols={cols}
            grupos={grupos}
            subgrupos={subgrupos}
            verFija={verFija}
            onBorrar={() => setPorBorrar(i)}
          />
        ))}
        <button
          onClick={() => addInvitado()}
          className="w-full rounded-lg border border-dashed border-line py-2.5 text-sm font-medium text-accent"
        >
          + Añadir invitado
        </button>
      </div>

      <Card className="hidden p-0 md:block">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:border-b [&>th]:border-line [&>th]:bg-surface">
                <th className="!z-20 left-0 w-40 px-2.5 py-2.5">Nombre</th>
                <th className="!z-20 left-40 w-40 px-2.5 py-2.5">Apellido</th>
                {verFija("viene") && <th className="px-2.5 py-2.5">¿Viene?</th>}
                {verFija("grupo") && <th className="bg-emerald-50/60 px-2.5 py-2.5">Grupo</th>}
                {verFija("subgrupo") && (
                  <th className="bg-emerald-50/60 px-2.5 py-2.5">Subgrupo</th>
                )}
                {verFija("tipo") && <th className="px-2.5 py-2.5">Adulto/Niño</th>}
                {cols.map((c) => (
                  <th key={c.id} className="px-2.5 py-2.5">
                    {c.nombre}
                  </th>
                ))}
                <th className="w-10 px-2.5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((i) => (
                <tr key={i.id} className="group align-top hover:bg-neutral-50/70">
                  <td className="sticky left-0 z-10 w-40 bg-surface px-0 group-hover:bg-neutral-50">
                    <CeldaTexto
                      value={i.nombre}
                      onSave={(v) => updateInvitado(i.id, { nombre: v })}
                      align="font-medium"
                    />
                  </td>
                  <td className="sticky left-40 z-10 w-40 border-r border-line bg-surface px-0 group-hover:bg-neutral-50">
                    <CeldaTexto
                      value={i.apellido}
                      onSave={(v) => updateInvitado(i.id, { apellido: v })}
                    />
                  </td>
                  {verFija("viene") && (
                    <td className="px-0">
                      <CeldaSelect
                        value={i.viene}
                        opciones={[...VIENE_OPCIONES]}
                        onSave={(v) => updateInvitado(i.id, { viene: v as Viene })}
                        tone={
                          i.viene === "Sí"
                            ? "text-emerald-700"
                            : i.viene === "No"
                              ? "text-[#7b2233]"
                              : "text-amber-700"
                        }
                      />
                    </td>
                  )}
                  {verFija("grupo") && (
                    <td className="border-l border-line bg-emerald-50/40 px-0">
                      <CeldaSelect
                        value={i.grupo}
                        opciones={["", ...grupos]}
                        onSave={(v) => updateInvitado(i.id, { grupo: v })}
                        muted
                      />
                    </td>
                  )}
                  {verFija("subgrupo") && (
                    <td className="border-r border-line bg-emerald-50/40 px-0">
                      <CeldaSelect
                        value={i.subgrupo}
                        opciones={["", ...subgrupos]}
                        onSave={(v) => updateInvitado(i.id, { subgrupo: v })}
                        muted
                      />
                    </td>
                  )}
                  {verFija("tipo") && (
                    <td className="px-0">
                      <CeldaSelect
                        value={i.tipo}
                        opciones={[...TIPO_OPCIONES]}
                        onSave={(v) => updateInvitado(i.id, { tipo: v as TipoInvitado })}
                        muted
                      />
                    </td>
                  )}
                  {cols.map((c) => (
                    <td key={c.id} className="px-0">
                      {c.tipo === "sino" ? (
                        <CeldaSelect
                          value={i.extra[c.id] ?? ""}
                          opciones={["", "Sí", "No"]}
                          onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
                          muted
                        />
                      ) : c.tipo === "lista" ? (
                        <CeldaSelect
                          value={i.extra[c.id] ?? ""}
                          opciones={[
                            "",
                            ...(c.opciones ?? "").split(",").map((o) => o.trim()).filter(Boolean),
                          ]}
                          onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
                          muted
                        />
                      ) : (
                        <CeldaTexto
                          value={i.extra[c.id] ?? ""}
                          onSave={(v) => updateInvitadoExtra(i.id, c.id, v)}
                          muted
                          numero={c.tipo === "numero"}
                          align={c.tipo === "numero" ? "text-right" : ""}
                        />
                      )}
                    </td>
                  ))}
                  <td className="w-10 px-1 text-center align-middle">
                    <button
                      onClick={() => setPorBorrar(i)}
                      className="mx-auto grid h-8 w-8 place-items-center rounded text-muted transition hover:bg-red-50 hover:text-red-600"
                      title="Eliminar invitado"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={3 + COLUMNAS_FIJAS.filter((f) => verFija(f.key)).length + cols.length} className="px-5 py-8 text-center text-sm text-muted">
                    {filtro ? "Nadie en este estado." : "Aún no has añadido invitados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <button onClick={() => addInvitado()} className="text-sm font-medium text-accent">
            + Añadir invitado
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg">Importar invitados desde Excel</h3>
        <p className="mt-1 text-sm text-muted">
          Sube un archivo Excel (<strong>.xlsx</strong>) o CSV con los{" "}
          <strong>nombres en la columna A</strong> y los <strong>apellidos en la columna B</strong>,
          empezando en la <strong>fila 1</strong>.
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          ↑ Elegir archivo e importar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importar(f);
            e.target.value = "";
          }}
        />
      </Card>
        </>
      )}

      {porBorrar && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPorBorrar(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-background p-5 shadow-xl"
          >
            <h3 className="font-display text-lg">Eliminar invitado</h3>
            <p className="mt-1 text-sm text-muted">
              ¿Seguro que quieres eliminar a{" "}
              <strong className="text-foreground">
                {porBorrar.nombre} {porBorrar.apellido}
              </strong>
              ? Esta acción no se puede deshacer.
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
                  removeInvitado(porBorrar.id);
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

function RecuentoBus({ inv, cols }: { inv: Invitado[]; cols: ColumnaInvitado[] }) {
  const colDe = (label: string) =>
    cols.find((c) => c.preguntaRsvp === label) ??
    cols.find((c) => c.nombre.toLowerCase() === label.toLowerCase());
  const colBus = colDe(LABEL_BUS);
  const colIda = colDe(LABEL_BUS_IDA);
  const colVuelta = colDe(LABEL_BUS_VUELTA);
  if (!colBus && !colIda && !colVuelta) return null;

  const noEs = (v: string) => !v || v.trim().toLowerCase() === "no";
  const trayecto = (col?: ColumnaInvitado) => {
    const conteo: Record<string, number> = {};
    let total = 0;
    if (col)
      for (const i of inv) {
        const v = (i.extra[col.id] ?? "").trim();
        if (noEs(v)) continue;
        total++;
        conteo[v] = (conteo[v] ?? 0) + 1;
      }
    return { total, conteo };
  };

  const ida = trayecto(colIda);
  const vuelta = trayecto(colVuelta);
  const pidenBus = colBus
    ? inv.filter((i) => ["sí", "si"].includes((i.extra[colBus.id] ?? "").trim().toLowerCase())).length
    : inv.filter(
        (i) =>
          !noEs(colIda ? i.extra[colIda.id] ?? "" : "") ||
          !noEs(colVuelta ? i.extra[colVuelta.id] ?? "" : ""),
      ).length;

  if (pidenBus === 0 && ida.total === 0 && vuelta.total === 0) return null;

  const Bloque = ({
    titulo,
    total,
    conteo,
  }: {
    titulo: string;
    total: number;
    conteo?: Record<string, number>;
  }) => (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{titulo}</p>
      <p className="mt-0.5 font-display text-3xl leading-none">{total}</p>
      {conteo && Object.keys(conteo).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(conteo)
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full bg-accent-soft/50 px-2 py-0.5 text-xs"
              >
                {k} <strong className="text-accent">{n}</strong>
              </span>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="space-y-3">
      <div>
        <h3 className="font-display text-lg">Autobús</h3>
        <p className="text-xs text-muted">
          A partir de la columna del autobús de tu lista (invitados y acompañantes).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Bloque titulo="Solicitan autobús" total={pidenBus} />
        <Bloque titulo="Bus de ida" total={ida.total} conteo={ida.conteo} />
        <Bloque titulo="Bus de vuelta" total={vuelta.total} conteo={vuelta.conteo} />
      </div>
    </Card>
  );
}

function VistaRespuestas({
  respuestas,
  invitados,
  columnas,
}: {
  respuestas: RsvpResponse[];
  invitados: Invitado[];
  columnas: ColumnaInvitado[];
}) {
  const [porVolcar, setPorVolcar] = useState<
    { resp: RsvpResponse; sel: string; selA: string } | null
  >(null);

  if (respuestas.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">
          Aún no ha llegado ninguna respuesta del formulario de confirmación de la web.
        </p>
      </Card>
    );
  }

  const asociadas = columnas.filter((c) => c.preguntaRsvp);

  // Convierte una respuesta en pares {columna, valor}: las preguntas asociadas
  // van a su columna; el resto crea/usa una columna con el nombre de la pregunta.
  const rpcDe = (respuestas: Record<string, string>, asiste: string) => {
    const out: { columna: string; valor: string }[] = [];
    const yaPuestas = new Set<string>();
    for (const c of asociadas) {
      const v = valorRespuesta(
        { ...({} as RsvpResponse), respuestas, asiste, acompanantes: 0 },
        c.preguntaRsvp as string,
      );
      if (v) {
        out.push({ columna: c.nombre, valor: v });
        yaPuestas.add(c.preguntaRsvp as string);
      }
    }
    for (const [k, v] of Object.entries(respuestas)) {
      if (!v || k === "Acompañante" || yaPuestas.has(k)) continue;
      out.push({ columna: k, valor: v });
    }
    return out;
  };

  const volcar = (resp: RsvpResponse, selInv: string, selAcomp: string) => {
    let invId = selInv;
    if (selInv === "__nuevo" || !selInv) {
      invId = crearInvitado(resp.nombre, resp.apellido ?? "").id;
    } else {
      updateInvitado(invId, { nombre: resp.nombre, apellido: resp.apellido ?? "" });
    }
    const viene: Viene = resp.asiste === "Sí" ? "Sí" : "No";
    aplicarRespuestaAInvitado(invId, viene, rpcDe(resp.respuestas, resp.asiste));

    let acompId: string | undefined;
    if (resp.acompNombre || resp.acompApellido) {
      acompId = selAcomp;
      if (selAcomp === "__nuevo" || !selAcomp) {
        acompId = crearInvitado(resp.acompNombre ?? "", resp.acompApellido ?? "").id;
      } else {
        updateInvitado(acompId, {
          nombre: resp.acompNombre ?? "",
          apellido: resp.acompApellido ?? "",
        });
      }
      aplicarRespuestaAInvitado(acompId, "Sí", rpcDe(resp.respuestasAcomp ?? {}, "Sí"));
    }

    updateResponse("demo", resp.id, {
      invitadoId: invId,
      acompInvitadoId: acompId,
      aplicada: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DescargaMenu
          opciones={[
            { label: "Descargar Excel de respuestas", run: () => descargarRespuestasExcel(respuestas) },
            { label: "Descargar listado de alergias", run: () => descargarAlergiasExcel(invitados, columnas) },
          ]}
        />
      </div>
      {asociadas.length === 0 && (
        <Card className="text-sm text-muted">
          Consejo: en <strong>⚙ Ajustes de la lista → Columnas</strong> puedes asociar cada
          pregunta a una columna concreta. Si no lo haces, al volcar se crea una columna con el
          nombre de la pregunta.
        </Card>
      )}
      <div className="space-y-1.5">
        {respuestas.map((resp) => (
          <RespuestaCard
            key={resp.id}
            resp={resp}
            invitados={invitados}
            onVolcar={(r, s, a) => setPorVolcar({ resp: r, sel: s, selA: a })}
          />
        ))}
      </div>

      {porVolcar && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPorVolcar(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-background p-5 shadow-xl"
          >
            <h3 className="font-display text-lg">¿Volcar esta respuesta?</h3>
            <p className="mt-1 text-sm text-muted">
              La información de{" "}
              <strong className="text-foreground">
                {porVolcar.resp.nombre} {porVolcar.resp.apellido}
              </strong>{" "}
              {porVolcar.resp.acompNombre || porVolcar.resp.acompApellido
                ? "y de su acompañante "
                : ""}
              sustituirá a la que tengas en tu lista (incluidos nombre y apellidos).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPorVolcar(null)}
                className="rounded-md border border-line px-3 py-1.5 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  volcar(porVolcar.resp, porVolcar.sel, porVolcar.selA);
                  setPorVolcar(null);
                }}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white"
              >
                Sí, volcar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectInvitado({
  value,
  onChange,
  invitados,
}: {
  value: string;
  onChange: (v: string) => void;
  invitados: Invitado[];
}) {
  const nombreDe = (id: string) => {
    const i = invitados.find((x) => x.id === id);
    return i ? `${i.nombre} ${i.apellido}`.trim() : "";
  };
  const [q, setQ] = useState(value && value !== "__nuevo" ? nombreDe(value) : "");
  const [abierto, setAbierto] = useState(false);

  const lista = invitados.filter((i) => i.nombre || i.apellido);
  const norm = (s: string) => s.toLowerCase();
  const filtrados = q.trim()
    ? lista.filter((i) => norm(`${i.nombre} ${i.apellido}`).includes(norm(q.trim())))
    : lista;

  const elegir = (id: string, texto: string) => {
    onChange(id);
    setQ(texto);
    setAbierto(false);
  };

  return (
    <div className="relative w-64">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        placeholder="Escribe nombre y apellido…"
        className="w-full rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-accent"
      />
      {value === "__nuevo" && !abierto && (
        <span className="mt-0.5 block text-[11px] text-accent">➕ Se creará un invitado nuevo</span>
      )}
      {abierto && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-background text-sm shadow-lg">
          <li>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir("__nuevo", "")}
              className="block w-full px-2.5 py-1.5 text-left text-accent hover:bg-accent-soft/40"
            >
              ➕ Crear invitado nuevo
            </button>
          </li>
          {filtrados.map((i) => {
            const txt = `${i.nombre} ${i.apellido}`.trim();
            return (
              <li key={i.id}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(i.id, txt)}
                  className={`block w-full px-2.5 py-1.5 text-left hover:bg-accent-soft/40 ${
                    value === i.id ? "bg-accent-soft/30 font-medium" : ""
                  }`}
                >
                  {txt}
                </button>
              </li>
            );
          })}
          {filtrados.length === 0 && (
            <li className="px-2.5 py-1.5 text-muted">Sin coincidencias</li>
          )}
        </ul>
      )}
    </div>
  );
}

function RespuestaCard({
  resp,
  invitados,
  onVolcar,
}: {
  resp: RsvpResponse;
  invitados: Invitado[];
  onVolcar: (resp: RsvpResponse, selInv: string, selAcomp: string) => void;
}) {
  const norm = (s: string) => s.trim().toLowerCase();
  const buscar = (n: string, a: string) =>
    invitados.find((i) => norm(i.nombre) === norm(n) && norm(i.apellido) === norm(a));
  const tieneAcomp = Boolean(resp.acompNombre || resp.acompApellido);

  const [sel, setSel] = useState(buscar(resp.nombre, resp.apellido ?? "")?.id ?? "__nuevo");
  const [selA, setSelA] = useState(
    buscar(resp.acompNombre ?? "", resp.acompApellido ?? "")?.id ?? "__nuevo",
  );

  const vinc = resp.invitadoId ? invitados.find((i) => i.id === resp.invitadoId) : undefined;
  const vincA = resp.acompInvitadoId
    ? invitados.find((i) => i.id === resp.acompInvitadoId)
    : undefined;

  const [abierto, setAbierto] = useState(false);

  const fmtFecha = (s: string) => {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const fecha = d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const hora = s.length > 10 ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "";
    return hora ? `${fecha} · ${hora}` : fecha;
  };

  const Bloque = ({
    titulo,
    data,
  }: {
    titulo: string;
    data: Record<string, string>;
  }) => {
    const entradas = Object.entries(data).filter(([, v]) => v !== undefined);
    return (
      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="text-sm font-semibold">{titulo}</p>
        {entradas.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Sin datos adicionales.</p>
        ) : (
          <dl className="mt-2 divide-y divide-line/70 text-sm">
            {entradas.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  };

  return (
    <Card className="p-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm"
      >
        <span className="text-xs text-muted">{abierto ? "▾" : "▸"}</span>
        <span className="min-w-0 flex-1 truncate font-medium">
          {resp.nombre} {resp.apellido}
          {tieneAcomp && (
            <span className="font-normal text-muted"> + {resp.acompNombre} {resp.acompApellido}</span>
          )}
        </span>
        <span className="hidden shrink-0 text-xs text-muted sm:inline">{fmtFecha(resp.fecha)}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            resp.asiste === "Sí"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-[#7b2233]/10 text-[#7b2233]"
          }`}
        >
          {resp.asiste === "Sí" ? "Viene" : "No viene"}
        </span>
        {resp.aplicada && <span className="shrink-0 text-xs text-muted">✓</span>}
      </button>

      {abierto && (
        <div className="space-y-3 border-t border-line px-4 py-3">
          {resp.email && (
            <p className="text-sm text-muted">
              Email: <span className="text-foreground">{resp.email}</span>
            </p>
          )}
          <Bloque titulo={`Datos de ${resp.nombre} ${resp.apellido ?? ""}`.trim()} data={resp.respuestas} />
          {tieneAcomp && (
            <Bloque
              titulo={`Datos de ${resp.acompNombre ?? ""} ${resp.acompApellido ?? ""}`.trim() || "Datos del acompañante"}
              data={resp.respuestasAcomp ?? {}}
            />
          )}

          {resp.aplicada ? (
            <p className="flex flex-wrap items-center gap-2 border-t border-line pt-2 text-sm text-emerald-700">
              ✓ Volcado{vinc ? ` a «${vinc.nombre} ${vinc.apellido}»` : ""}
              {vincA ? ` y «${vincA.nombre} ${vincA.apellido}»` : ""}
              <button
                onClick={() => onVolcar(resp, resp.invitadoId ?? "__nuevo", resp.acompInvitadoId ?? "__nuevo")}
                className="text-xs text-muted underline hover:text-foreground"
              >
                volver a volcar
              </button>
            </p>
          ) : (
            <div className="space-y-2 border-t border-line pt-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">
                  {resp.nombre} {resp.apellido} es, en mi lista:
                </span>
                <SelectInvitado value={sel} onChange={setSel} invitados={invitados} />
              </div>
              {tieneAcomp && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">
                    {resp.acompNombre} {resp.acompApellido} es, en mi lista:
                  </span>
                  <SelectInvitado value={selA} onChange={setSelA} invitados={invitados} />
                </div>
              )}
              <button
                onClick={() => onVolcar(resp, sel, selA)}
                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white"
              >
                Volcar a mi lista
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function AjustesModal({
  grupos,
  subgrupos,
  cols,
  fijasOcultas,
  preguntas,
  onClose,
}: {
  grupos: string[];
  subgrupos: string[];
  cols: ColumnaInvitado[];
  fijasOcultas: string[];
  preguntas: string[];
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoColumna>("texto");
  const [opciones, setOpciones] = useState("");
  const verFija = (k: string) => !fijasOcultas.includes(k);
  const buscarCol = (n: string) =>
    cols.find((c) => c.nombre.toLowerCase() === n.toLowerCase());
  const crear = () => {
    if (!nombre.trim()) return;
    addColumna(nombre.trim(), tipo, tipo === "lista" ? opciones : undefined);
    setNombre("");
    setOpciones("");
    setTipo("texto");
  };

  const sec = "rounded-lg border border-line bg-surface p-4";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-8 w-full max-w-2xl space-y-4 rounded-xl bg-background p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Ajustes de la lista</h2>
          <button onClick={onClose} className="text-2xl text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>

        <section className={sec}>
          <ListaEditable
            titulo="Grupos"
            descripcion="Bloques grandes de invitados (familia de la novia, amigos del novio…)."
            items={grupos}
            onChange={saveGrupos}
            placeholder="Nuevo grupo (p. ej. Familia de la novia)"
          />
        </section>

        <section className={sec}>
          <ListaEditable
            titulo="Subgrupos"
            descripcion="Subdivisiones dentro de un grupo (tíos, primos, universidad…)."
            items={subgrupos}
            onChange={saveSubgrupos}
            placeholder="Nuevo subgrupo (p. ej. Tíos, Primos, Universidad)"
          />
        </section>

        <section className={sec}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Columnas de la tabla</h3>
            <button
              onClick={() => {
                if (confirm("¿Volver a las columnas estándar? Se pierden las que hayas añadido."))
                  resetColumnas();
              }}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Restablecer estándar
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Marca las columnas que quieres ver. Ordénalas con ▲ ▼. Asocia una columna a una pregunta
            del formulario y sus respuestas se guardarán solas.
          </p>

          <ul className="mt-3 divide-y divide-line">
            <li className="flex items-center gap-2 py-2 text-sm text-muted">
              <input type="checkbox" checked disabled />
              <span className="flex-1">Nombre</span>
              <span className="text-[11px]">siempre</span>
            </li>
            <li className="flex items-center gap-2 py-2 text-sm text-muted">
              <input type="checkbox" checked disabled />
              <span className="flex-1">Apellido</span>
              <span className="text-[11px]">siempre</span>
            </li>

            {COLUMNAS_FIJAS.map((f) => (
              <li key={f.key} className="flex items-center gap-2 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={verFija(f.key)}
                  onChange={() => toggleFija(f.key)}
                />
                <span className="flex-1">{f.label}</span>
                <span className="text-[11px] text-muted">
                  {f.key === "tipo" ? "adulto / niño" : "listado"}
                </span>
              </li>
            ))}

            {cols.map((c, i) => (
              <li key={c.id} className="py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => removeColumna(c.id)}
                    title="Quitar de la tabla"
                  />
                  <span className="flex flex-col text-xs text-muted">
                    <button
                      onClick={() => moveColumna(c.id, -1)}
                      disabled={i === 0}
                      className="leading-none hover:text-foreground disabled:opacity-20"
                      title="Subir"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveColumna(c.id, 1)}
                      disabled={i === cols.length - 1}
                      className="leading-none hover:text-foreground disabled:opacity-20"
                      title="Bajar"
                    >
                      ▼
                    </button>
                  </span>
                  <span className="flex-1 font-medium">{c.nombre}</span>
                  {c.preguntaRsvp ? (
                    <span className="rounded bg-neutral-100 px-1.5 text-[11px] text-muted">
                      {TIPO_COLUMNA_LABEL[c.tipo]}
                    </span>
                  ) : (
                    <select
                      value={c.tipo}
                      onChange={(e) => updateColumna(c.id, { tipo: e.target.value as TipoColumna })}
                      className="rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] outline-none focus:border-accent"
                    >
                      <option value="texto">Texto</option>
                      <option value="sino">Sí / No</option>
                      <option value="numero">Número</option>
                      <option value="lista">Listado</option>
                    </select>
                  )}
                </div>
                {c.tipo === "lista" && !c.preguntaRsvp && (
                  <input
                    defaultValue={c.opciones ?? ""}
                    onBlur={(e) => updateColumna(c.id, { opciones: e.target.value })}
                    placeholder="Opciones separadas por comas"
                    className="mt-1.5 w-full rounded border border-line bg-surface px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                )}
                {preguntas.length > 0 && (
                  <label className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    Se rellena con la pregunta:
                    <select
                      value={c.preguntaRsvp ?? ""}
                      onChange={(e) => {
                        const pregunta = e.target.value;
                        if (!pregunta) {
                          updateColumna(c.id, { preguntaRsvp: "" });
                        } else {
                          const fmt = formatoPregunta(pregunta);
                          updateColumna(c.id, {
                            preguntaRsvp: pregunta,
                            tipo: fmt.tipo,
                            opciones: fmt.opciones,
                          });
                        }
                      }}
                      className="rounded border border-line bg-surface px-2 py-1 text-xs outline-none focus:border-accent"
                    >
                      <option value="">— ninguna</option>
                      {preguntas.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                      {c.preguntaRsvp && !preguntas.includes(c.preguntaRsvp) && (
                        <option value={c.preguntaRsvp}>{c.preguntaRsvp}</option>
                      )}
                    </select>
                  </label>
                )}
              </li>
            ))}

            {COLUMNAS_SUGERIDAS.filter((s) => !buscarCol(s.nombre)).map((s) => (
              <li key={s.nombre} className="flex items-center gap-2 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => addColumna(s.nombre, s.tipo)}
                  title="Añadir a la tabla"
                />
                <span className="flex-1">{s.nombre}</span>
                <span className="text-[11px] text-muted">
                  {s.tipo === "sino" ? "sí/no" : s.tipo === "numero" ? "número" : "texto"}
                </span>
              </li>
            ))}
          </ul>

          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-accent">
              + Crear una columna a medida
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la columna"
                className="min-w-[10rem] flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
              />
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoColumna)}
                className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="texto">Texto</option>
                <option value="sino">Sí / No</option>
                <option value="numero">Número</option>
                <option value="lista">Listado</option>
              </select>
              <button
                onClick={crear}
                disabled={!nombre.trim()}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              >
                Añadir
              </button>
            </div>
            {tipo === "lista" && (
              <input
                value={opciones}
                onChange={(e) => setOpciones(e.target.value)}
                placeholder="Opciones separadas por comas (Normal, Vegetariano, Niño…)"
                className="mt-2 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
              />
            )}
          </details>
        </section>

        <button
          onClick={onClose}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white"
        >
          Listo
        </button>
      </div>
    </div>
  );
}

function ListaEditable({
  titulo,
  descripcion,
  items,
  onChange,
  placeholder,
}: {
  titulo: string;
  descripcion?: string;
  items: string[];
  onChange: (list: string[]) => void;
  placeholder: string;
}) {
  const [nuevo, setNuevo] = useState("");
  const add = () => {
    const v = nuevo.trim();
    if (v && !items.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setNuevo("");
  };
  return (
    <div>
      <h4 className="text-sm font-semibold">{titulo}</h4>
      {descripcion && <p className="text-xs text-muted">{descripcion}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 && <span className="text-xs text-muted">Ninguno todavía.</span>}
        {items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs"
          >
            {it}
            <button
              onClick={() => onChange(items.filter((x) => x !== it))}
              className="text-muted hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={add}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}

