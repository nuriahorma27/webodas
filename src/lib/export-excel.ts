// Exporta el presupuesto a un .xlsx real (con fórmulas vivas) usando exceljs.

import ExcelJS from "exceljs";
import { categoriasOrdenadas, estimadoDe, totales, type Partida } from "@/lib/presupuesto";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";

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
