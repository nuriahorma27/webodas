// Exporta el presupuesto a un .xls (HTML que Excel/Numbers/Sheets abren con formato).
// Sin dependencias externas.

import { categoriasOrdenadas, estimadoDe, totales, type Partida } from "@/lib/presupuesto";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Formato de moneda de Excel: "1.234 €"
const MONEY = String.raw`#,##0\ \€`;

const money = (n: number) =>
  `<td class="num" style="mso-number-format:'${MONEY}'">${Math.round(n)}</td>`;

export function presupuestoAHtml(partidas: Partida[], presupuestoTotal: number | null): string {
  const cats = categoriasOrdenadas(partidas);
  const g = totales(partidas);
  const ref = presupuestoTotal ?? 0;

  const filas = cats
    .map((cat) => {
      const items = partidas.filter((p) => p.categoria === cat);
      const ct = totales(items);
      const cabecera = `
        <tr class="cat">
          <td colspan="3">${esc(cat.toUpperCase())}</td>
          ${money(ct.estimado)}
          ${money(ct.pagado)}
          ${money(ct.estimado - ct.pagado)}
        </tr>`;
      const cuerpo = items
        .map((p) => {
          const est = estimadoDe(p);
          const detalle =
            p.tipo === "menu" && (p.precioUnidad || p.cantidad)
              ? ` (${Math.round(p.precioUnidad || 0)} € × ${Math.round(p.cantidad || 0)})`
              : "";
          return `
        <tr>
          <td></td>
          <td>${esc(p.concepto || "—")}${detalle}</td>
          <td>${esc(p.proveedor || "")}</td>
          ${money(est)}
          ${money(p.pagado || 0)}
          ${money(est - (p.pagado || 0))}
        </tr>`;
        })
        .join("");
      return cabecera + cuerpo;
    })
    .join("");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="utf-8" />
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  td, th { border: 0.5pt solid #d9d3c9; padding: 4px 8px; vertical-align: middle; }
  .title { font-size: 16pt; font-weight: bold; border: none; padding: 8px 0; }
  .sub { border: none; color: #7a736a; padding: 0 0 10px; }
  thead th { background: #1c1a17; color: #ffffff; font-weight: bold; text-align: left; }
  tr.cat td { background: #efe7da; font-weight: bold; }
  .num { text-align: right; mso-number-format: "${MONEY}"; }
  tfoot td { background: #d9cdb8; font-weight: bold; }
</style>
</head>
<body>
<table>
  <tr><td class="title" colspan="6">Presupuesto de la boda</td></tr>
  <tr><td class="sub" colspan="6">${
    ref ? `Presupuesto de referencia: ${Math.round(ref).toLocaleString("es-ES")} €` : ""
  }</td></tr>
  <thead>
    <tr>
      <th style="width:150px">Categoría</th>
      <th style="width:280px">Concepto</th>
      <th style="width:180px">Proveedor</th>
      <th style="width:100px">Estimado</th>
      <th style="width:100px">Pagado</th>
      <th style="width:100px">Pendiente</th>
    </tr>
  </thead>
  <tbody>
    ${filas}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="3">TOTAL</td>
      ${money(g.estimado)}
      ${money(g.pagado)}
      ${money(g.estimado - g.pagado)}
    </tr>
    ${
      ref
        ? `<tr><td colspan="3">Diferencia con el presupuesto de referencia</td>${money(
            ref - g.estimado,
          )}<td></td><td></td></tr>`
        : ""
    }
  </tfoot>
</table>
</body>
</html>`;
}

export function descargarPresupuestoExcel(partidas: Partida[], presupuestoTotal: number | null) {
  const html = presupuestoAHtml(partidas, presupuestoTotal);
  const blob = new Blob(["﻿", html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Presupuesto boda ${fecha}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
