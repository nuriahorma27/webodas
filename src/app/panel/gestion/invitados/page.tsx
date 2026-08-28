"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Stat } from "@/components/ui";
import { CampoBoda } from "@/components/campo-boda";
import { leerNombresExcel } from "@/lib/import-excel";
import {
  loadPreguntasRsvp,
  loadResponses,
  updateResponse,
  valorRespuesta,
  type RsvpResponse,
} from "@/lib/rsvp";
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
  const fileRef = useRef<HTMLInputElement>(null);

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
      setPreguntas(loadPreguntasRsvp());
      setRespuestas(loadResponses("demo"));
    };
    sync();
    window.addEventListener("webodas:invitados", sync);
    window.addEventListener("webodas:rsvp", sync);
    return () => {
      window.removeEventListener("webodas:invitados", sync);
      window.removeEventListener("webodas:rsvp", sync);
    };
  }, []);

  if (!inv) return null;

  const r = resumenInvitados();
  const filas = filtro ? inv.filter((i) => i.viene === filtro) : inv;

  const pendientesRespuesta = respuestas.filter((x) => !x.aplicada).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoBoda campo="invitadosAprox" label="Invitados aproximados" />
      </div>

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setVista("gestion")}
          className={`rounded-full px-3 py-1 ${
            vista === "gestion" ? "bg-foreground text-white" : "border border-line text-muted"
          }`}
        >
          Mi lista de gestión
        </button>
        <button
          onClick={() => setVista("respuestas")}
          className={`rounded-full px-3 py-1 ${
            vista === "respuestas" ? "bg-foreground text-white" : "border border-line text-muted"
          }`}
        >
          Respuestas del formulario
          {pendientesRespuesta > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 text-xs text-white">
              {pendientesRespuesta}
            </span>
          )}
        </button>
      </div>

      {vista === "respuestas" ? (
        <VistaRespuestas respuestas={respuestas} invitados={inv} columnas={cols} />
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-4">
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
        <Card className="space-y-5">
          <ListaEditable
            titulo="Grupos"
            items={grupos}
            onChange={saveGrupos}
            placeholder="Nuevo grupo (p. ej. Familia de la novia)"
          />
          <ListaEditable
            titulo="Subgrupos"
            items={subgrupos}
            onChange={saveSubgrupos}
            placeholder="Nuevo subgrupo (p. ej. Tíos, Primos, Universidad)"
          />
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Columnas</h4>
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
              Nombre, Apellido, ¿Viene?, Grupo, Subgrupo y Adulto/Niño son fijas. Estas se pueden
              quitar, reordenar, añadir y <strong>asociar a una pregunta del cuestionario</strong>{" "}
              (la respuesta se guardará sola en esa columna).
            </p>
            <ul className="mt-2 divide-y divide-line">
              {cols.map((c, i) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <span className="font-medium">{c.nombre}</span>
                  <span className="rounded bg-neutral-100 px-1.5 text-[11px] text-muted">
                    {TIPO_COLUMNA_LABEL[c.tipo]}
                  </span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted">
                    <button
                      onClick={() => moveColumna(c.id, -1)}
                      disabled={i === 0}
                      className="hover:text-foreground disabled:opacity-25"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveColumna(c.id, 1)}
                      disabled={i === cols.length - 1}
                      className="hover:text-foreground disabled:opacity-25"
                    >
                      ▼
                    </button>
                    <button onClick={() => removeColumna(c.id)} className="hover:text-red-600">
                      ✕
                    </button>
                  </div>
                  <label className="flex w-full items-center gap-2 text-xs text-muted">
                    Se rellena con la pregunta:
                    <select
                      value={c.preguntaRsvp ?? ""}
                      onChange={(e) => updateColumna(c.id, { preguntaRsvp: e.target.value })}
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
        </Card>
      )}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr className="whitespace-nowrap">
                <th className="px-2.5 py-2.5">Nombre</th>
                <th className="px-2.5 py-2.5">Apellido</th>
                <th className="px-2.5 py-2.5">¿Viene?</th>
                <th className="px-2.5 py-2.5">Grupo</th>
                <th className="px-2.5 py-2.5">Subgrupo</th>
                <th className="px-2.5 py-2.5">Adulto/Niño</th>
                {cols.map((c) => (
                  <th key={c.id} className="px-2.5 py-2.5">
                    <span className="inline-flex items-center gap-1">
                      {c.nombre}
                      <button
                        onClick={() => {
                          if (confirm(`¿Quitar la columna "${c.nombre}"?`)) removeColumna(c.id);
                        }}
                        className="text-muted hover:text-red-600"
                        title="Quitar columna"
                      >
                        ×
                      </button>
                    </span>
                  </th>
                ))}
                <th className="w-10 px-2.5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((i) => (
                <tr key={i.id} className="align-top">
                  <td className="px-0">
                    <input
                      defaultValue={i.nombre}
                      placeholder="Nombre"
                      onBlur={(e) => updateInvitado(i.id, { nombre: e.target.value })}
                      className={`${cell} font-medium`}
                    />
                  </td>
                  <td className="px-0">
                    <input
                      defaultValue={i.apellido}
                      placeholder="Apellido"
                      onBlur={(e) => updateInvitado(i.id, { apellido: e.target.value })}
                      className={cell}
                    />
                  </td>
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
                  <td className="px-0">
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
                  <td className="px-0">
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
                      onClick={() => removeInvitado(i.id)}
                      className="text-muted hover:text-red-600"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7 + cols.length} className="px-5 py-8 text-center text-sm text-muted">
                    {filtro ? "Nadie en este estado." : "Aún no has añadido invitados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-5 py-3">
          <button onClick={() => addInvitado()} className="text-sm font-medium text-accent">
            + Añadir invitado
          </button>
          <button onClick={() => setModalCol(true)} className="text-sm font-medium text-accent">
            + Añadir columna
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
          existentes={cols.map((c) => c.nombre.toLowerCase())}
          onClose={() => setModalCol(false)}
          onAdd={(nombre, tipo, opciones) => {
            addColumna(nombre, tipo, opciones);
            setModalCol(false);
          }}
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
  existentes,
  onClose,
  onAdd,
}: {
  existentes: string[];
  onClose: () => void;
  onAdd: (nombre: string, tipo: TipoColumna, opciones?: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoColumna>("texto");
  const [opciones, setOpciones] = useState("");
  const disponibles = COLUMNAS_SUGERIDAS.filter(
    (c) => !existentes.includes(c.nombre.toLowerCase()),
  );
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
          <h3 className="font-display text-lg">Añadir columna</h3>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>

        <p className="mt-2 text-xs text-muted">Habituales:</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {disponibles.map((c) => (
            <button
              key={c.nombre}
              onClick={() => onAdd(c.nombre, c.tipo)}
              className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
            >
              {c.nombre}
            </button>
          ))}
        </div>

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
  items,
  onChange,
  placeholder,
}: {
  titulo: string;
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
