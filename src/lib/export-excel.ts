// Exporta el presupuesto a un .xlsx real (con fórmulas vivas) usando exceljs.

import ExcelJS from "exceljs";
import { categoriasOrdenadas, estimadoDe, totales, type Partida } from "@/lib/presupuesto";
import {
  CATEGORIAS,
  ESTADOS,
  type Estado,
  type Tarea,
  type TareaDetalle,
} from "@/lib/tareas";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";
import {
  COLUMNAS_FIJAS,
  type Invitado,
  type ColumnaInvitado,
} from "@/lib/invitados";
import type { RsvpResponse } from "@/lib/rsvp";

const EUR = '#,##0" €"';
const ACENTO = "FF8A6D3B";
const TINTA = "FF1C1A17";
const BEIGE = "FFEFE7DA";
const BEIGE_FUERTE = "FFD9CDB8";
const LINEA = "FFD9D3C9";

const thin = { style: "thin" as const, color: { argb: LINEA } };
const borde = { top: thin, left: thin, bottom: thin, right: thin };

// Columnas: A hueco · B concepto · C proveedor · D €/persona · E nº · F estimado · G pagado · H pendiente
export async function descargarPresupuestoExcel(
  partidas: Partida[],
  presupuestoTotal: number | null,
) {
  const boda = loadBoda();
  const pareja = nombrePareja(boda);
  const wb = new ExcelJS.Workbook();
  wb.creator = "webodas";
  wb.created = new Date();

  const ws = wb.addWorksheet("Presupuesto", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "portrait" },
  });

  ws.columns = [
    { width: 3 },
    { width: 36 },
    { width: 24 },
    { width: 12 },
    { width: 7 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  // ---- Cabecera ----
  ws.mergeCells("A1:H1");
  const logo = ws.getCell("A1");
  logo.value = "webodas";
  logo.font = { name: "Georgia", size: 20, bold: true, color: { argb: ACENTO } };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:H2");
  const t = ws.getCell("A2");
  t.value =
    pareja === "Vuestra boda"
      ? "Presupuesto de la boda"
      : `Presupuesto de la boda · ${pareja}`;
  t.font = { size: 14, bold: true, color: { argb: TINTA } };
  ws.getRow(2).height = 20;

  ws.mergeCells("A3:H3");
  const sub = ws.getCell("A3");
  const partes = [fechaLarga(boda)];
  if (presupuestoTotal)
    partes.push(`Presupuesto de referencia: ${Math.round(presupuestoTotal).toLocaleString("es-ES")} €`);
  sub.value = partes.join("   ·   ");
  sub.font = { size: 10, color: { argb: "FF7A736A" } };

  // ---- Encabezado de tabla (fila 5) ----
  const head = ws.getRow(5);
  head.values = ["", "Concepto", "Proveedor", "€ / persona", "Nº", "Estimado", "Pagado", "Pendiente"];
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.alignment = { vertical: "middle", wrapText: true };
  for (let c = 1; c <= 8; c++) {
    const cell = head.getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINTA } };
    cell.border = borde;
  }
  head.height = 20;

  const cats = categoriasOrdenadas(partidas);
  const money = (cell: ExcelJS.Cell) => {
    cell.numFmt = EUR;
    cell.alignment = { horizontal: "right" };
    cell.border = borde;
  };

  const subtotalRows: number[] = [];
  let r = 6;

  for (const cat of cats) {
    const items = partidas.filter((p) => p.categoria === cat);
    const catRowNum = r;
    subtotalRows.push(catRowNum);
    r++;

    const firstItem = r;
    for (const p of items) {
      const row = ws.getRow(r);
      row.getCell(1).border = borde;
      row.getCell(2).value = p.concepto || "—";
      row.getCell(3).value = p.proveedor || "";
      row.getCell(2).border = borde;
      row.getCell(3).border = borde;

      const est = estimadoDe(p);
      if (p.tipo === "menu") {
        row.getCell(4).value = p.precioUnidad || 0;
        row.getCell(5).value = p.cantidad || 0;
        money(row.getCell(4));
        row.getCell(5).alignment = { horizontal: "right" };
        row.getCell(5).border = borde;
        row.getCell(6).value = { formula: `D${r}*E${r}`, result: est };
      } else {
        row.getCell(4).border = borde;
        row.getCell(5).border = borde;
        row.getCell(6).value = est;
      }
      row.getCell(7).value = p.pagado || 0;
      row.getCell(8).value = { formula: `F${r}-G${r}`, result: est - (p.pagado || 0) };
      money(row.getCell(6));
      money(row.getCell(7));
      money(row.getCell(8));
      r++;
    }
    const lastItem = r - 1;

    // fila de categoría con fórmulas de subtotal
    ws.mergeCells(`A${catRowNum}:C${catRowNum}`);
    const catRow = ws.getRow(catRowNum);
    catRow.getCell(1).value = cat.toUpperCase();
    for (let c = 1; c <= 8; c++) {
      const cell = catRow.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE } };
      cell.font = { bold: true, color: { argb: TINTA } };
      cell.border = borde;
    }
    const ct = totales(items);
    const sub: Record<string, number> = {
      F: ct.estimado,
      G: ct.pagado,
      H: ct.estimado - ct.pagado,
    };
    for (const col of ["F", "G", "H"]) {
      const cell = catRow.getCell(col.charCodeAt(0) - 64);
      cell.value = items.length
        ? { formula: `SUM(${col}${firstItem}:${col}${lastItem})`, result: sub[col] }
        : 0;
      money(cell);
      cell.font = { bold: true };
    }
    r++; // hueco entre categorías
  }

  // ---- TOTAL ----
  const totRow = ws.getRow(r);
  ws.mergeCells(`A${r}:C${r}`);
  totRow.getCell(1).value = "TOTAL";
  for (let c = 1; c <= 8; c++) {
    const cell = totRow.getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE_FUERTE } };
    cell.font = { bold: true };
    cell.border = borde;
  }
  const gTot = totales(partidas);
  const gVal: Record<string, number> = {
    F: gTot.estimado,
    G: gTot.pagado,
    H: gTot.estimado - gTot.pagado,
  };
  for (const col of ["F", "G", "H"]) {
    const cell = totRow.getCell(col.charCodeAt(0) - 64);
    cell.value = subtotalRows.length
      ? { formula: subtotalRows.map((n) => `${col}${n}`).join("+"), result: gVal[col] }
      : 0;
    money(cell);
    cell.font = { bold: true };
  }
  const totalRowNum = r;
  r++;

  if (presupuestoTotal) {
    const dif = ws.getRow(r);
    ws.mergeCells(`A${r}:E${r}`);
    dif.getCell(1).value = "Diferencia con el presupuesto de referencia";
    dif.getCell(1).font = { italic: true, color: { argb: "FF7A736A" } };
    dif.getCell(6).value = {
      formula: `${Math.round(presupuestoTotal)}-F${totalRowNum}`,
      result: Math.round(presupuestoTotal) - gTot.estimado,
    };
    money(dif.getCell(6));
    dif.getCell(6).font = { bold: true };
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Presupuesto boda ${fecha}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ============================ TAREAS ============================ */

function descargarLibro(wb: ExcelJS.Workbook, nombre: string) {
  return wb.xlsx.writeBuffer().then((buf) => {
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

export async function descargarTareasExcel(
  tareas: Tarea[],
  estados: Record<string, Estado>,
  detalles: Record<string, TareaDetalle>,
) {
  const boda = loadBoda();
  const pareja = nombrePareja(boda);
  const wb = new ExcelJS.Workbook();
  wb.creator = "webodas";
  wb.created = new Date();

  const ws = wb.addWorksheet("Tareas", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
  });
  ws.columns = [
    { width: 3 },
    { width: 40 },
    { width: 20 },
    { width: 16 },
    { width: 14 },
    { width: 40 },
  ];

  ws.mergeCells("A1:F1");
  const logo = ws.getCell("A1");
  logo.value = "webodas";
  logo.font = { name: "Georgia", size: 20, bold: true, color: { argb: ACENTO } };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:F2");
  ws.getCell("A2").value =
    pareja === "Vuestra boda" ? "Tareas de la boda" : `Tareas de la boda · ${pareja}`;
  ws.getCell("A2").font = { size: 14, bold: true, color: { argb: TINTA } };
  ws.getRow(2).height = 20;

  ws.mergeCells("A3:F3");
  ws.getCell("A3").value = fechaLarga(boda);
  ws.getCell("A3").font = { size: 10, color: { argb: "FF7A736A" } };

  const head = ws.getRow(5);
  head.values = ["", "Tarea", "Momento", "Responsable", "Estado", "Notas"];
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.alignment = { vertical: "middle" };
  for (let c = 1; c <= 6; c++) {
    head.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINTA } };
    head.getCell(c).border = borde;
  }
  head.height = 18;

  const labelEstado = (id: string) =>
    ESTADOS.find((e) => e.value === (estados[id] ?? "sin"))?.label ?? "";
  const notaDe = (t: Tarea) => {
    const d = detalles[t.id];
    const privada = d && typeof d.notas === "string" ? d.notas : "";
    return [t.notaVisible || t.nota || "", privada].filter(Boolean).join(" — ");
  };

  const orden = [...CATEGORIAS, ...new Set(tareas.map((t) => t.categoria).filter((c) => !CATEGORIAS.includes(c)))];
  let r = 6;
  for (const cat of orden) {
    const items = tareas.filter((t) => t.categoria === cat);
    if (items.length === 0) continue;
    const done = items.filter((t) => (estados[t.id] ?? "sin") === "hecho").length;

    ws.mergeCells(`A${r}:F${r}`);
    const catRow = ws.getRow(r);
    catRow.getCell(1).value = `${cat.toUpperCase()}   ·   ${done}/${items.length}`;
    for (let c = 1; c <= 6; c++) {
      catRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE } };
      catRow.getCell(c).font = { bold: true, color: { argb: TINTA } };
      catRow.getCell(c).border = borde;
    }
    r++;

    for (const t of items) {
      const row = ws.getRow(r);
      row.getCell(2).value = t.titulo || "(sin nombre)";
      row.getCell(3).value = t.fase;
      row.getCell(4).value = t.responsable || "";
      row.getCell(5).value = labelEstado(t.id);
      row.getCell(6).value = notaDe(t);
      row.getCell(6).alignment = { wrapText: true };
      for (let c = 1; c <= 6; c++) row.getCell(c).border = borde;
      if ((estados[t.id] ?? "sin") === "hecho")
        row.getCell(2).font = { color: { argb: "FF3F6212" } };
      r++;
    }
  }

  const fecha = new Date().toISOString().slice(0, 10);
  await descargarLibro(wb, `Tareas boda ${fecha}.xlsx`);
}

