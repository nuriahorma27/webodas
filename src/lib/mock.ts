// Datos de ejemplo para el prototipo visual. Sin base de datos.

export const boda = {
  id: "demo",
  pareja: "Ana & Leo",
  fecha: "2026-09-12",
  fechaLarga: "12 de septiembre de 2026",
  lugar: "Finca Los Olivos, Madrid",
  invitadosConfirmados: 84,
  invitadosTotales: 120,
  slug: "ana-y-leo",
  diasRestantes: Math.max(
    0,
    Math.ceil((new Date("2026-09-12").getTime() - Date.now()) / 86400000),
  ),
};

export const webs = [
  {
    id: "demo",
    pareja: "Ana & Leo",
    fecha: "12 sep 2026",
    plantilla: "Editorial",
    estado: "Publicada" as const,
    slug: "ana-y-leo",
  },
  {
    id: "borrador-1",
    pareja: "Marta & Julen",
    fecha: "6 jun 2026",
    plantilla: "Jardín",
    estado: "Borrador" as const,
    slug: null,
  },
];

export const plantillas = [
  { id: "editorial", nombre: "Editorial", desc: "Serif, mucho blanco, minimalista." },
  { id: "jardin", nombre: "Jardín", desc: "Botánica, tonos verdes, acuarela." },
  { id: "clasica", nombre: "Clásica", desc: "Dorados, filigrana, formal." },
  { id: "moderna", nombre: "Moderna", desc: "Sans-serif, alto contraste, directa." },
];

export const presupuesto = {
  total: 32000,
  gastado: 19850,
  partidas: [
    { concepto: "Finca y catering", estimado: 16000, pagado: 11000, proveedor: "Finca Los Olivos" },
    { concepto: "Fotografía y vídeo", estimado: 3200, pagado: 1600, proveedor: "Estudio Nube" },
    { concepto: "Música / DJ", estimado: 1800, pagado: 900, proveedor: "SonidoMil" },
    { concepto: "Flores y decoración", estimado: 2500, pagado: 2500, proveedor: "Verbena Flores" },
    { concepto: "Vestido y traje", estimado: 3000, pagado: 2850, proveedor: "—" },
    { concepto: "Invitaciones y papelería", estimado: 700, pagado: 700, proveedor: "Imprenta Sol" },
    { concepto: "Transporte invitados", estimado: 1200, pagado: 0, proveedor: "Buses Aranjuez" },
    { concepto: "Varios / imprevistos", estimado: 3600, pagado: 300, proveedor: "—" },
  ],
};

export const tareas = [
  { titulo: "Reservar la finca", fecha: "2025-06-01", hecho: true, fase: "12+ meses antes" },
  { titulo: "Contratar fotógrafo", fecha: "2025-09-15", hecho: true, fase: "12+ meses antes" },
  { titulo: "Enviar save the date", fecha: "2026-01-10", hecho: true, fase: "9 meses antes" },
  { titulo: "Elegir menú y hacer prueba", fecha: "2026-04-20", hecho: false, fase: "5 meses antes" },
  { titulo: "Cerrar lista de invitados", fecha: "2026-05-01", hecho: false, fase: "4 meses antes" },
  { titulo: "Enviar invitaciones", fecha: "2026-05-15", hecho: false, fase: "4 meses antes" },
  { titulo: "Comprar alianzas", fecha: "2026-06-01", hecho: false, fase: "3 meses antes" },
  { titulo: "Confirmar número final con catering", fecha: "2026-08-28", hecho: false, fase: "2 semanas antes" },
  { titulo: "Hacer el seating plan", fecha: "2026-08-30", hecho: false, fase: "2 semanas antes" },
];

export const invitados = [
  { nombre: "Familia García Ruiz", grupo: "Familia novia", personas: 5, estado: "Confirmado", mesa: 1 },
  { nombre: "Familia Etxeberria", grupo: "Familia novio", personas: 4, estado: "Confirmado", mesa: 2 },
  { nombre: "Carlos y Nuria", grupo: "Amigos universidad", personas: 2, estado: "Confirmado", mesa: 6 },
  { nombre: "Laura Méndez", grupo: "Amigos novia", personas: 1, estado: "Pendiente", mesa: null },
  { nombre: "Iker y Sara", grupo: "Amigos novio", personas: 2, estado: "Confirmado", mesa: 6 },
  { nombre: "Tíos de Sevilla", grupo: "Familia novia", personas: 3, estado: "Rechazado", mesa: null },
  { nombre: "Compañeros de oficina", grupo: "Trabajo", personas: 6, estado: "Pendiente", mesa: null },
  { nombre: "Abuela Carmen", grupo: "Familia novia", personas: 1, estado: "Confirmado", mesa: 1 },
];

export const mesas = [
  { id: 1, nombre: "Mesa 1 · Familia", asientos: 10, ocupados: 6 },
  { id: 2, nombre: "Mesa 2 · Familia", asientos: 10, ocupados: 4 },
  { id: 6, nombre: "Mesa 6 · Amigos", asientos: 10, ocupados: 4 },
  { id: 7, nombre: "Mesa 7 · Amigos", asientos: 10, ocupados: 0 },
];

export const proveedores = [
  { nombre: "Finca Los Olivos", categoria: "Lugar y catering", contacto: "eventos@losolivos.es", estado: "Contratado" },
  { nombre: "Estudio Nube", categoria: "Foto y vídeo", contacto: "hola@estudionube.com", estado: "Contratado" },
  { nombre: "Verbena Flores", categoria: "Flores", contacto: "+34 600 123 456", estado: "Contratado" },
  { nombre: "SonidoMil", categoria: "Música", contacto: "info@sonidomil.es", estado: "Contratado" },
  { nombre: "Dulce Trigo", categoria: "Tarta", contacto: "pedidos@dulcetrigo.es", estado: "Presupuesto pedido" },
];

export const regalos = [
  { nombre: "Aportación viaje de novios", objetivo: 2000, aportado: 1150, tipo: "Hucha" },
  { nombre: "Batería de cocina", objetivo: 320, aportado: 320, tipo: "Producto" },
  { nombre: "Robot de cocina", objetivo: 600, aportado: 240, tipo: "Producto" },
  { nombre: "Juego de sábanas", objetivo: 180, aportado: 0, tipo: "Producto" },
  { nombre: "Cena en restaurante", objetivo: 150, aportado: 150, tipo: "Experiencia" },
  { nombre: "Aportación libre", objetivo: 0, aportado: 890, tipo: "Hucha" },
];

export const eur = (n: number) =>
  n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
