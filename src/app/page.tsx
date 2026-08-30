import Link from "next/link";

export const metadata = {
  title: "webodas · Toda vuestra boda en un solo sitio",
  description:
    "Crea la web de tu boda, comparte la lista de regalos sin comisiones, prepara las invitaciones y organiza el gran día. Todo en un mismo panel, en español.",
};

const pasos = [
  ["Creáis la cuenta", "Con un email entráis a vuestro panel. Gratis."],
  ["Montáis la web", "Elegís una plantilla y la dejáis a vuestro gusto."],
  ["Abrís la lista de regalos", "Por transferencia, Bizum o tarjeta. Sin comisiones."],
  ["Organizáis el resto", "Presupuesto, tareas, invitados y mesas, todo junto."],
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* barra */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <span className="font-display text-xl tracking-tight">webodas</span>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#producto" className="hidden text-muted transition hover:text-foreground sm:inline">
              Qué incluye
            </a>
            <a href="#como" className="hidden text-muted transition hover:text-foreground sm:inline">
              Cómo funciona
            </a>
            <Link href="/inicio" className="text-muted transition hover:text-foreground">
              Entrar
            </Link>
            <Link
              href="/inicio?crear=1"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0e4d0 0%, rgba(240,228,208,0) 70%)" }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="lp-rise lp-rise-1 text-xs uppercase tracking-[0.28em] text-accent">
              Para novios que quieren disfrutar el proceso
            </p>
            <h1 className="lp-rise lp-rise-2 mt-5 font-display text-[2.9rem] leading-[1.06] tracking-tight sm:text-6xl">
              Toda vuestra boda,
              <br />
              <span className="italic text-accent">en un solo sitio.</span>
            </h1>
            <p className="lp-rise lp-rise-3 mt-6 max-w-md text-lg leading-relaxed text-muted">
              La web, la lista de regalos, las invitaciones y la organización del día. Sin cinco
              herramientas sueltas, sin hojas de cálculo y sin comisiones sobre los regalos.
            </p>
            <div className="lp-rise lp-rise-4 mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/inicio?crear=1"
                className="rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Empezar gratis
              </Link>
              <a
                href="#producto"
                className="group inline-flex items-center gap-2 text-sm font-medium text-foreground"
              >
                Ver cómo funciona
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>
            <p className="lp-rise lp-rise-4 mt-6 text-xs text-muted">
              Gratis para empezar · Web, regalos e invitaciones · Sin tarjeta
            </p>
          </div>

          {/* visual: la invitación + una pieza del panel */}
          <div className="lp-rise lp-rise-3 relative mx-auto w-full max-w-md lg:mx-0">
            <div style={{ transform: "rotate(-2deg)" }}>
              <InvitacionMock />
            </div>
            <div
              className="absolute -bottom-10 -left-8 hidden w-60 rounded-xl border border-line bg-white p-4 shadow-[0_20px_45px_-20px_rgba(33,29,26,0.3)] sm:block"
              style={{ transform: "rotate(3deg)" }}
            >
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">6 meses antes</p>
              <ul className="mt-2 space-y-2 text-xs">
                {[
                  ["Reservar la finca", true],
                  ["Elegir el menú", true],
                  ["Contratar fotógrafo", false],
                  ["Enviar invitaciones", false],
                ].map(([t, ok]) => (
                  <li key={t as string} className="flex items-center gap-2">
                    <span
                      className={`grid h-3.5 w-3.5 place-items-center rounded-full border text-[0.5rem] ${
                        ok ? "border-accent bg-accent text-white" : "border-line"
                      }`}
                    >
                      {ok ? "✓" : ""}
                    </span>
                    <span className={ok ? "text-muted line-through" : ""}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* franja de confianza */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 text-center sm:grid-cols-3">
          {[
            ["4 en 1", "web · regalos · invitaciones · gestión"],
            ["0 % comisión", "en la lista de regalos"],
            ["En español", "y con soporte cercano"],
          ].map(([n, d]) => (
            <div key={n}>
              <p className="font-display text-2xl">{n}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* producto: filas alternas */}
      <section id="producto" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 lg:py-28">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-accent">Qué incluye</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Todo lo que se hace por separado, junto y hablándose entre sí.
          </h2>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28">
          <Fila
            eyebrow="Vuestra web"
            titulo="Una web de boda que da gusto enseñar"
            texto="Editor visual de arrastrar y soltar, plantillas con estética cuidada y un enlace con vuestros nombres. Portada, historia, agenda del día, cómo llegar, galería y confirmación de asistencia."
            puntos={["Sin saber nada de diseño", "Se ve perfecta también en el móvil"]}
          >
            <WebMock />
          </Fila>

          <Fila
            invertida
            eyebrow="Lista de regalos"
            titulo="El dinero llega íntegro a vuestra cuenta"
            texto="Compartís la lista y los invitados aportan online por transferencia, Bizum o tarjeta. webodas no se queda ninguna comisión, a diferencia de las listas de los bancos."
            puntos={["Regalos concretos o fondo común", "Seguimiento de quién ha aportado"]}
          >
            <RegaloMock />
          </Fila>

          <Fila
            eyebrow="Invitaciones"
            titulo="La invitación clásica, y el save the date"
            texto="La participación de toda la vida, con su tipografía y su formato tradicionales. Se rellena en dos minutos y se descarga en PDF, lista para llevar a imprenta."
            puntos={["Save the date para avisar pronto", "PDF al tamaño real, sin fondo"]}
          >
            <div
              className="mx-auto max-w-md rounded-xl p-6 shadow-[0_28px_60px_-30px_rgba(33,29,26,0.35)] sm:p-9"
              style={{ background: "linear-gradient(160deg,#ece4d5,#e0d5c1)" }}
            >
              <InvitacionMock />
            </div>
          </Fila>

          <Fila
            invertida
            eyebrow="Gestión del día"
            titulo="Presupuesto, tareas, invitados y mesas"
            texto="Una lista de tareas ya preparada y ordenada por meses, el presupuesto por partidas, la lista de invitados con sus confirmaciones y el plano de mesas. Todo conectado: si contratas un proveedor, el presupuesto se actualiza solo."
            puntos={["Exportable a Excel", "Plano de mesas imprimible"]}
          >
            <GestionMock />
          </Fila>
        </div>
      </section>

      {/* cómo funciona */}
      <section id="como" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs uppercase tracking-[0.24em] text-accent">En cuatro pasos</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Cómo funciona</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map(([t, d], i) => (
              <li key={t} className="border-t border-line pt-5">
                <span className="font-display text-2xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-medium">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* cierre */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div
          className="relative overflow-hidden rounded-2xl border border-line px-6 py-16 text-center sm:px-16"
          style={{ background: "linear-gradient(180deg, #f5ede0 0%, #f7f2ea 100%)" }}
        >
          <p className="font-display text-sm italic tracking-wide text-accent">S. R. C.</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Empezad hoy la web de vuestra boda
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Se tarda menos de lo que parece y no cuesta nada probarlo.
          </p>
          <Link
            href="/inicio?crear=1"
            className="mt-8 inline-block rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Crear nuestra web
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-lg text-foreground">webodas</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/legal" className="transition hover:text-foreground">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="transition hover:text-foreground">
              Privacidad
            </Link>
            <a href="mailto:hola@webodas.com" className="transition hover:text-foreground">
              hola@webodas.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- piezas ---------- */

function Fila({
  eyebrow,
  titulo,
  texto,
  puntos,
  invertida,
  children,
}: {
  eyebrow: string;
  titulo: string;
  texto: string;
  puntos: string[];
  invertida?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={invertida ? "lg:order-2" : ""}>
        <p className="text-xs uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight sm:text-[2.1rem]">{titulo}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-muted">{texto}</p>
        <ul className="mt-5 space-y-2">
          {puntos.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={invertida ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}

function Browserita() {
  return (
    <div className="flex items-center gap-1.5 border-b border-line bg-[#f6f2ec] px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-line" />
      <span className="h-2 w-2 rounded-full bg-line" />
      <span className="h-2 w-2 rounded-full bg-line" />
    </div>
  );
}

// Maqueta de la invitación clásica.
function InvitacionMock() {
  return (
    <div
      className="rounded-md border border-line px-8 py-12 text-center shadow-[0_18px_45px_-20px_rgba(33,29,26,0.35)]"
      style={{ background: "#fdfcf8", color: "#5b6a4c" }}
    >
      <p className="text-[0.62rem] uppercase tracking-[0.24em]">Participan el enlace de sus hijos</p>
      <p
        className="my-4 text-4xl sm:text-5xl"
        style={{ fontFamily: "var(--font-parisienne), cursive", lineHeight: 1.1 }}
      >
        Marta &amp; Javier
      </p>
      <p className="mx-auto max-w-[15rem] font-display text-sm italic leading-relaxed">
        tienen el gusto de invitaros a la ceremonia que se celebrará el sábado 18 de octubre en
        Madrid
      </p>
      <p className="mt-6 font-display text-sm tracking-[0.15em]">S. R. C.</p>
      <p className="font-display text-sm">Madrid, 2026</p>
    </div>
  );
}

// Maqueta del panel de tareas / presupuesto.
function GestionMock() {
  const filas = [
    ["Reservar la iglesia", "hecho"],
    ["Mirar y reservar la finca", "hecho"],
    ["Contratar el catering", "proceso"],
    ["Elegir las invitaciones", "sin"],
    ["Cerrar la lista de invitados", "sin"],
  ] as const;
  const tono = (e: string) =>
    e === "hecho" ? "bg-accent" : e === "proceso" ? "bg-[#c9a24a]" : "bg-line";
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_28px_60px_-30px_rgba(33,29,26,0.32)]">
      <Browserita />
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-lg">Tareas de la boda</p>
          <span className="text-xs text-muted">2 de 85</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full w-[14%] rounded-full bg-accent" />
        </div>
        <ul className="mt-4 divide-y divide-line/70 text-sm">
          {filas.map(([t, e]) => (
            <li key={t} className="flex items-center gap-3 py-2.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tono(e)}`} />
              <span className={e === "hecho" ? "text-muted line-through" : ""}>{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
          {[
            ["18.400 €", "presupuesto"],
            ["112", "invitados"],
            ["11", "mesas"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-lg">{n}</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Maqueta de una web de boda (sin captura: se dibuja).
function WebMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_28px_60px_-30px_rgba(33,29,26,0.32)]">
      <Browserita />
      <div className="flex items-center justify-between border-b border-line/70 px-5 py-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted">
        <span className="font-display text-sm normal-case tracking-tight text-foreground">
          Marta &amp; Javier
        </span>
        <span className="hidden gap-3 sm:flex">
          <span>Historia</span>
          <span>Agenda</span>
          <span>Regalos</span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 bg-[#fbf9f4] px-6 py-14 text-center">
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-accent">Nos casamos</span>
        <span className="font-display text-4xl text-foreground">Marta &amp; Javier</span>
        <span className="text-xs tracking-[0.2em] text-muted">18 · 10 · 2026 — Madrid</span>
        <span className="mt-4 rounded-full border border-foreground px-4 py-1.5 text-[0.7rem] font-medium">
          Confirmar asistencia
        </span>
      </div>
    </div>
  );
}

// Maqueta de una aportación a la lista de regalos.
function RegaloMock() {
  return (
    <div className="mx-auto max-w-sm rounded-xl border border-line bg-white p-6 shadow-[0_28px_60px_-30px_rgba(33,29,26,0.32)]">
      <div className="aspect-[4/3] w-full rounded-lg bg-[#efe9df]" />
      <p className="mt-4 font-display text-xl">Nuestra luna de miel</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div className="h-full w-2/3 rounded-full bg-accent" />
      </div>
      <p className="mt-2 text-xs text-muted">1.340 € de 2.000 € · 11 aportaciones</p>
      <div className="mt-5 flex items-center gap-2">
        <span className="flex-1 rounded-full bg-foreground px-4 py-2 text-center text-xs font-medium text-white">
          Aportar
        </span>
        <span className="rounded-full border border-line px-3 py-2 text-xs text-muted">Bizum</span>
      </div>
    </div>
  );
}