/* ============================ INVITADOS ============================ */

function cabecera(ws: ExcelJS.Worksheet, ancho: number, titulo: string) {
  const boda = loadBoda();
  const pareja = nombrePareja(boda);
  const last = String.fromCharCode(64 + ancho);
  ws.mergeCells(`A1:${last}1`);
  const logo = ws.getCell("A1");
  logo.value = "webodas";
  logo.font = { name: "Georgia", size: 20, bold: true, color: { argb: ACENTO } };
  ws.getRow(1).height = 30;
  ws.mergeCells(`A2:${last}2`);
  ws.getCell("A2").value = pareja === "Vuestra boda" ? titulo : `${titulo} · ${pareja}`;
  ws.getCell("A2").font = { size: 14, bold: true, color: { argb: TINTA } };
  ws.getRow(2).height = 20;
  ws.mergeCells(`A3:${last}3`);
  ws.getCell("A3").value = fechaLarga(boda);
  ws.getCell("A3").font = { size: 10, color: { argb: "FF7A736A" } };
}

function pintaHead(ws: ExcelJS.Worksheet, fila: number, valores: string[]) {
  const head = ws.getRow(fila);
  head.values = valores;
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.alignment = { vertical: "middle", wrapText: true };
  for (let c = 1; c <= valores.length; c++) {
    head.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINTA } };
    head.getCell(c).border = borde;
  }
  head.height = 20;
}

