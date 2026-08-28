// Lee nombres y apellidos de un Excel/CSV: columna A = nombre, columna B = apellido, desde la fila 1.

import ExcelJS from "exceljs";

export async function leerNombresExcel(file: File): Promise<{ nombre: string; apellido: string }[]> {
  const nombre = file.name.toLowerCase();

  if (nombre.endsWith(".csv")) {
    const texto = await file.text();
    return texto
      .split(/\r?\n/)
      .map((linea) => linea.split(/[;,\t]/))
      .filter((celdas) => celdas.some((c) => c.trim()))
      .map((celdas) => ({
        nombre: (celdas[0] ?? "").trim().replace(/^"|"$/g, ""),
        apellido: (celdas[1] ?? "").trim().replace(/^"|"$/g, ""),
      }));
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  if (!ws) return [];

  const filas: { nombre: string; apellido: string }[] = [];
  ws.eachRow((row) => {
    const nombreCel = String(row.getCell(1).text ?? "").trim();
    const apellidoCel = String(row.getCell(2).text ?? "").trim();
    if (nombreCel || apellidoCel) filas.push({ nombre: nombreCel, apellido: apellidoCel });
  });
  return filas;
}
