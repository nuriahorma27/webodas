import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

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
            <div className="lp-rise lp-rise-4 mt-7 inline-flex items-center gap-3 rounded-2xl border border-[#d8c79e] bg-[#f5eddc] px-4 py-3 shadow-sm">
              <span className="font-display text-3xl leading-none text-[#526b51]">7</span>
              <span className="h-8 w-px bg-[#d8c79e]" />
              <span className="text-left">
                <strong className="block text-sm font-medium text-[#34483a]">días de prueba gratis</strong>
                <span className="mt-0.5 block text-[.68rem] text-muted">Probad la web, los regalos y la organización</span>
              </span>
            </div>
          </div>

          <div className="lp-rise lp-rise-3 relative mx-auto w-full max-w-xl lg:mx-0">
            <HeroOrganizacion />
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
            imgs={[]}
            visual={<EditorWebMockup />}
          />
          <Fila
            invertida
            eyebrow="Lista de regalos"
            titulo="Regalos por transferencia, Bizum o tarjeta"
            texto="Compartís la lista y los invitados aportan online. webodas no cobra comisión; con pago por tarjeta se aplica solo la tarifa de la pasarela de pago."
            puntos={["Regalos concretos o fondo común", "Veis quién ha aportado"]}
            imgs={[]}
            visual={<RegalosRusticos />}
          />
          <Fila
            eyebrow="Invitación y save the date"
            titulo="Invitación y save the date, con vuestro estilo"
            texto="La invitación clásica, con su tipografía y su formato. Se rellena y se descarga en PDF al tamaño real, lista para imprenta. El save the date se comparte por un enlace."
            puntos={["PDF listo para imprenta", "Save the date para avisar pronto"]}
            imgs={[
              ["/landing/invitacion-nueva.png", "Invitación de boda clásica", "1400 / 999"],
              ["/landing/savethedate-nuevo.jpeg", "Save the date en acuarela", "1054 / 1492"],
            ]}
          />
          <Fila
            invertida
            eyebrow="Organización"
            titulo="Presupuesto, tareas, invitados y mesas"
            texto="Lista de tareas ordenada por meses, presupuesto por partidas, lista de invitados con sus confirmaciones y plano de mesas. Al contratar un proveedor, el presupuesto se actualiza."
            puntos={["Exportable a Excel", "Editor visual de mesas"]}
            imgs={[]}
            visual={<GestionRealPreview />}
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

type Img = [src: string, alt: string, ratio: string];

function Cuadro({
  src,
  alt,
  ratio,
  priority,
}: {
  src: string;
  alt: string;
  ratio: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#d8ceba] bg-white p-2 shadow-[0_28px_65px_-30px_rgba(33,29,26,0.4)]">
      <Image
        src={src}
        alt={alt}
        width={1400}
        height={1000}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 560px"
        className="block w-full rounded-md"
        style={{ aspectRatio: ratio, objectFit: "cover", objectPosition: "top" }}
      />
    </div>
  );
}

function Fila({
  eyebrow,
  titulo,
  texto,
  puntos,
  invertida,
  imgs,
  visual,
}: {
  eyebrow: string;
  titulo: string;
  texto: string;
  puntos: string[];
  invertida?: boolean;
  imgs: Img[];
  visual?: ReactNode;
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
      <div
        className={`${invertida ? "lg:order-1" : ""} ${
          imgs.length > 1 ? "grid grid-cols-[1.35fr_1fr] items-start gap-4" : ""
        }`}
      >
        {visual ?? imgs.map(([src, alt, ratio]) => (
          <Cuadro key={src} src={src} alt={alt} ratio={ratio} />
        ))}
      </div>
    </div>
  );
}