export async function descargarInvitadosExcel(
  invitados: Invitado[],
  columnas: ColumnaInvitado[],
  fijasOcultas: string[] = [],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "webodas";
  wb.created = new Date();

  const fijas = COLUMNAS_FIJAS.filter((f) => !fijasOcultas.includes(f.key));
  const cabeceras = [
    "Nombre",
    "Apellido",
    ...fijas.map((f) => f.label),
    ...columnas.map((c) => c.nombre),
  ];

  const ws = wb.addWorksheet("Invitados", {
    views: [{ state: "frozen", ySplit: 5, xSplit: 2 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
  });
  ws.columns = cabeceras.map((_, i) => ({ width: i < 2 ? 20 : 16 }));

  cabecera(ws, cabeceras.length, "Lista de invitados");
  pintaHead(ws, 5, cabeceras);

  const valorFija = (i: Invitado, key: string) =>
    key === "viene"
      ? i.viene
      : key === "grupo"
        ? i.grupo
        : key === "subgrupo"
          ? i.subgrupo
          : key === "tipo"
            ? i.tipo
            : "";

  let r = 6;
  for (const i of invitados) {
    const row = ws.getRow(r);
    row.getCell(1).value = i.nombre;
    row.getCell(2).value = i.apellido;
    let c = 3;
    for (const f of fijas) row.getCell(c++).value = valorFija(i, f.key);
    for (const col of columnas) row.getCell(c++).value = i.extra[col.id] ?? "";
    for (let k = 1; k <= cabeceras.length; k++) row.getCell(k).border = borde;
    r++;
  }

  ws.mergeCells(`A${r}:B${r}`);
  const tot = ws.getRow(r);
  tot.getCell(1).value = `TOTAL · ${invitados.length} personas`;
  tot.getCell(1).font = { bold: true };
  tot.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE } };

  const fecha = new Date().toISOString().slice(0, 10);
  await descargarLibro(wb, `Invitados boda ${fecha}.xlsx`);
}

