// Tours guiados del panel (globos paso a paso). Uno por pantalla: se lanza
// solo la primera vez que entras y se puede repetir desde el botón de ayuda.

export type PasoTour = {
  // Selector del elemento a señalar. Sin selector = globo centrado.
  el?: string;
  titulo: string;
  texto: string;
  // Dónde colocar el globo respecto al elemento.
  lado?: "top" | "bottom" | "left" | "right" | "over";
};

export type Tour = { pasos: PasoTour[] };

// Clave de tour por ruta del panel.
export const TOUR_POR_RUTA: Record<string, string> = {
  "/panel": "panel",
  "/panel/webs": "webs",
  "/panel/save-the-date": "savethedate",
  "/panel/invitacion": "invitacion",
  "/panel/regalos": "regalos",
  "/panel/gestion": "gestion",
  "/panel/gestion/presupuesto": "presupuesto",
  "/panel/gestion/tiempos": "tareas",
  "/panel/gestion/invitados": "invitados",
  "/panel/gestion/mesas": "mesas",
  "/panel/gestion/formulario": "formulario",
  "/panel/gestion/proveedores": "proveedores",
};

export const TOURS: Record<string, Tour> = {
  panel: {
    pasos: [
      {
        titulo: "Bienvenida a webodas",
        texto:
          "Este es tu panel. Desde aquí preparas toda la boda: la web para tus invitados, la lista de regalos y la gestión (presupuesto, tareas, invitados y mesas). Te enseño lo principal en 30 segundos.",
      },
      {
        el: '[data-tour="panel-resumen"]',
        titulo: "Tu resumen",
        texto:
          "Un vistazo rápido: días que faltan, cuánta gente ha confirmado y cómo va el presupuesto. Se rellena solo a medida que usas el resto.",
        lado: "bottom",
      },
      {
        el: '[data-tour="panel-servicios"]',
        titulo: "Tus tres servicios",
        texto:
          "Web de boda, lista de regalos y gestión de la boda. Puedes trabajarlos en cualquier orden; lo normal es empezar por la web.",
        lado: "top",
      },
      {
        el: '[data-tour="panel-tareas"]',
        titulo: "Lo que toca ya",
        texto:
          "Según la fecha de la boda te decimos qué tareas tocan este mes. Toca los puntos de la izquierda para marcarlas como en proceso o hechas.",
        lado: "top",
      },
      {
        el: '[data-tour="perfil"]',
        titulo: "Vuestros datos",
        texto:
          "Aquí cambias los nombres, la fecha y el lugar de la boda. La fecha es importante: activa el calendario de tareas.",
        lado: "left",
      },
      {
        el: '[data-tour="ayuda"]',
        titulo: "¿Perdida?",
        texto:
          "Este botón repite la explicación de la pantalla en la que estés. Está en todas las páginas del panel.",
        lado: "left",
      },
    ],
  },

  webs: {
    pasos: [
      {
        titulo: "Webs para tus invitados",
        texto:
          "Aquí creas tres cosas: la web de boda completa, el save the date y la invitación clásica. Cada una tiene su enlace o su descarga.",
      },
      {
        el: '[data-tour="webs-plantillas"]',
        titulo: "Elige una plantilla",
        texto:
          "Empieza por una de las tres plantillas o desde cero. Luego puedes cambiar colores, textos, fotos y secciones enteras.",
        lado: "bottom",
      },
      {
        el: '[data-tour="webs-std"]',
        titulo: "Save the date",
        texto:
          "Una sola hoja con vuestros nombres, la fecha y una foto. Para avisar pronto, antes de tener la web lista.",
        lado: "top",
      },
      {
        el: '[data-tour="webs-inv"]',
        titulo: "Invitación de boda",
        texto:
          "La invitación clásica de toda la vida. Se rellena aquí y se descarga en PDF para llevar a imprenta.",
        lado: "top",
      },
    ],
  },

  savethedate: {
    pasos: [
      {
        titulo: "Save the date",
        texto:
          "Diseña una tarjeta sencilla: nombres, fecha y una imagen de fondo. Arrastra la foto para colocarla y usa el mando de flechas para ajustarla.",
      },
      {
        el: '[data-tour="std-estilo"]',
        titulo: "Estilo",
        texto:
          "Cambia el acabado del papel, la tipografía y dónde va el texto. Prueba combinaciones hasta que te guste.",
        lado: "right",
      },
      {
        el: '[data-tour="std-publicar"]',
        titulo: "Publicar",
        texto:
          "Al publicarlo obtienes un enlace en la pestaña Webs para mandar por WhatsApp. También puedes descargarlo como imagen.",
        lado: "top",
      },
    ],
  },

  invitacion: {
    pasos: [
      {
        titulo: "Invitación de boda",
        texto:
          "La invitación formal: los padres en las esquinas, la participación en el centro y las direcciones abajo. Rellena solo lo que quieras que aparezca.",
      },
      {
        el: '[data-tour="inv-padres"]',
        titulo: "Los padres",
        texto:
          "Padres de la novia arriba a la izquierda, padres del novio arriba a la derecha, y sus direcciones justo debajo.",
        lado: "right",
      },
      {
        el: '[data-tour="inv-texto"]',
        titulo: "El texto central",
        texto:
          "La línea de participación, vuestros nombres y el párrafo de la ceremonia. Tienes un botón para usar un texto de ejemplo y cambiarlo.",
        lado: "right",
      },
      {
        el: '[data-tour="inv-estilo"]',
        titulo: "Estilo y letra",
        texto:
          "Colores y tipografía. La opción «Clásica» es la letra tradicional de imprenta.",
        lado: "right",
      },
      {
        el: '[data-tour="inv-descargar"]',
        titulo: "Descargar en PDF",
        texto:
          "Genera un PDF sin fondo y al tamaño real de la invitación, listo para llevar a imprenta sobre el papel que elijas.",
        lado: "top",
      },
    ],
  },

  regalos: {
    pasos: [
      {
        titulo: "Lista de regalos",
        texto:
          "Tus invitados aportan dinero para regalos concretos o para un fondo común. webodas no cobra comisión: el dinero va íntegro a vosotros.",
      },
      {
        el: '[data-tour="regalos-cobro"]',
        titulo: "Cómo recibís el dinero",
        texto:
          "Dos opciones: transferencia/Bizum (ponéis vuestro IBAN y confirmáis cada aportación a mano) o Stripe (los invitados pagan con tarjeta en una página segura).",
        lado: "bottom",
      },
      {
        el: '[data-tour="regalos-items"]',
        titulo: "Vuestros regalos",
        texto:
          "Añade regalos con foto y objetivo, o deja solo un fondo común. Los textos de arriba son los que ven tus invitados.",
        lado: "top",
      },
    ],
  },

  gestion: {
    pasos: [
      {
        titulo: "Gestión de la boda",
        texto:
          "El centro de control: presupuesto, tareas, invitados, mesas, formulario y proveedores. Todo conectado entre sí.",
      },
      {
        el: '[data-tour="gestion-nav"]',
        titulo: "Cambiar de sección",
        texto:
          "En el móvil, este desplegable te lleva a cada sección. En el ordenador son pestañas.",
        lado: "bottom",
      },
      {
        el: '[data-tour="gestion-formulario"]',
        titulo: "Respuestas del formulario",
        texto:
          "Cuando un invitado confirma en la web, aparece aquí. Tú decides cuándo pasar esa información a tu lista de invitados.",
        lado: "bottom",
      },
      {
        el: '[data-tour="gestion-copia"]',
        titulo: "Copia de seguridad",
        texto:
          "Tus datos se guardan solos en tu cuenta. Aun así puedes descargar una copia en cualquier momento.",
        lado: "top",
      },
    ],
  },

  presupuesto: {
    pasos: [
      {
        titulo: "Presupuesto",
        texto:
          "Controla lo que estimas gastar y lo que ya has pagado, por categorías. Los totales de arriba se calculan solos.",
      },
      {
        el: '[data-tour="ppto-total"]',
        titulo: "Presupuesto total",
        texto:
          "Pon aquí el tope que os habéis marcado. Te avisamos cuando lo estimado se pasa de esa cifra.",
        lado: "bottom",
      },
      {
        el: '[data-tour="ppto-categorias"]',
        titulo: "Categorías",
        texto:
          "Toca una categoría para desplegar sus partidas y escribir importes. En la cabecera ves siempre el subtotal.",
        lado: "top",
      },
      {
        el: '[data-tour="ppto-editar"]',
        titulo: "Editar",
        texto:
          "Con «Editar» puedes añadir o quitar partidas y categorías, y renombrarlas. Con «Descargar en Excel» te lo llevas a una hoja de cálculo.",
        lado: "bottom",
      },
    ],
  },

  tareas: {
    pasos: [
      {
        titulo: "Tareas de la boda",
        texto:
          "Una lista completa de todo lo que hay que hacer, ordenada por cuándo toca. Ya viene rellena; tú la ajustas a vuestra boda.",
      },
      {
        el: '[data-tour="tareas-vista"]',
        titulo: "Por tiempo o por categoría",
        texto:
          "«Por tiempo» las agrupa por meses que faltan. «Por categoría» las agrupa por tema (iglesia, banquete…).",
        lado: "bottom",
      },
      {
        el: '[data-tour="tareas-responsable"]',
        titulo: "Reparto",
        texto:
          "Filtra por quién se encarga de cada tarea. El responsable se asigna dentro de la ficha de cada tarea.",
        lado: "bottom",
      },
      {
        el: '[data-tour="tareas-grupo"]',
        titulo: "Grupos plegables",
        texto:
          "Cada bloque se abre y se cierra. Toca el título de una tarea para abrir su ficha con datos, presupuesto vinculado y notas.",
        lado: "top",
      },
      {
        el: '[data-tour="tareas-estado"]',
        titulo: "Estado de cada tarea",
        texto:
          "Los tres puntos: sin empezar, en proceso y hecha. Toca para cambiarlo.",
        lado: "right",
      },
    ],
  },

  invitados: {
    pasos: [
      {
        titulo: "Lista de invitados",
        texto:
          "Una fila por persona. Aquí llevas quién viene, en qué grupo está, si necesita autobús, su regalo… lo que tú decidas.",
      },
      {
        el: '[data-tour="invitados-tabs"]',
        titulo: "Dos vistas",
        texto:
          "«Mi lista de gestión» es tu lista de trabajo. «Respuestas del formulario» es lo que han rellenado los invitados en la web, pendiente de que lo vuelques.",
        lado: "bottom",
      },
      {
        el: '[data-tour="invitados-anadir"]',
        titulo: "Añadir invitados",
        texto:
          "Uno a uno, o de golpe importando un Excel con nombres y apellidos.",
        lado: "top",
      },
      {
        el: '[data-tour="invitados-ajustes"]',
        titulo: "Ajustes de la lista",
        texto:
          "Aquí creas grupos y subgrupos, eliges qué columnas ver y asocias cada columna a una pregunta del formulario para que se rellene sola.",
        lado: "bottom",
      },
    ],
  },

  mesas: {
    pasos: [
      {
        titulo: "Plano de mesas",
        texto:
          "Coloca a tus invitados por mesas. Puedes asignar silla concreta o dejar la mesa libre.",
      },
      {
        el: '[data-tour="mesas-tipos"]',
        titulo: "1 · Tipos de mesa",
        texto:
          "Marca los tipos que usarás (redonda, cuadrada, rectangular) y cuánta gente cabe en cada uno.",
        lado: "bottom",
      },
      {
        el: '[data-tour="mesas-anadir"]',
        titulo: "3 · Añadir mesas",
        texto:
          "Crea cada mesa, ponle número y nombre, y sienta invitados. Solo aparecen los que aún no tienen mesa.",
        lado: "top",
      },
      {
        el: '[data-tour="mesas-imprimir"]',
        titulo: "Imprimir el plano",
        texto:
          "Genera un PDF elegante con una página por mesa y la lista de nombres. Perfecto para el día de la boda.",
        lado: "top",
      },
    ],
  },

  formulario: {
    pasos: [
      {
        titulo: "Formulario de confirmación",
        texto:
          "Lo que tus invitados rellenan en la web para confirmar. Aquí eliges qué se les pregunta y en qué orden.",
      },
      {
        el: '[data-tour="form-estandar"]',
        titulo: "Datos estándar",
        texto:
          "Los datos habituales: nombre, email, asistencia, acompañante, alergias y autobús. Marca los que quieras pedir.",
        lado: "top",
      },
      {
        el: '[data-tour="form-preguntas"]',
        titulo: "Tus preguntas",
        texto:
          "Añade preguntas propias (menú, canción favorita…), con opciones y condiciones. Ordénalo todo con las flechas.",
        lado: "top",
      },
      {
        el: '[data-tour="form-preview"]',
        titulo: "Vista previa",
        texto:
          "Abre el formulario tal y como lo verán tus invitados antes de publicarlo en la web.",
        lado: "top",
      },
    ],
  },

  proveedores: {
    pasos: [
      {
        titulo: "Proveedores",
        texto:
          "Todos tus proveedores en un sitio, con su estado y su importe. Los que marcas como contratados en Tareas aparecen aquí solos.",
      },
      {
        el: '[data-tour="prov-anadir"]',
        titulo: "Añadir a mano",
        texto:
          "Añade también proveedores que no estén en tu lista de tareas: contacto, estado y lo que has pagado.",
        lado: "top",
      },
    ],
  },
};

const KEY = "webodas:__tours"; // doble guion bajo: no se sincroniza a la nube

type Estado = { vistos: string[] };

function leer(): Estado {
  if (typeof window === "undefined") return { vistos: [] };
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as Estado) : { vistos: [] };
  } catch {
    return { vistos: [] };
  }
}

export function tourVisto(key: string): boolean {
  return leer().vistos.includes(key);
}

export function marcarTourVisto(key: string) {
  try {
    const e = leer();
    if (!e.vistos.includes(key)) {
      e.vistos.push(key);
      localStorage.setItem(KEY, JSON.stringify(e));
    }
  } catch {
    /* noop */
  }
}

export function reiniciarTours() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
