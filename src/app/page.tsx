import Link from "next/link";

const servicios = [
  {
    titulo: "Vuestra web de boda",
    desc: "Un editor visual para montar vuestra página: portada, historia, agenda del día, galería, cómo llegar y confirmación de asistencia. Sin saber nada de diseño.",
  },
  {
    titulo: "Lista de regalos",
    desc: "Compartís vuestra lista y los invitados contribuyen online por transferencia, Bizum o tarjeta. El dinero llega directo a vuestra cuenta.",
  },
  {
    titulo: "Gestión del gran día",
    desc: "Presupuesto, proveedores, tareas por meses, invitados, mesas y confirmaciones, todo en un mismo panel.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl tracking-tight">webodas</span>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#servicios" className="hidden text-muted hover:text-foreground sm:inline">
              Servicios
            </a>
            <a href="#como" className="hidden text-muted hover:text-foreground sm:inline">
              Cómo funciona
            </a>
            <Link
              href="/inicio"
              className="rounded-md bg-foreground px-4 py-2 font-medium text-white hover:opacity-90"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Organización de bodas</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">
          Toda vuestra boda,
          <br />
          en un solo sitio.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Cread vuestra página web, compartid la lista de regalos y organizad cada detalle del día
          más importante. Fácil, bonito y sin agobios.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/inicio?crear=1"
            className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Empezar gratis
          </Link>
          <a
            href="#servicios"
            className="rounded-md border border-line px-6 py-3 text-sm font-medium hover:bg-accent-soft"
          >
            Ver qué incluye
          </a>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl">Qué incluye</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {servicios.map((s) => (
              <div key={s.titulo} className="rounded-xl border border-line bg-background p-6">
                <h3 className="font-display text-xl">{s.titulo}</h3>
                <p className="mt-3 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="mx-auto max-w-4xl px-5 py-20">
        <h2 className="font-display text-3xl">Cómo funciona</h2>
        <ol className="mt-8 space-y-6">
          {[
            ["Creáis vuestra cuenta", "Con un email y una contraseña entráis a vuestro panel."],
            ["Montáis vuestra web", "Elegís una plantilla y la personalizáis a vuestro gusto."],
            [
              "Configuráis la lista de regalos",
              "Elegís cómo queréis recibir las aportaciones y añadís los regalos.",
            ],
            ["Organizáis el resto", "Tareas, presupuesto, invitados y confirmaciones, todo junto."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-accent">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{t}</p>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link
            href="/inicio?crear=1"
            className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Empezar ahora
          </Link>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-lg text-foreground">webodas</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal" className="hover:text-foreground">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
            <a href="mailto:hola@webodas.com" className="hover:text-foreground">
              hola@webodas.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
