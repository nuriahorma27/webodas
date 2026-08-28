// Exporta el presupuesto a un .xlsx real (con formato) usando exceljs.

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
    { width: 26 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
  ];

  // ---- Cabecera ----
  ws.mergeCells("A1:F1");
  const logo = ws.getCell("A1");
  logo.value = "webodas";
  logo.font = { name: "Georgia", size: 20, bold: true, color: { argb: ACENTO } };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:F2");
  const t = ws.getCell("A2");
  t.value = pareja === "Vuestra boda" ? "Presupuesto de la boda" : `Presupuesto de la boda · ${pareja}`;
  t.font = { size: 14, bold: true, color: { argb: TINTA } };
  ws.getRow(2).height = 20;

  ws.mergeCells("A3:F3");
  const sub = ws.getCell("A3");
  const partes = [fechaLarga(boda)];
  if (presupuestoTotal) partes.push(`Presupuesto de referencia: ${Math.round(presupuestoTotal).toLocaleString("es-ES")} €`);
  sub.value = partes.join("   ·   ");
  sub.font = { size: 10, color: { argb: "FF7A736A" } };

  // ---- Encabezado de tabla (fila 5) ----
  const head = ws.getRow(5);
  head.values = ["", "Concepto", "Proveedor", "Estimado", "Pagado", "Pendiente"];
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.alignment = { vertical: "middle" };
  for (let c = 1; c <= 6; c++) {
    const cell = head.getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TINTA } };
    cell.border = borde;
  }
  head.height = 18;

  const g = totales(partidas);
  const cats = categoriasOrdenadas(partidas);

  const money = (cell: ExcelJS.Cell, n: number) => {
    cell.value = Math.round(n);
    cell.numFmt = EUR;
    cell.alignment = { horizontal: "right" };
    cell.border = borde;
  };

  let r = 6;
  for (const cat of cats) {
    const items = partidas.filter((p) => p.categoria === cat);
    const ct = totales(items);

    ws.mergeCells(`A${r}:C${r}`);
    const catRow = ws.getRow(r);
    catRow.getCell(1).value = cat.toUpperCase();
    for (let c = 1; c <= 6; c++) {
      const cell = catRow.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE } };
      cell.font = { bold: true, color: { argb: TINTA } };
      cell.border = borde;
    }
    money(catRow.getCell(4), ct.estimado);
    money(catRow.getCell(5), ct.pagado);
    money(catRow.getCell(6), ct.estimado - ct.pagado);
    catRow.getCell(4).font = { bold: true };
    catRow.getCell(5).font = { bold: true };
    catRow.getCell(6).font = { bold: true };
    r++;

    for (const p of items) {
      const est = estimadoDe(p);
      const detalle =
        p.tipo === "menu" && (p.precioUnidad || p.cantidad)
          ? ` (${Math.round(p.precioUnidad || 0)} € × ${Math.round(p.cantidad || 0)})`
          : "";
      const row = ws.getRow(r);
      row.getCell(2).value = (p.concepto || "—") + detalle;
      row.getCell(3).value = p.proveedor || "";
      row.getCell(2).border = borde;
      row.getCell(3).border = borde;
      row.getCell(1).border = borde;
      money(row.getCell(4), est);
      money(row.getCell(5), p.pagado || 0);
      money(row.getCell(6), est - (p.pagado || 0));
      row.getCell(4).font = {};
      row.getCell(5).font = {};
      row.getCell(6).font = {};
      r++;
    }
    r++; // fila en blanco entre categorías
  }

  // ---- Totales ----
  const totRow = ws.getRow(r);
  ws.mergeCells(`A${r}:C${r}`);
  totRow.getCell(1).value = "TOTAL";
  for (let c = 1; c <= 6; c++) {
    const cell = totRow.getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BEIGE_FUERTE } };
    cell.font = { bold: true };
    cell.border = borde;
  }
  money(totRow.getCell(4), g.estimado);
  money(totRow.getCell(5), g.pagado);
  money(totRow.getCell(6), g.estimado - g.pagado);
  totRow.getCell(4).font = { bold: true };
  totRow.getCell(5).font = { bold: true };
  totRow.getCell(6).font = { bold: true };
  r++;

  if (presupuestoTotal) {
    const dif = ws.getRow(r);
    ws.mergeCells(`A${r}:C${r}`);
    dif.getCell(1).value = "Diferencia con el presupuesto de referencia";
    dif.getCell(1).font = { italic: true, color: { argb: "FF7A736A" } };
    money(dif.getCell(4), presupuestoTotal - g.estimado);
    dif.getCell(4).font = { bold: true };
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
