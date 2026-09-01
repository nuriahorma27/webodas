import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export const metadata = {
  title: "webodas · Toda vuestra boda en un sitio",
  description:
    "La web de boda, la lista de regalos, las invitaciones y la organización del día, en un mismo sitio. 7 días de prueba gratis, sin tarjeta.",
};

const pasos: [string, string][] = [
  ["Creáis la cuenta", "Un minuto, sin tarjeta. Tenéis 7 días para probarlo con calma."],
  ["Montáis la web", "Elegís una plantilla y la hacéis vuestra: fotos, textos y colores."],
  ["Abrís la lista de regalos", "Transferencia, Bizum o tarjeta. Sin comisión de webodas."],
  ["Organizáis lo demás", "Tareas por meses, presupuesto, invitados y plano de mesas."],
];

const faqs: [string, string][] = [
  [
    "¿Qué pasa cuando terminan los 7 días?",
    "Nada se borra: la web y la organización quedan guardadas. Para publicar la web con vuestro enlace y abrir la lista de regalos hay que activar el plan anual.",
  ],
  [
    "¿webodas se queda una comisión de los regalos?",
    "No. Las aportaciones por transferencia y Bizum llegan íntegras a vuestra cuenta. En los pagos con tarjeta se aplica solo la tarifa de Stripe, la pasarela de pago; webodas no añade nada.",
  ],
  [
    "¿Necesitamos saber de diseño?",
    "No. Partís de una plantilla y editáis desde el ordenador cambiando textos, fotos y colores. La web se ve bien en el móvil sin que tengáis que hacer nada.",
  ],
  [
    "¿Podemos llevar la invitación a la imprenta?",
    "Sí. Se descarga en PDF al tamaño real, lista para enviar. El save the date se comparte por un enlace.",
  ],
  [
    "¿Qué es «Recuerdo»?",
    "Un extra opcional. Cuando pasa la boda, mantiene la web publicada con la galería y los mensajes de los invitados. Se paga mes a mes y se cancela cuando queráis.",
  ],
  [
    "¿La organización se puede exportar?",
    "Sí. La lista de invitados y el presupuesto se descargan en Excel en cualquier momento.",
  ],
];