export async function descargarAlergiasExcel(
  invitados: Invitado[],
  columnas: ColumnaInvitado[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "webodas";
  wb.created = new Date();

  const esAlergia = (c: ColumnaInvitado) =>
    c.nombre.toLowerCase().includes("alergia") ||
    c.nombre.toLowerCase().includes("intoleranc") ||
    c.preguntaRsvp === "Alergias";
  const colsAlergia = columnas.filter(esAlergia);
  const colMesa = columnas.find((c) => c.nombre.toLowerCase().includes("mesa"));

  // No es una alergia real: vacío o respuestas tipo "no", "ninguna", "sin alergias"…
  const vacio = (v: string) => {
    const s = (v ?? "").trim().replace(/[.!]+$/, "").toLowerCase();
    return (
      !s ||
      /^(no|-{1,}|n\/a|na|ninguna?|ningún|ninguno|nada|sin|ok|correcto|todo bien)$/.test(s) ||
      /^(sin |no tengo|no hay|ninguna? )/.test(s)
    );
  };

  const filas = invitados
    .map((i) => {
      const alergia = colsAlergia.map((c) => i.extra[c.id] ?? "").find((v) => !vacio(v)) ?? "";
      return {
        mesa: colMesa ? i.extra[colMesa.id] ?? "" : "",
        nombre: `${i.nombre} ${i.apellido}`.trim(),
        grupo: i.grupo,
        alergia,
      };
    })
    .filter((f) => f.alergia)
    .sort((a, b) => a.mesa.localeCompare(b.mesa) || a.nombre.localeCompare(b.nombre));

  const conMesa = Boolean(colMesa);
  const cabeceras = conMesa
    ? ["Mesa", "Invitado", "Grupo", "Alergia / intolerancia"]
    : ["Invitado", "Grupo", "Alergia / intolerancia"];

  const ws = wb.addWorksheet("Alergias", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "portrait" },
  });
  ws.columns = cabeceras.map((_, i) => ({ width: i === cabeceras.length - 1 ? 40 : 22 }));

  cabecera(ws, cabeceras.length, "Listado de alergias e intolerancias");
  pintaHead(ws, 5, cabeceras);

  let r = 6;
  for (const f of filas) {
    const row = ws.getRow(r);
    const vals = conMesa
      ? [f.mesa, f.nombre, f.grupo, f.alergia]
      : [f.nombre, f.grupo, f.alergia];
    vals.forEach((v, c) => {
      row.getCell(c + 1).value = v;
      row.getCell(c + 1).border = borde;
    });
    row.getCell(cabeceras.length).alignment = { wrapText: true };
    r++;
  }
  if (filas.length === 0) {
    ws.getCell(`A6`).value = "Todavía no hay alergias registradas.";
  }

  const fecha = new Date().toISOString().slice(0, 10);
  await descargarLibro(wb, `Alergias boda ${fecha}.xlsx`);
}

