import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "webodas · Toda vuestra boda en un solo sitio",
  description:
    "La web de boda, la lista de regalos, las invitaciones y la organización del día, en un mismo panel. Prueba gratis de 7 días.",
};

const pasos = [
  ["Creáis la cuenta", "7 días de prueba gratis."],
  ["Montáis la web", "Elegís una plantilla y la adaptáis a vuestra boda."],
  ["Abrís la lista de regalos", "Transferencia, Bizum o tarjeta."],
  ["Organizáis el resto", "Presupuesto, tareas, invitados y mesas."],
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24">
          <div>
            <p className="lp-rise lp-rise-1 text-xs uppercase tracking-[0.28em] text-accent">
              Organización de bodas
            </p>
            <h1 className="lp-rise lp-rise-2 mt-5 font-display text-[2.9rem] leading-[1.06] tracking-tight sm:text-6xl">
              Toda vuestra boda,
              <br />
              <span className="italic text-accent">en un solo sitio.</span>
            </h1>
            <p className="lp-rise lp-rise-3 mt-6 max-w-md text-lg leading-relaxed text-muted">
              La web de boda, la lista de regalos, las invitaciones y la organización del día. Todo
              en el mismo panel.
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
                Ver qué incluye
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>
            <p className="lp-rise lp-rise-4 mt-6 text-xs text-muted">
              7 días de prueba gratis
            </p>
          </div>

          <div className="lp-rise lp-rise-3 relative mx-auto w-full max-w-xl lg:mx-0">
            <Marco>
              <Image
                src="/landing/web.png"
                alt="Web de boda creada con webodas"
                width={1263}
                height={1400}
                priority
                className="w-full"
                style={{ aspectRatio: "1263 / 760", objectFit: "cover", objectPosition: "top" }}
              />
            </Marco>
            <div
              className="absolute -bottom-9 -left-6 hidden w-56 rounded-xl border border-line bg-white p-4 shadow-[0_20px_45px_-20px_rgba(33,29,26,0.3)] sm:block"
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

      {/* franja */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 text-center sm:grid-cols-3">
          {[
            ["7 días gratis", "para probarlo con calma"],
            ["En español", "hecho para bodas de aquí"],
            ["Un panel", "web, regalos, invitaciones y gestión"],
          ].map(([n, d]) => (
            <div key={n}>
              <p className="font-display text-2xl">{n}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* producto */}
      <section id="producto" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 lg:py-28">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-accent">Qué incluye</p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Cuatro herramientas, un mismo panel.
          </h2>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28">
          <Fila
            eyebrow="Web de boda"
            titulo="Vuestra web, con vuestro enlace"
            texto="Editor visual con plantillas. Portada, cuenta atrás, agenda del día, cómo llegar, galería y confirmación de asistencia. Se edita desde el ordenador y se ve bien en el móvil."
            puntos={["Sin saber de diseño", "Enlace con vuestros nombres"]}
            imgs={[["/landing/web.png", "Web de boda de ejemplo", "1263 / 1040"]]}
          />
          <Fila
            invertida
            eyebrow="Lista de regalos"
            titulo="Regalos por transferencia, Bizum o tarjeta"
            texto="Compartís la lista y los invitados aportan online. webodas no cobra comisión; con pago por tarjeta se aplica solo la tarifa de la pasarela de pago."
            puntos={["Regalos concretos o fondo común", "Veis quién ha aportado"]}
            imgs={[["/landing/regalos.png", "Lista de regalos en la web de boda", "1400 / 640"]]}
          />
          <Fila
            eyebrow="Invitación y save the date"
            titulo="La participación de siempre, y el save the date"
            texto="La invitación clásica, con su tipografía y su formato. Se rellena y se descarga en PDF al tamaño real, lista para imprenta. El save the date se comparte por un enlace."
            puntos={["PDF listo para imprenta", "Save the date para avisar pronto"]}
            imgs={[
              ["/landing/invitacion.png", "Invitación de boda", "1400 / 900"],
              ["/landing/savethedate.png", "Save the date", "905 / 1080"],
            ]}
          />
          <Fila
            invertida
            eyebrow="Organización"
            titulo="Presupuesto, tareas, invitados y mesas"
            texto="Lista de tareas ordenada por meses, presupuesto por partidas, lista de invitados con sus confirmaciones y plano de mesas. Al contratar un proveedor, el presupuesto se actualiza."
            puntos={["Exportable a Excel", "Plano de mesas para imprimir"]}
            imgs={[["/landing/gestion.png", "Panel de organización de la boda", "809 / 950"]]}
          />
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
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Empezad la web de vuestra boda
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Prueba gratis de 7 días.
          </p>
          <Link
            href="/inicio?crear=1"
            className="mt-8 inline-block rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Empezar gratis
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

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d8ceba] bg-white shadow-[0_30px_70px_-28px_rgba(33,29,26,0.45)] ring-1 ring-black/[0.03]">
      <div className="flex items-center gap-1.5 border-b border-line bg-[#f6f2ec] px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
      </div>
      {children}
    </div>
  );
}

type Img = [src: string, alt: string, ratio: string];

function Fila({
  eyebrow,
  titulo,
  texto,
  puntos,
  invertida,
  imgs,
}: {
  eyebrow: string;
  titulo: string;
  texto: string;
  puntos: string[];
  invertida?: boolean;
  imgs: Img[];
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={invertida ? "lg:order-2" : ""}>
        <p className="text-xs uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight sm:text-[2.1rem]">{titulo}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-muted">{texto}</p>
        <ul className="mt-5 space-y-2">
          {puntos.map((pt) => (
            <li key={pt} className="flex items-start gap-2.5 text-sm">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div className={`${invertida ? "lg:order-1" : ""} ${imgs.length > 1 ? "space-y-5" : ""}`}>
        {imgs.map(([src, alt, ratio]) => (
          <Marco key={src}>
            <Image
              src={src}
              alt={alt}
              width={1400}
              height={1000}
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 560px"
              className="block w-full"
              style={{ aspectRatio: ratio, objectFit: "cover", objectPosition: "top" }}
            />
          </Marco>
        ))}
      </div>
    </div>
  );
}