export default function Landing() {
  return (
    <div className="lp flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="lp-display text-[1.35rem]">webodas</span>
          <nav className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
            <a href="#producto" className="transition hover:text-[var(--ink)]">Qué incluye</a>
            <a href="#como" className="transition hover:text-[var(--ink)]">Cómo funciona</a>
            <a href="#precio" className="transition hover:text-[var(--ink)]">Precio</a>
          </nav>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/inicio" className="text-[var(--muted)] transition hover:text-[var(--ink)]">
              Entrar
            </Link>
            <Link href="/inicio?crear=1" className="lp-cta !px-5 !py-2.5">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-14 pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="lp-rise lp-rise-1 lp-kicker">Organización de bodas</p>
          <h1 className="lp-rise lp-rise-2 lp-display mt-5 text-[3rem] sm:text-[4.25rem]">
            Toda vuestra boda,
            <br />
            <span className="lp-display-it">en un sitio.</span>
          </h1>
          <p className="lp-rise lp-rise-3 mt-6 max-w-md text-[1.05rem] leading-relaxed text-[var(--muted)]">
            La web, los regalos, las invitaciones y la organización del día, sin ir saltando entre mil
            sitios. Para que disfrutéis también del camino hasta la boda.
          </p>
          <div className="lp-rise lp-rise-4 mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href="/inicio?crear=1" className="lp-cta">Empezar gratis</Link>
            <a href="#como" className="lp-link">Ver cómo funciona</a>
          </div>
          <p className="lp-rise lp-rise-4 mt-5 text-sm text-[var(--muted)]">
            7 días de prueba · sin tarjeta · en español
          </p>
        </div>

        <div className="lp-rise lp-rise-3">
          <HeroOrganizacion />
        </div>
      </section>

      {/* franja */}
      <section className="border-y border-[var(--line)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-4xl px-5 py-7 text-center">
          <p className="lp-display text-xl leading-snug sm:text-2xl">
            Una boda tiene mil cosas pequeñas. Aquí viven todas juntas y se van colocando solas.
          </p>
        </div>
      </section>

      {/* producto */}
      <section id="producto" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 lg:py-28">
        <header className="max-w-2xl">
          <p className="lp-kicker">Qué incluye</p>
          <h2 className="lp-display mt-4 text-[2.5rem] sm:text-[3.25rem]">
            Cuatro herramientas que se hablan entre ellas.
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            Cuando confirmáis un proveedor, el presupuesto se actualiza. Cuando un invitado responde,
            aparece en la lista y en las mesas. No hay que copiar nada de un lado a otro.
          </p>
        </header>

        <div className="mt-16 space-y-20 lg:space-y-28">
          <Feature
            kicker="Web de boda"
            titulo="La web que cuenta vuestra historia"
            texto="Elegís una plantilla y la hacéis vuestra: vuestras fotos, vuestros colores y vuestra manera de contarlo. Cuenta atrás, cómo llegar, la agenda del día y la confirmación de asistencia. Y se ve preciosa en el móvil, que es donde la van a abrir."
            puntos={["Sin saber de diseño", "Con vuestro propio enlace"]}
          >
            <EditorWebMockup />
          </Feature>

          <Feature
            invertida
            kicker="Lista de regalos"
            titulo="Vuestra presencia es el regalo"
            texto="Pero si quieren tener un detalle, se lo ponéis fácil: transferencia, Bizum o tarjeta. Podéis pedir cosas concretas o abrir un fondo común, y vais viendo quién ha aportado."
            puntos={["Sin comisión de webodas", "Regalos concretos o fondo común"]}
          >
            <RegalosRusticos />
          </Feature>

          <Feature
            kicker="Invitación y save the date"
            titulo="La invitación de siempre, lista para imprenta"
            texto="Con su tipografía y su formato clásico. Ponéis vuestros nombres y la descargáis en PDF al tamaño real. El save the date, para avisar pronto, se comparte con un enlace."
            puntos={["PDF a tamaño real", "Save the date por enlace"]}
          >
            <InvitacionShots />
          </Feature>

          <Feature
            invertida
            kicker="Organización"
            titulo="Llegad al gran día sin sustos"
            texto="Tareas por meses, presupuesto por partidas, la lista de invitados con sus confirmaciones y el plano de mesas. Lo que cambia en un lado se actualiza en el otro."
            puntos={["Todo exportable a Excel", "Editor visual de mesas"]}
          >
            <GestionRealPreview />
          </Feature>
        </div>
      </section>

      {/* cómo funciona */}
      <section id="como" className="scroll-mt-24 border-y border-[var(--line)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
          <p className="lp-kicker">Cómo funciona</p>
          <h2 className="lp-display mt-4 text-[2.5rem] sm:text-[3.25rem]">De la cuenta a la boda</h2>
          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map(([t, d], i) => (
              <li key={t}>
                <span className="lp-display text-[1.75rem] text-[var(--green-deep)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 border-t border-[var(--line)] pt-3 font-medium">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* precio */}
      <section id="precio" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 lg:py-28">
        <header className="max-w-2xl">
          <p className="lp-kicker">Precio</p>
          <h2 className="lp-display mt-4 text-[2.5rem] sm:text-[3.25rem]">Un plan para toda la boda.</h2>
          <p className="mt-4 text-[var(--muted)]">
            Probáis 7 días gratis, sin tarjeta. Si os enamora, un pago al año y os olvidáis hasta el
            gran día.
          </p>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-8 sm:p-10">
            <div className="flex items-baseline gap-3">
              <span className="lp-display text-6xl">59&nbsp;€</span>
              <span className="text-sm text-[var(--muted)]">al año</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Plan webodas. Un pago anual que cubre toda la organización, de la primera reunión al día
              siguiente de la boda.
            </p>
            <ul className="mt-8 space-y-3.5 text-sm">
              {[
                "Web de boda publicada con vuestro enlace",
                "Lista de regalos sin comisión de webodas",
                "Invitación en PDF y save the date por enlace",
                "Presupuesto, tareas, invitados y mesas",
                "Exportación a Excel y galería de fotos",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/inicio?crear=1" className="lp-cta mt-9">Empezar los 7 días gratis</Link>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-2)] p-8 sm:p-10">
            <p className="lp-kicker">Extra opcional</p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="lp-display text-4xl">7,99&nbsp;€</span>
              <span className="text-sm text-[var(--muted)]">al mes</span>
            </div>
            <p className="mt-3 text-sm font-medium">Recuerdo</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Cuando pasa la boda, mantiene la web publicada como recuerdo, con la galería y los
              mensajes de los invitados. Sin permanencia; se cancela cuando queráis.
            </p>
            <p className="mt-8 text-xs text-[var(--muted)]">Se activa desde el panel cuando lo necesitéis.</p>
          </div>
        </div>
      </section>

      {/* preguntas */}
      <section id="preguntas" className="border-t border-[var(--line)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-3xl px-5 py-20 lg:py-24">
          <p className="lp-kicker">Preguntas</p>
          <h2 className="lp-display mt-4 text-[2.5rem] sm:text-[3.25rem]">Antes de empezar</h2>
          <div className="mt-10">
            {faqs.map(([q, a]) => (
              <details key={q} className="group border-t border-[var(--line)] py-5 last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium">
                  {q}
                  <span className="shrink-0 text-[var(--muted)] transition-transform group-open:rotate-90">›</span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* cierre */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 text-center lg:py-32">
        <h2 className="lp-display mx-auto max-w-2xl text-[2.75rem] sm:text-[3.5rem]">
          Vuestra boda ya está empezando
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">
          Abrid la web hoy y empezad a colocar las piezas. 7 días de prueba, sin tarjeta.
        </p>
        <Link href="/inicio?crear=1" className="lp-cta mt-8">Empezar gratis</Link>
      </section>

      <footer className="mt-auto border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span className="lp-display text-lg text-[var(--ink)]">webodas</span>
          <div className="flex flex-wrap gap-6">
            <Link href="/legal" className="transition hover:text-[var(--ink)]">Aviso legal</Link>
            <Link href="/privacidad" className="transition hover:text-[var(--ink)]">Privacidad</Link>
            <a href="mailto:hola@webodas.com" className="transition hover:text-[var(--ink)]">hola@webodas.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Mockups del producto para el hero y las secciones ---------- */

function HeroOrganizacion() {
  return (
    <div className="relative rounded-[1.75rem] border border-[#ddd1bc] bg-[#f4eee3] p-4 shadow-[0_35px_80px_-35px_rgba(47,39,27,.45)] sm:p-6">
      <div className="rounded-2xl border border-[#ded5c7] bg-[#fffdfa] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[.62rem] uppercase tracking-[.22em] text-[var(--muted)]">Presupuesto total</p>
            <p className="lp-display mt-2 text-4xl">80.000 €</p>
          </div>
          <span className="rounded-full bg-[#e9dfcd] px-3 py-1 text-[.65rem] text-[#765c31]">Todo bajo control</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4">
          {[["Estimado", "39.700 €"], ["Pagado", "12.450 €"], ["Pendiente", "27.250 €"]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[.55rem] uppercase tracking-wider text-[var(--muted)]">{k}</p>
              <p className="lp-display mt-1 text-lg sm:text-xl">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee7dc]">
          <div className="h-full w-[31%] rounded-full bg-[var(--green)]" />
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border border-[#e7dfd2]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-[#f6f1e8] px-3 py-2 text-[.5rem] uppercase tracking-[.14em] text-[var(--muted)]">
            <span>Partida</span>
            <span>Estimado</span>
            <span>Pagado</span>
          </div>
          {[
            ["Finca y celebración", "14.500 €", "6.000 €", 42],
            ["Fotografía y vídeo", "3.200 €", "1.600 €", 50],
            ["Flores y decoración", "2.400 €", "600 €", 25],
          ].map(([nombre, estimado, pagado, avance]) => (
            <div
              key={nombre as string}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[#eee7dc] px-3 py-2 text-[.62rem] first:border-t-0"
            >
              <div>
                <p className="text-[var(--ink)]">{nombre}</p>
                <div className="mt-1 h-1 w-20 overflow-hidden rounded bg-[#eee7dc]">
                  <div className="h-full rounded bg-[var(--green)]" style={{ width: `${avance}%` }} />
                </div>
              </div>
              <span className="text-[var(--muted)]">{estimado}</span>
              <span className="font-medium text-[var(--green-deep)]">{pagado}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative -mt-1 ml-auto w-[82%] rotate-[1.5deg] rounded-xl border border-[#ddd2c2] bg-white p-4 shadow-[0_18px_35px_-24px_rgba(33,29,26,.55)] sm:w-[72%]">
        <p className="text-[.6rem] uppercase tracking-[.2em] text-[var(--muted)]">Tareas de esta semana</p>
        <ul className="mt-2 space-y-2 text-xs">
          {["Cerrar el menú", "Confirmar la finca", "Enviar el save the date", "Revisar presupuesto"].map((t) => (
            <li key={t} className="flex items-center gap-2 text-[var(--muted)] line-through">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--green)] text-[.55rem] text-white">✓</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EditorWebMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#cfcdbf] bg-[#f8f8f3] shadow-[0_28px_65px_-30px_rgba(33,50,35,.42)]">
      <div className="flex h-10 items-center justify-between border-b border-[#dcded4] bg-white px-3 text-[.58rem] text-[#687168]">
        <span>
          ← Salir　 <b className="lp-display text-sm text-[#26372c]">webodas</b>
        </span>
        <span>
          ↶　 Restablecer　 <b className="rounded border border-[#637966] px-2 py-1 text-[#415a47]">Ver web</b>　{" "}
          <b className="rounded bg-[#314a39] px-2 py-1 text-white">Publicar</b>
        </span>
      </div>
      <div className="grid grid-cols-[21%_1fr_23%]">
        <div className="border-r border-[#dcded4] bg-white p-2.5 text-[.5rem] text-[#536056]">
          <b className="text-[.58rem] text-[#25342a]">Secciones de la web</b>
          <div className="mt-3 space-y-1.5">
            {["Ajustes de la página", "Portada", "Listado de ítems", "Galería", "Cómo llegar", "Formulario de confirmación"].map(
              (x, i) => (
                <p key={x} className={i === 0 ? "rounded bg-[#314a39] px-2 py-2 text-white" : "rounded px-2 py-1.5"}>
                  {x}
                </p>
              ),
            )}
          </div>
        </div>
        <div className="min-h-72 overflow-hidden bg-white p-3">
          <div className="grid h-52 grid-cols-[.92fr_1.08fr] overflow-hidden border border-[#ecece5] bg-[#fbfbf7]">
            <div className="flex flex-col justify-center px-5 text-[#46604c]">
              <p className="text-[.47rem] uppercase tracking-[.35em]">Nos casamos</p>
              <p className="lp-display mt-4 text-[1.8rem] leading-[.95]">
                Marta &<br />
                Javier
              </p>
              <p className="lp-display mt-4 text-[.7rem] tracking-[.18em]">6 de junio de 2026</p>
            </div>
            <div className="relative">
              <Image src="/landing/editor-acuarela.png" alt="Portada en acuarela dentro del editor" fill sizes="360px" className="object-cover" />
            </div>
          </div>
          <p className="lp-display py-5 text-center text-xl text-[#405746]">El día</p>
        </div>
        <div className="border-l border-[#dcded4] bg-white p-2.5 text-[.5rem] text-[#637066]">
          <b className="text-[.58rem] text-[#26372c]">Ajustes de la página</b>
          <p className="mt-4 font-medium text-[#35483a]">Color principal</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {["#f8f7f1", "#314a39", "#526b51", "#8fa187", "#d8c9a5"].map((c) => (
              <span key={c} className="h-5 w-5 rounded border border-[#cfd4ca]" style={{ background: c }} />
            ))}
          </div>
          <p className="mt-4 font-medium text-[#35483a]">Color de fondo</p>
          <div className="mt-2 h-7 rounded border border-[#d6dbd1] bg-[#f3f5ef]" />
          <p className="mt-4 font-medium text-[#35483a]">Barra de navegación</p>
          <div className="mt-2 grid grid-cols-2 overflow-hidden rounded border border-[#d6dbd1]">
            <span className="bg-[#e9eee7] py-1 text-center">No</span>
            <span className="py-1 text-center">Sí</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegalosRusticos() {
  const regalos = [
    ["/landing/regalos-rusticos/viaje-novios.png", "Viaje de novios", "2.500 €"],
    ["/landing/regalos-rusticos/mueble-cocina.png", "Mueble de cocina", "1.200 €"],
    ["/landing/regalos-rusticos/sofa.png", "Sofá", "1.800 €"],
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {regalos.map(([src, nombre, precio]) => (
        <div key={src} className="overflow-hidden rounded-xl border border-[#d8ceba] bg-white shadow-sm">
          <div className="relative aspect-[4/3]">
            <Image src={src} alt={nombre} fill sizes="180px" className="object-cover" />
          </div>
          <div className="p-2.5">
            <p className="lp-display text-sm sm:text-lg">{nombre}</p>
            <p className="mt-1 text-[.6rem] text-[var(--muted)]">Objetivo · {precio}</p>
            <div className="mt-2 h-1 rounded bg-[#eee8dd]">
              <div className="h-full w-[55%] rounded bg-[var(--green)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GestionRealPreview() {
  return (
    <div className="relative min-h-[32rem] min-w-0 max-w-full sm:grid sm:min-h-0 sm:grid-cols-[1.08fr_.92fr] sm:items-start sm:gap-3">
      <div className="min-w-0 w-[84%] overflow-hidden rounded-xl border border-[#d8ceba] bg-white p-2 shadow-[0_28px_65px_-30px_rgba(33,29,26,.4)] sm:w-auto">
        <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "809 / 1150" }}>
          <Image src="/landing/gestion.png" alt="Pantalla real de presupuesto y tareas" fill sizes="360px" className="object-cover object-top" />
        </div>
      </div>
      <div className="absolute bottom-5 right-2 z-10 min-w-0 w-[68%] max-w-[calc(100%_-_0.5rem)] overflow-hidden rounded-xl border border-[#d8ceba] bg-white p-3 shadow-[0_24px_50px_-22px_rgba(33,29,26,.55)] sm:static sm:mt-10 sm:w-auto sm:max-w-none">
        <p className="lp-display text-lg">Mesas</p>
        <p className="mt-0.5 text-[.55rem] text-[var(--muted)]">1 mesa · 5/10 plazas ocupadas · 46 sin mesa</p>
        <div className="mt-3 rounded-lg border border-[#dfd5c4] p-2.5">
          <div className="flex min-w-0 items-center justify-between gap-1">
            <span className="rounded bg-[#211f1c] px-2 py-1 text-[.48rem] font-semibold text-white">MESA 1</span>
            <span className="min-w-0 truncate rounded-full border border-[var(--green)] px-2 py-1 text-[.46rem] text-[var(--green-deep)]">
              ★ Presidencial
            </span>
          </div>
          <p className="mt-2 rounded border border-[#e3dacb] px-2 py-1 text-[.55rem]">Mesa familia</p>
          <p className="mt-1.5 text-[.46rem] text-[var(--muted)]">Redonda · 10 plazas · 5 sentados</p>
          <div className="relative mx-auto mt-3 aspect-square w-full max-w-32">
            <div className="absolute inset-[22%] rounded-full border border-[#c9b58e] bg-[#f8f5ee]" />
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((seat, index) => {
              const angle = ((index * 36 - 90) * Math.PI) / 180;
              const left = 50 + Math.cos(angle) * 43;
              const top = 50 + Math.sin(angle) * 43;
              return (
                <span
                  key={seat}
                  className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[.42rem] ${
                    index < 5 ? "border-[var(--green)] bg-white text-[#27241f]" : "border-dashed border-[#ddd2bf] bg-white text-[#9b9488]"
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {seat}
                </span>
              );
            })}
          </div>
          <div className="mt-3 space-y-1.5">
            {["Javier Urrecho Díaz", "Laura Méndez Gil", "Rosario Pascual", "Carmen Contreras"].map((guest, index) => (
              <div key={guest} className="flex min-w-0 items-center gap-1.5 text-[.46rem]">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[.38rem] text-white ${
                    index === 1 ? "bg-[var(--green)]" : "bg-[#a9864d]"
                  }`}
                >
                  {index === 1 ? "✓" : "P"}
                </span>
                <span className="min-w-0 truncate">{guest}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded border border-dashed border-[#d8ceba] py-1.5 text-center text-[.46rem] text-[var(--green-deep)]">
            + Sentar invitado
          </div>
        </div>
      </div>
    </div>
  );
}

function PaperShot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`rounded-md border border-[var(--line)] bg-[var(--paper-2)] p-2.5 shadow-[0_30px_60px_-40px_rgba(50,43,32,0.55)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={1200}
        loading="lazy"
        sizes="(max-width: 1024px) 90vw, 420px"
        className="block h-auto w-full bg-white"
      />
    </div>
  );
}

/* Invitación como pieza principal; el save the date superpuesto en la esquina
   en escritorio, apilado debajo en móvil (donde superponer lo haría ilegible). */
function InvitacionShots() {
  return (
    <div className="relative sm:pb-16 sm:pr-24">
      <PaperShot src="/landing/invitacion.png" alt="Invitación de boda clásica de Marta y Javier, en PDF" />
      <div className="mt-4 ml-auto w-[58%] max-w-[15rem] sm:absolute sm:-bottom-2 sm:right-0 sm:mt-0 sm:w-[42%]">
        <PaperShot src="/landing/savethedate-nuevo.jpeg" alt="Save the date en acuarela" />
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8.5l3.5 3.5L13 4" />
    </svg>
  );
}

function Feature({
  kicker,
  titulo,
  texto,
  puntos,
  invertida,
  children,
}: {
  kicker: string;
  titulo: string;
  texto: string;
  puntos: string[];
  invertida?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={invertida ? "lg:order-2" : ""}>
        <p className="lp-kicker">{kicker}</p>
        <h3 className="lp-display mt-3 text-[2rem] sm:text-[2.4rem]">{titulo}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-[var(--muted)]">{texto}</p>
        <ul className="mt-6 space-y-2.5">
          {puntos.map((pt) => (
            <li key={pt} className="flex items-start gap-3 text-sm">
              <Check />
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div className={invertida ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}