function HeroOrganizacion() {
  return (
    <div className="relative rounded-[1.75rem] border border-[#ddd1bc] bg-[#f4eee3] p-4 shadow-[0_35px_80px_-35px_rgba(47,39,27,.45)] sm:p-6">
      <div className="rounded-2xl border border-[#ded5c7] bg-[#fffdfa] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[.62rem] uppercase tracking-[.22em] text-muted">Presupuesto total</p>
            <p className="mt-2 font-display text-4xl">80.000 €</p>
          </div>
          <span className="rounded-full bg-[#e9dfcd] px-3 py-1 text-[.65rem] text-[#765c31]">Todo bajo control</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4">
          {[["Estimado", "39.700 €"], ["Pagado", "12.450 €"], ["Pendiente", "27.250 €"]].map(([k,v]) => (
            <div key={k}><p className="text-[.55rem] uppercase tracking-wider text-muted">{k}</p><p className="mt-1 font-display text-lg sm:text-xl">{v}</p></div>
          ))}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee7dc]"><div className="h-full w-[31%] rounded-full bg-[#99783e]" /></div>
        <div className="mt-5 overflow-hidden rounded-lg border border-[#e7dfd2]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-[#f6f1e8] px-3 py-2 text-[.5rem] uppercase tracking-[.14em] text-muted">
            <span>Partida</span><span>Estimado</span><span>Pagado</span>
          </div>
          {[
            ["Finca y celebración", "14.500 €", "6.000 €", 42],
            ["Fotografía y vídeo", "3.200 €", "1.600 €", 50],
            ["Flores y decoración", "2.400 €", "600 €", 25],
          ].map(([nombre, estimado, pagado, avance]) => (
            <div key={nombre as string} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-[#eee7dc] px-3 py-2 text-[.62rem] first:border-t-0">
              <div><p className="text-foreground">{nombre}</p><div className="mt-1 h-1 w-20 overflow-hidden rounded bg-[#eee7dc]"><div className="h-full rounded bg-[#6a805f]" style={{ width: `${avance}%` }} /></div></div>
              <span className="text-muted">{estimado}</span><span className="font-medium text-[#4e6650]">{pagado}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative -mt-1 ml-auto w-[82%] rotate-[1.5deg] rounded-xl border border-[#ddd2c2] bg-white p-4 shadow-[0_18px_35px_-24px_rgba(33,29,26,.55)] sm:w-[72%]">
        <p className="text-[.6rem] uppercase tracking-[.2em] text-muted">Tareas de esta semana</p>
        <ul className="mt-2 space-y-2 text-xs">
          {["Cerrar el menú", "Confirmar la finca", "Enviar el save the date", "Revisar presupuesto"].map((t) => (
            <li key={t} className="flex items-center gap-2 text-muted line-through"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#50694e] text-[.55rem] text-white">✓</span>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EditorWebMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#cfcdbf] bg-[#f8f8f3] shadow-[0_28px_65px_-30px_rgba(33,50,35,.42)]">
      <div className="flex h-10 items-center justify-between border-b border-[#dcded4] bg-white px-3 text-[.58rem] text-[#687168]"><span>← Salir　 <b className="font-display text-sm text-[#26372c]">webodas</b></span><span>↶　 Restablecer　 <b className="rounded border border-[#637966] px-2 py-1 text-[#415a47]">Ver web</b>　 <b className="rounded bg-[#314a39] px-2 py-1 text-white">Publicar</b></span></div>
      <div className="grid grid-cols-[21%_1fr_23%]">
        <div className="border-r border-[#dcded4] bg-white p-2.5 text-[.5rem] text-[#536056]">
          <b className="text-[.58rem] text-[#25342a]">Secciones de la web</b>
          <div className="mt-3 space-y-1.5">{["Ajustes de la página","Portada","Listado de ítems","Galería","Cómo llegar","Formulario de confirmación"].map((x,i)=><p key={x} className={i===0?"rounded bg-[#314a39] px-2 py-2 text-white":"rounded px-2 py-1.5 hover:bg-[#eef1eb]"}>{x}</p>)}</div>
        </div>
        <div className="min-h-72 overflow-hidden bg-white p-3">
          <div className="grid h-52 grid-cols-[.92fr_1.08fr] overflow-hidden border border-[#ecece5] bg-[#fbfbf7]">
            <div className="flex flex-col justify-center px-5 text-[#46604c]"><p className="text-[.47rem] uppercase tracking-[.35em]">Nos casamos</p><p className="mt-4 font-display text-[1.8rem] leading-[.95]">Marta &<br/>Javier</p><p className="mt-4 font-display text-[.7rem] tracking-[.18em]">6 de junio de 2026</p></div>
            <div className="relative"><Image src="/landing/editor-acuarela.png" alt="Portada en acuarela dentro del editor" fill sizes="360px" className="object-cover" /></div>
          </div>
          <p className="py-5 text-center font-display text-xl text-[#405746]">El día</p>
        </div>
        <div className="border-l border-[#dcded4] bg-white p-2.5 text-[.5rem] text-[#637066]"><b className="text-[.58rem] text-[#26372c]">Ajustes de la página</b><p className="mt-4 font-medium text-[#35483a]">Color principal</p><div className="mt-2 flex flex-wrap gap-1">{["#f8f7f1","#314a39","#526b51","#8fa187","#d8c9a5"].map(c=><span key={c} className="h-5 w-5 rounded border border-[#cfd4ca]" style={{background:c}} />)}</div><p className="mt-4 font-medium text-[#35483a]">Color de fondo</p><div className="mt-2 h-7 rounded border border-[#d6dbd1] bg-[#f3f5ef]" /><p className="mt-4 font-medium text-[#35483a]">Barra de navegación</p><div className="mt-2 grid grid-cols-2 overflow-hidden rounded border border-[#d6dbd1]"><span className="bg-[#e9eee7] py-1 text-center">No</span><span className="py-1 text-center">Sí</span></div></div>
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
  return <div className="grid grid-cols-3 gap-2 sm:gap-3">{regalos.map(([src,nombre,precio])=><div key={src} className="overflow-hidden rounded-xl border border-[#d8ceba] bg-white shadow-sm"><div className="relative aspect-[4/3]"><Image src={src} alt={nombre} fill sizes="180px" className="object-cover" /></div><div className="p-2.5"><p className="font-display text-sm sm:text-lg">{nombre}</p><p className="mt-1 text-[.6rem] text-muted">Objetivo · {precio}</p><div className="mt-2 h-1 rounded bg-[#eee8dd]"><div className="h-full w-[55%] rounded bg-[#98783f]" /></div></div></div>)}</div>;
}

function GestionRealPreview() {
  return (
    <div className="relative min-w-0 max-w-full overflow-hidden sm:grid sm:grid-cols-[1.08fr_.92fr] sm:items-start sm:gap-3">
      <div className="min-w-0 w-[84%] overflow-hidden rounded-xl border border-[#d8ceba] bg-white p-2 shadow-[0_28px_65px_-30px_rgba(33,29,26,.4)] sm:w-auto">
        <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: "809 / 1150" }}>
          <Image src="/landing/gestion.png" alt="Pantalla real de presupuesto y tareas" fill sizes="360px" className="object-cover object-top" />
        </div>
      </div>
      <div className="absolute bottom-4 right-0 z-10 min-w-0 w-[62%] max-w-full overflow-hidden rounded-xl border border-[#d8ceba] bg-white p-3 shadow-[0_24px_50px_-22px_rgba(33,29,26,.55)] sm:static sm:mt-10 sm:w-auto">
        <p className="font-display text-lg">Mesas</p>
        <p className="mt-0.5 text-[.55rem] text-muted">1 mesa · 5/10 plazas ocupadas · 46 sin mesa</p>
        <div className="mt-3 rounded-lg border border-[#dfd5c4] p-2.5">
          <div className="flex min-w-0 items-center justify-between gap-1">
            <span className="rounded bg-[#211f1c] px-2 py-1 text-[.48rem] font-semibold text-white">MESA 1</span>
            <span className="min-w-0 truncate rounded-full border border-[#9b793b] px-2 py-1 text-[.46rem] text-[#80632f]">★ Presidencial</span>
          </div>
          <p className="mt-2 rounded border border-[#e3dacb] px-2 py-1 text-[.55rem]">Mesa familia</p>
          <p className="mt-1.5 text-[.46rem] text-muted">Redonda · 10 plazas · 5 sentados</p>
          <div className="relative mx-auto mt-3 aspect-square w-full max-w-32">
            <div className="absolute inset-[22%] rounded-full border border-[#c9b58e] bg-[#f8f5ee]" />
            {["1","2","3","4","5","6","7","8","9","10"].map((seat, index) => {
              const angle = (index * 36 - 90) * Math.PI / 180;
              const left = 50 + Math.cos(angle) * 43;
              const top = 50 + Math.sin(angle) * 43;
              return <span key={seat} className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[.42rem] ${index < 5 ? "border-[#a88952] bg-white text-[#27241f]" : "border-dashed border-[#ddd2bf] bg-white text-[#9b9488]"}`} style={{left:`${left}%`,top:`${top}%`}}>{seat}</span>;
            })}
          </div>
          <div className="mt-3 space-y-1.5">
            {["Javier Urrecho Díaz","Laura Méndez Gil","Rosario Pascual","Carmen Contreras"].map((guest, index) => <div key={guest} className="flex min-w-0 items-center gap-1.5 text-[.46rem]"><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[.38rem] text-white ${index === 1 ? "bg-emerald-600" : "bg-[#a9864d]"}`}>{index === 1 ? "✓" : "P"}</span><span className="min-w-0 truncate">{guest}</span></div>)}
          </div>
          <div className="mt-3 rounded border border-dashed border-[#d8ceba] py-1.5 text-center text-[.46rem] text-[#8a6d3b]">+ Sentar invitado</div>
        </div>
      </div>
    </div>
  );
}