export async function descargarRespuestasExcel(respuestas: RsvpResponse[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "webodas";
  wb.created = new Date();

  // Todas las claves de respuesta que han aparecido, en orden de aparición.
  const claves: string[] = [];
  const add = (m: Record<string, string> = {}) => {
    for (const k of Object.keys(m)) if (!claves.includes(k)) claves.push(k);
  };
  respuestas.forEach((x) => {
    add(x.respuestas);
    add(x.respuestasAcomp);
  });

  const cabeceras = [
    "Fecha",
    "Hora",
    "Nombre",
    "Apellido",
    "Email",
    "¿Asiste?",
    "Fila",
    ...claves,
  ];

  const ws = wb.addWorksheet("Respuestas", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
  });
  ws.columns = cabeceras.map((_, i) => ({ width: i < 7 ? 16 : 18 }));

  cabecera(ws, cabeceras.length, "Respuestas del formulario");
  pintaHead(ws, 5, cabeceras);

  let r = 6;
  const fila = (
    fechaISO: string,
    nombre: string,
    apellido: string,
    email: string,
    asiste: string,
    tipo: string,
    datos: Record<string, string>,
  ) => {
    const d = new Date(fechaISO);
    const ok = !isNaN(d.getTime());
    const row = ws.getRow(r);
    row.getCell(1).value = ok ? d.toLocaleDateString("es-ES") : fechaISO;
    row.getCell(2).value = ok && fechaISO.length > 10
      ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : "";
    row.getCell(3).value = nombre;
    row.getCell(4).value = apellido;
    row.getCell(5).value = email;
    row.getCell(6).value = asiste;
    row.getCell(7).value = tipo;
    claves.forEach((k, idx) => {
      row.getCell(8 + idx).value = datos[k] ?? "";
    });
    for (let k = 1; k <= cabeceras.length; k++) row.getCell(k).border = borde;
    r++;
  };

  for (const x of respuestas) {
    fila(x.fecha, x.nombre, x.apellido ?? "", x.email, x.asiste, "Invitado", x.respuestas);
    if (x.acompNombre || x.acompApellido)
      fila(
        x.fecha,
        x.acompNombre ?? "",
        x.acompApellido ?? "",
        "",
        x.asiste === "Sí" ? "Sí" : x.asiste,
        "Acompañante",
        x.respuestasAcomp ?? {},
      );
  }

  const fecha = new Date().toISOString().slice(0, 10);
  await descargarLibro(wb, `Respuestas formulario ${fecha}.xlsx`);
}
