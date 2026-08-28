"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Stat } from "@/components/ui";
import { leerNombresExcel } from "@/lib/import-excel";
import {
  loadResponses,
  updateResponse,
  valorRespuesta,
  type RsvpResponse,
} from "@/lib/rsvp";
import { labelsFormulario, formatoPregunta } from "@/lib/formulario";
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

const cell =
  "w-full min-w-[7rem] bg-transparent px-2.5 py-2 text-sm outline-none focus:bg-accent-soft/30";

export default function InvitadosPage() {
  const [inv, setInv] = useState<Invitado[] | null>(null);
  const [cols, setCols] = useState<ColumnaInvitado[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [subgrupos, setSubgrupos] = useState<string[]>([]);
  const [preguntas, setPreguntas] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<"" | Viene>("");
  const [modalCol, setModalCol] = useState(false);
  const [ajustes, setAjustes] = useState(false);
  const [vista, setVista] = useState<"gestion" | "respuestas">("gestion");
  const [respuestas, setRespuestas] = useState<RsvpResponse[]>([]);
  const [fijasOcultas, setFijasOcultas] = useState<string[]>([]);
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
    };
    sync();
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
      <div className="grid gap-3 sm:grid-cols-4">
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
        <button
          onClick={() => setAjustes((v) => !v)}
          className="ml-auto rounded-full border border-dashed border-line px-3 py-1 text-xs text-muted hover:text-accent"
        >
          ⚙ Ajustes de la lista
        </button>
      </div>

      {ajustes && (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-surface p-4">
            <ListaEditable
              titulo="Grupos"
              descripcion="Bloques grandes de invitados (familia de la novia, amigos del novio…)."
              items={grupos}
              onChange={saveGrupos}
              placeholder="Nuevo grupo (p. ej. Familia de la novia)"
            />
          </div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <ListaEditable
              titulo="Subgrupos"
              descripcion="Subdivisiones dentro de un grupo (tíos, primos, universidad…)."
              items={subgrupos}
              onChange={saveSubgrupos}
              placeholder="Nuevo subgrupo (p. ej. Tíos, Primos, Universidad)"
            />
          </div>
          <div className="rounded-lg border border-line bg-surface p-4">
            <h4 className="text-sm font-semibold">Columnas fijas</h4>
            <p className="text-xs text-muted">
              Nombre y Apellido siempre están. Estas puedes mostrarlas u ocultarlas:
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {COLUMNAS_FIJAS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={verFija(f.key)}
                    onChange={() => toggleFija(f.key)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Columnas añadidas</h4>
              <button
                onClick={() => {
                  if (confirm("¿Volver a las columnas estándar? Se pierden las que hayas añadido.")) resetColumnas();
                }}
                className="text-xs text-muted underline hover:text-foreground"
              >
                Restablecer estándar
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Se pueden quitar, reordenar, y <strong>asociar a una pregunta del formulario</strong>{" "}
              (la respuesta se guardará sola en esa columna).
            </p>
            <p className="mt-2 text-xs text-muted">Usa ▲ ▼ para cambiar el orden de las columnas.</p>
            <ul className="mt-1 divide-y divide-line">
              {cols.map((c, i) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
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
                  <span className="font-medium">{c.nombre}</span>
                  {c.preguntaRsvp ? (
                    <span className="rounded bg-neutral-100 px-1.5 text-[11px] text-muted">
                      🔒 {TIPO_COLUMNA_LABEL[c.tipo]} (del formulario)
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
                  {c.tipo === "lista" && !c.preguntaRsvp && (
                    <input
                      defaultValue={c.opciones ?? ""}
                      onBlur={(e) => updateColumna(c.id, { opciones: e.target.value })}
                      placeholder="Opciones separadas por comas"
                      className="min-w-[10rem] flex-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] outline-none focus:border-accent"
                    />
                  )}
                  <button
                    onClick={() => removeColumna(c.id)}
                    className="ml-auto text-xs text-muted hover:text-red-600"
                    title="Quitar columna"
                  >
                    🗑
                  </button>
                  <label className="flex w-full items-center gap-2 text-xs text-muted">
                    Se rellena con la pregunta del formulario:
                    <select
                      value={c.preguntaRsvp ?? ""}
                      onChange={(e) => {
                        const pregunta = e.target.value;
                        if (!pregunta) {
                          updateColumna(c.id, { preguntaRsvp: "" });
                        } else {
                          const f = formatoPregunta(pregunta);
                          updateColumna(c.id, {
                            preguntaRsvp: pregunta,
                            tipo: f.tipo,
                            opciones: f.opciones,
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
                </li>
              ))}
            </ul>
            {preguntas.length === 0 && (
              <p className="mt-1 text-[11px] text-muted">
                Aún no hay preguntas en el cuestionario. Añádelas en el editor de la web (bloque
                «Confirmación (RSVP)»).
              </p>
            )}
            <button
              onClick={() => setModalCol(true)}
              className="mt-2 text-sm font-medium text-accent"
            >
              + Añadir columna
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Lista de invitados</p>
        <button
          onClick={() => setModalCol(true)}
          className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent"
        >
          ▦ Columnas de la tabla
        </button>
      </div>

      <Card className="p-0">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr className="whitespace-nowrap [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:border-b [&>th]:border-line [&>th]:bg-surface">
                <th className="!z-20 left-0 w-36 px-2.5 py-2.5">Nombre</th>
                <th className="!z-20 left-36 w-36 px-2.5 py-2.5">Apellido</th>
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
                <tr key={i.id} className="group align-top">
                  <td className="sticky left-0 z-10 w-36 bg-surface px-0 group-hover:bg-neutral-50">
                    <input
                      defaultValue={i.nombre}
                      placeholder="Nombre"
                      onBlur={(e) => updateInvitado(i.id, { nombre: e.target.value })}
                      className="w-full bg-transparent px-2.5 py-2 text-sm font-medium outline-none"
                    />
                  </td>
                  <td className="sticky left-36 z-10 w-36 border-r border-line bg-surface px-0 group-hover:bg-neutral-50">
                    <input
                      defaultValue={i.apellido}
                      placeholder="Apellido"
                      onBlur={(e) => updateInvitado(i.id, { apellido: e.target.value })}
                      className="w-full bg-transparent px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  {verFija("viene") && (
                  <td className="px-0">
                    <select
                      value={i.viene}
                      onChange={(e) => updateInvitado(i.id, { viene: e.target.value as Viene })}
                      className={`${cell} ${
                        i.viene === "Sí"
                          ? "text-emerald-700"
                          : i.viene === "No"
                            ? "text-[#7b2233]"
                            : "text-amber-700"
                      }`}
                    >
                      {VIENE_OPCIONES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  )}
                  {verFija("grupo") && (
                  <td className="border-l border-line bg-emerald-50/40 px-0">
                    <select
                      value={i.grupo}
                      onChange={(e) => updateInvitado(i.id, { grupo: e.target.value })}
                      className={`${cell} text-muted`}
                    >
                      <option value="">—</option>
                      {grupos.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                      {i.grupo && !grupos.includes(i.grupo) && (
                        <option value={i.grupo}>{i.grupo}</option>
                      )}
                    </select>
                  </td>
                  )}
                  {verFija("subgrupo") && (
                  <td className="border-r border-line bg-emerald-50/40 px-0">
                    <select
                      value={i.subgrupo}
                      onChange={(e) => updateInvitado(i.id, { subgrupo: e.target.value })}
                      className={`${cell} text-muted`}
                    >
                      <option value="">—</option>
                      {subgrupos.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                      {i.subgrupo && !subgrupos.includes(i.subgrupo) && (
                        <option value={i.subgrupo}>{i.subgrupo}</option>
                      )}
                    </select>
                  </td>
                  )}
                  {verFija("tipo") && (
                  <td className="px-0">
                    <select
                      value={i.tipo}
                      onChange={(e) =>
                        updateInvitado(i.id, { tipo: e.target.value as TipoInvitado })
                      }
                      className={`${cell} text-muted`}
                    >
                      {TIPO_OPCIONES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  )}
                  {cols.map((c) => (
                    <td key={c.id} className="px-0">
                      {c.tipo === "sino" ? (
                        <select
                          value={i.extra[c.id] ?? ""}
                          onChange={(e) => updateInvitadoExtra(i.id, c.id, e.target.value)}
                          className={`${cell} text-muted`}
                        >
                          <option value="">—</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      ) : c.tipo === "lista" ? (
                        <select
                          value={i.extra[c.id] ?? ""}
                          onChange={(e) => updateInvitadoExtra(i.id, c.id, e.target.value)}
                          className={`${cell} text-muted`}
                        >
                          <option value="">—</option>
                          {(c.opciones ?? "")
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean)
                            .map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          {i.extra[c.id] &&
                            !(c.opciones ?? "").split(",").map((o) => o.trim()).includes(i.extra[c.id]) && (
                              <option value={i.extra[c.id]}>{i.extra[c.id]}</option>
                            )}
                        </select>
                      ) : (
                        <input
                          type={c.tipo === "numero" ? "text" : "text"}
                          inputMode={c.tipo === "numero" ? "numeric" : undefined}
                          defaultValue={i.extra[c.id] ?? ""}
                          onBlur={(e) => updateInvitadoExtra(i.id, c.id, e.target.value)}
                          className={`${cell} text-muted ${c.tipo === "numero" ? "text-right" : ""}`}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2.5 text-center">
                    <button
                      onClick={() => {
                        const quien = `${i.nombre} ${i.apellido}`.trim() || "este invitado";
                        if (confirm(`¿Seguro que quieres eliminar a ${quien}?`)) removeInvitado(i.id);
                      }}
                      className="text-muted hover:text-red-600"
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

      {modalCol && (
        <ModalColumna
          columnas={cols}
          onClose={() => setModalCol(false)}
          onAdd={(nombre, tipo, opciones) => addColumna(nombre, tipo, opciones)}
          onRemove={(id) => removeColumna(id)}
        />
      )}
    </div>
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

  const volcar = (resp: RsvpResponse, seleccion: string) => {
    let invId = seleccion;
    if (seleccion === "__nuevo" || !seleccion) {
      const nuevo = crearInvitado(resp.nombre, resp.apellido ?? "");
      invId = nuevo.id;
    }
    const viene: Viene = resp.asiste === "Sí" ? "Sí" : "No";
    const rpc = asociadas
      .map((c) => ({ columna: c.nombre, valor: valorRespuesta(resp, c.preguntaRsvp as string) }))
      .filter((x) => x.valor);
    aplicarRespuestaAInvitado(invId, viene, rpc);
    updateResponse("demo", resp.id, { invitadoId: invId, aplicada: true });
  };

  return (
    <div className="space-y-4">
      {asociadas.length === 0 && (
        <Card className="text-sm text-muted">
          Todavía no has asociado ninguna pregunta a una columna. Hazlo en{" "}
          <strong>⚙ Ajustes de la lista → Columnas</strong> para que los datos se vuelquen solos.
        </Card>
      )}
      {respuestas.map((resp) => (
        <RespuestaCard key={resp.id} resp={resp} invitados={invitados} onVolcar={volcar} />
      ))}
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
  onVolcar: (resp: RsvpResponse, seleccion: string) => void;
}) {
  const norm = (s: string) => s.trim().toLowerCase();
  const sugerido = invitados.find(
    (i) =>
      norm(i.nombre) === norm(resp.nombre) &&
      norm(i.apellido) === norm(resp.apellido ?? ""),
  );
  const [sel, setSel] = useState(sugerido?.id ?? "__nuevo");
  const vinculado = resp.invitadoId
    ? invitados.find((i) => i.id === resp.invitadoId)
    : undefined;

  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-display text-lg">
          {resp.nombre} {resp.apellido}
        </span>
        <span
          className={`text-xs ${
            resp.asiste === "Sí" ? "text-emerald-700" : "text-[#7b2233]"
          }`}
        >
          {resp.asiste === "Sí" ? "Viene" : "No viene"}
          {resp.acompanantes > 0 ? ` · +${resp.acompanantes} acomp.` : ""}
        </span>
        <span className="text-xs text-muted">{resp.fecha}</span>
      </div>

      {Object.keys(resp.respuestas).length > 0 && (
        <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {Object.entries(resp.respuestas).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {resp.aplicada && vinculado ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-emerald-700">
          ✓ Volcado a «{vinculado.nombre} {vinculado.apellido}»
          <button
            onClick={() => onVolcar(resp, resp.invitadoId as string)}
            className="text-xs text-muted underline hover:text-foreground"
          >
            volver a volcar
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2 text-sm">
          <span className="text-xs text-muted">Vincular con:</span>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none focus:border-accent"
          >
            <option value="__nuevo">➕ Crear invitado nuevo</option>
            {invitados
              .filter((i) => i.nombre || i.apellido)
              .map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre} {i.apellido}
                </option>
              ))}
          </select>
          <button
            onClick={() => onVolcar(resp, sel)}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white"
          >
            Volcar a mi lista
          </button>
        </div>
      )}
    </Card>
  );
}

function ModalColumna({
  columnas,
  onClose,
  onAdd,
  onRemove,
}: {
  columnas: ColumnaInvitado[];
  onClose: () => void;
  onAdd: (nombre: string, tipo: TipoColumna, opciones?: string) => void;
  onRemove: (id: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoColumna>("texto");
  const [opciones, setOpciones] = useState("");
  const buscar = (n: string) =>
    columnas.find((c) => c.nombre.toLowerCase() === n.toLowerCase());
  const crear = () => {
    if (nombre.trim()) onAdd(nombre.trim(), tipo, tipo === "lista" ? opciones : undefined);
  };
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Columnas habituales</h3>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Marca las que quieras tener en tu lista.</p>

        <ul className="mt-2 max-h-64 divide-y divide-line overflow-y-auto">
          {COLUMNAS_SUGERIDAS.map((c) => {
            const existe = buscar(c.nombre);
            return (
              <li key={c.nombre}>
                <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={!!existe}
                    onChange={() => (existe ? onRemove(existe.id) : onAdd(c.nombre, c.tipo))}
                  />
                  <span className="flex-1">{c.nombre}</span>
                  <span className="text-[11px] text-muted">
                    {c.tipo === "sino" ? "sí/no" : c.tipo === "numero" ? "número" : "texto"}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-xs font-medium text-muted">O crea una a medida:</p>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la columna"
            autoFocus
            className="mt-2 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoColumna)}
            className="mt-2 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          >
            <option value="texto">Texto</option>
            <option value="sino">Sí / No</option>
            <option value="numero">Número</option>
            <option value="lista">Listado de opciones</option>
          </select>
          {tipo === "lista" && (
            <input
              value={opciones}
              onChange={(e) => setOpciones(e.target.value)}
              placeholder="Opciones separadas por comas (Normal, Vegetariano, Niño…)"
              className="mt-2 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
          )}
          <button
            onClick={crear}
            disabled={!nombre.trim()}
            className="mt-3 w-full rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Añadir columna
          </button>
        </div>
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

